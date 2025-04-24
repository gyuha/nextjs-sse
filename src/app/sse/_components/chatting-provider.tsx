'use client';
import { Channel, Message } from "@/components/chatting/types";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  const channels: Channel[] = [
    { id: "general", name: "General" },
    { id: "random", name: "Random", unreadCount: 3 },
    { id: "support", name: "Support", unreadCount: 1 },
    { id: "team", name: "Team" },
  ]

  // 메시지 전송 함수
  const sendMessage = async (content: string, sender: string) => {
    if (!content.trim() || !sender.trim()) return;

    const message: Partial<Message> = {
      channelId,
      content,
      sender,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/sse', {
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

  useEffect(() => {
    console.log('SSE 연결 시도 중...');
    setConnectionStatus('connecting');

    // EventSource 객체 생성
    const eventSource = new EventSource('/api/sse');

    // 연결 열림 이벤트 핸들러
    eventSource.onopen = () => {
      console.log('SSE 연결 성공');
      setConnectionStatus('connected');
    };

    // 이벤트 메시지 처리
    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log('SSE 메시지 수신:', parsedData);

        // 메시지 유형에 따라 처리
        if (parsedData.type === 'message' && parsedData.data) {
          const newMessage = parsedData.data as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } else if (parsedData.type === 'connect') {
          console.log('연결 성공 메시지:', parsedData);
        } else if (parsedData.type === 'ping') {
          console.log('핑 메시지 수신:', parsedData.timestamp);
        }
      } catch (error) {
        console.error('SSE 메시지 파싱 오류:', error, event.data);
      }
    };

    // 에러 처리
    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      setConnectionStatus('disconnected');
      // 연결 재시도 로직을 여기에 추가할 수 있습니다
      eventSource.close();
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('SSE 연결 종료 중...');
      eventSource.close();
      setConnectionStatus('disconnected');
    };
  }, []);

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
