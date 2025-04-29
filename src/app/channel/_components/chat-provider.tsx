"use client";
import { useChannelContext } from "@/app/(room)/_components/channel-provider";
import type {
  Channel,
  ConnectionStatus,
  DirectMessage,
  Message,
  User,
} from "@/types";
import type React from "react";
import { use } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

interface ChattingProviderState {
  messages: Message[];
  username: string;
  userId: string;
  connectionStatus: "disconnected" | "connecting" | "connected";
  channelUsers: User[];
  connectionCount: number;
}

interface ChattingContextType extends ChattingProviderState {
}

const ChattingContext = createContext<ChattingContextType | undefined>(
  undefined
);

interface ChattingProviderProps {
  children: React.ReactNode;
}

export const ChattingProvider: React.FC<ChattingProviderProps> = ({
  children,
}: ChattingProviderProps) => {
  const { channels, username, userId, currentChannelId } = useChannelContext();
  console.log('📢[chat-provider.tsx:45]: currentChannelId: ', currentChannelId);
  console.log('📢[chat-provider.tsx:48]: userId: ', userId);
  console.log('📢[chat-provider.tsx:48]: username: ', username);
  console.log('📢[chat-provider.tsx:48]: channels: ', channels);

  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [channelUsers, setChannelUsers] = useState<User[]>([]);
  const [connectionCount, setConnectionCount] = useState<number>(0);

  // 현재 이벤트 소스 참조를 저장하기 위한 ref
  const eventSourceRef = useRef<EventSource | null>(null);
  // 연결 재시도 타이머 참조
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 연결 재시도 횟수
  const retryCountRef = useRef<number>(0);
  // 최대 재시도 횟수
  const MAX_RETRY_COUNT = 3;


  // 채널별 SSE 연결 생성
  const createSSEConnection = useCallback(
    (targetChannelId: string) => {
      console.log(`채널 ${targetChannelId}에 SSE 연결 시도 중...`);
      setConnectionStatus("connecting");

      let hasReceivedMessage = false;

      try {
        // URL에 사용자 정보 추가
        const url = new URL(
          `/api/sse/channel/${targetChannelId}`,
          window.location.origin
        );
        url.searchParams.append("userName", username);
        url.searchParams.append("userId", userId);

        // 새 이벤트 소스 생성
        const eventSource = new EventSource(url.toString());

        // 기본 onopen 핸들러 (표준 이벤트 핸들러)
        eventSource.onopen = (event) => {
          console.log(`채널 ${targetChannelId} SSE 연결 열림:`, event);
          setConnectionStatus("connected");
          retryCountRef.current = 0;
        };

        // 기본 onmessage 핸들러 (표준 이벤트 핸들러)
        eventSource.onmessage = (event) => {
          try {
            hasReceivedMessage = true;
            const parsedData = JSON.parse(event.data);
            console.log(`채널 ${targetChannelId} SSE 메시지 수신:`, parsedData);

            if (parsedData.type === "connect") {
              console.log("연결 성공 메시지:", parsedData);
              setConnectionStatus("connected");
              setConnectionCount(parsedData.connectionCount || 0);
              if (parsedData.users) {
                setChannelUsers(parsedData.users);
              }
            } else if (parsedData.type === "message" && parsedData.data) {
              const newMessage = parsedData.data as Message;
              setMessages((prevMessages) => [...prevMessages, newMessage]);
            } else if (parsedData.type === "ping") {
              console.log(
                `채널 ${targetChannelId} 핑 메시지 수신:`,
                parsedData.timestamp
              );
              setConnectionCount(parsedData.connectionCount || 0);
            } else if (parsedData.type === "user-event" && parsedData.event) {
              const userEvent = parsedData.event;
              console.log("사용자 이벤트 수신:", userEvent);

              if (userEvent.type === "join") {
                setChannelUsers((prev) => {
                  // 이미 존재하는 사용자라면 추가하지 않음
                  const exists = prev.some((u) => u.id === userEvent.user.id);
                  if (exists) return prev;
                  return [...prev, userEvent.user];
                });
                setConnectionCount((prev) => prev + 1);
              } else if (userEvent.type === "leave") {
                setChannelUsers((prev) =>
                  prev.filter((u) => u.id !== userEvent.user.id)
                );
                setConnectionCount((prev) => Math.max(0, prev - 1));
              }
            }
          } catch (error) {
            console.error("메시지 파싱 오류:", error, event.data);
          }
        };

        // 기본 onerror 핸들러 (표준 이벤트 핸들러)
        eventSource.onerror = (error) => {
          console.error(`채널 ${targetChannelId} SSE 연결 오류:`, error);

          // 메시지를 받았다가 연결이 끊어진 경우는 즉시 재연결 시도
          if (hasReceivedMessage) {
            setConnectionStatus("connecting");
            eventSource.close();
            setTimeout(() => {
              createSSEConnection(currentChannelId);
            }, 1000);
            return;
          }

          // 아직 메시지를 받지 못한 경우는 재시도 로직 적용
          if (retryCountRef.current < MAX_RETRY_COUNT) {
            setConnectionStatus("connecting");
            eventSource.close();

            const retryDelay = Math.min(
              1000 * (retryCountRef.current ** 2),
              10000
            );
            console.log(
              `채널 ${targetChannelId} SSE 연결 재시도 ${
                retryCountRef.current + 1
              }/${MAX_RETRY_COUNT} (${retryDelay}ms 후)`
            );

            retryTimerRef.current = setTimeout(() => {
              retryCountRef.current++;
              createSSEConnection(currentChannelId);
            }, retryDelay);
          } else {
            setConnectionStatus("disconnected");
            eventSource.close();
            console.error(
              `채널 ${targetChannelId} SSE 연결 최대 재시도 횟수 초과`
            );
          }
        };

        // 이벤트 소스 반환
        return eventSource;
      } catch (error) {
        console.error(`채널 ${targetChannelId} SSE 연결 생성 중 오류:`, error);
        setConnectionStatus("disconnected");
        return null;
      }
    },
    [currentChannelId]
  );

  // 채널 변경 시 SSE 연결 관리
  useEffect(() => {
    // 기존 SSE 연결 정리
    if (eventSourceRef.current) {
      console.log('기존 SSE 연결 종료 중...');
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
    setChannelUsers([]);
    setConnectionCount(0);

    // 새 SSE 연결 생성
    console.log(`채널 ${currentChannelId}에 새 SSE 연결 생성 중...`);
    const eventSource = createSSEConnection(currentChannelId);
    eventSourceRef.current = eventSource;

    // 클린업 함수
    return () => {
      if (eventSourceRef.current) {
        console.log('컴포넌트 언마운트: SSE 연결 정리 중...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [currentChannelId, createSSEConnection]);

  return (
    <ChattingContext.Provider
      value={{
        messages,
        username,
        userId,
        connectionStatus,
        channelUsers,
        connectionCount,
      }}
    >
      {children}
    </ChattingContext.Provider>
  );
};

export const useChattingContext = () => {
  const context = useContext(ChattingContext);
  if (!context) {
    throw new Error(
      "useChattingProvider must be used within a ChattingProvider"
    );
  }
  return context;
};
