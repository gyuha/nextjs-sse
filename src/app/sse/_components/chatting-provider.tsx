'use client';
import { Channel, Message } from "@/components/chatting/types";
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

interface ChattingProviderState {
  channelId: string;
  channels: Channel[];
  messages: Message[];
  sendMessage: (content: string, sender: string) => Promise<void>;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

interface ChattingContextType extends ChattingProviderState {
  setChannelId: React.Dispatch<React.SetStateAction<string>>;
}

const ChattingContext = createContext<ChattingContextType | undefined>(undefined);

interface ChattingProviderProps {
  children: React.ReactNode;
}

export const ChattingProvider: React.FC<ChattingProviderProps> = ({
  children,
}: ChattingProviderProps) => {
  const [channelId, setChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // 현재 이벤트 소스 참조를 저장하기 위한 ref
  const eventSourceRef = useRef<EventSource | null>(null);
  // 연결 재시도 타이머 참조
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 연결 재시도 횟수
  const retryCountRef = useRef<number>(0);
  // 최대 재시도 횟수
  const MAX_RETRY_COUNT = 3;

  const channels: Channel[] = [
    { id: "general", name: "General" },
    { id: "random", name: "Random", unreadCount: 3 },
    { id: "support", name: "Support", unreadCount: 1 },
    { id: "team", name: "Team" },
  ];

  // 메시지 전송 함수
  const sendMessage = async (content: string, sender: string) => {
    if (!content.trim() || !sender.trim()) return;
    if (connectionStatus !== 'connected') {
      console.warn('SSE 연결이 활성화되지 않았습니다. 메시지를 보낼 수 없습니다.');
      return;
    }

    const message: Partial<Message> = {
      channelId,
      content,
      sender,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`/api/sse/${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('메시지 전송 실패');
      }

      console.log('메시지 전송됨:', message);
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }
  };

  // 채널별 SSE 연결 생성
  const createSSEConnection = useCallback((targetChannelId: string) => {
    console.log(`채널 ${targetChannelId}에 SSE 연결 시도 중...`);
    setConnectionStatus('connecting');
    
    let hasReceivedMessage = false;
    
    try {
      // 새 이벤트 소스 생성
      const eventSource = new EventSource(`/api/sse/${targetChannelId}`);
      
      // 기본 onopen 핸들러 (표준 이벤트 핸들러)
      eventSource.onopen = (event) => {
        console.log(`채널 ${targetChannelId} SSE 연결 열림:`, event);
        setConnectionStatus('connected');
        retryCountRef.current = 0;
      };
      
      // 기본 onmessage 핸들러 (표준 이벤트 핸들러)
      eventSource.onmessage = (event) => {
        try {
          hasReceivedMessage = true;
          const parsedData = JSON.parse(event.data);
          console.log(`채널 ${targetChannelId} SSE 메시지 수신:`, parsedData);
          
          if (parsedData.type === 'connect') {
            console.log('연결 성공 메시지:', parsedData);
            setConnectionStatus('connected');
          } else if (parsedData.type === 'message' && parsedData.data) {
            const newMessage = parsedData.data as Message;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          } else if (parsedData.type === 'ping') {
            console.log(`채널 ${targetChannelId} 핑 메시지 수신:`, parsedData.timestamp);
          }
        } catch (error) {
          console.error(`메시지 파싱 오류:`, error, event.data);
        }
      };
      
      // 기본 onerror 핸들러 (표준 이벤트 핸들러)
      eventSource.onerror = (error) => {
        console.error(`채널 ${targetChannelId} SSE 연결 오류:`, error);
        
        // 메시지를 받았다가 연결이 끊어진 경우는 즉시 재연결 시도
        if (hasReceivedMessage) {
          setConnectionStatus('connecting');
          eventSource.close();
          setTimeout(() => {
            createSSEConnection(targetChannelId);
          }, 1000);
          return;
        }
        
        // 아직 메시지를 받지 못한 경우는 재시도 로직 적용
        if (retryCountRef.current < MAX_RETRY_COUNT) {
          setConnectionStatus('connecting');
          eventSource.close();
          
          const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          console.log(`채널 ${targetChannelId} SSE 연결 재시도 ${retryCountRef.current + 1}/${MAX_RETRY_COUNT} (${retryDelay}ms 후)`);
          
          retryTimerRef.current = setTimeout(() => {
            retryCountRef.current++;
            createSSEConnection(targetChannelId);
          }, retryDelay);
        } else {
          setConnectionStatus('disconnected');
          eventSource.close();
          console.error(`채널 ${targetChannelId} SSE 연결 최대 재시도 횟수 초과`);
        }
      };
      
      // 이벤트 소스 반환
      return eventSource;
    } catch (error) {
      console.error(`채널 ${targetChannelId} SSE 연결 생성 중 오류:`, error);
      setConnectionStatus('disconnected');
      return null;
    }
  }, []);

  // 채널 변경 시 SSE 연결 관리
  useEffect(() => {
    // 기존 SSE 연결 정리
    if (eventSourceRef.current) {
      console.log(`기존 SSE 연결 종료 중...`);
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // 기존 타이머 정리
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    // 재시도 카운트 초기화
    retryCountRef.current = 0;
    
    // 채널 변경 시 메시지 배열 초기화
    setMessages([]);
    
    // 새 SSE 연결 생성
    console.log(`채널 ${channelId}에 새 SSE 연결 생성 중...`);
    const eventSource = createSSEConnection(channelId);
    eventSourceRef.current = eventSource;
    
    // 클린업 함수
    return () => {
      if (eventSourceRef.current) {
        console.log(`컴포넌트 언마운트: SSE 연결 정리 중...`);
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [channelId, createSSEConnection]);

  return (
    <ChattingContext.Provider value={{ 
      channelId, 
      channels, 
      messages, 
      setChannelId, 
      sendMessage,
      connectionStatus
    }}>
      {children}
    </ChattingContext.Provider>
  );
};

export const useChattingProvider = () => {
  const context = useContext(ChattingContext);
  if (!context) {
    throw new Error(
      "useChattingProvider must be used within a ChattingProvider"
    );
  }
  return context;
};
