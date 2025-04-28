"use client";
import type { Channel, ChannelEvent, ConnectionStatus } from "@/types";
import { DEFAULT_CHANNEL_ID } from "@/types";
import { faker } from "@faker-js/faker/locale/ko";
import type React from "react";
import { use } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface ChannelContextState {
  currentChannelId: string;
  username: string;
  userId: string;
  channels: Channel[];
  totalConnectionCount: number;
  connectionStatus: ConnectionStatus;
}

interface ChannelContextAction extends ChannelContextState {
  setCurrentChannelId: React.Dispatch<React.SetStateAction<string>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const ChannelContext = createContext<ChannelContextAction | undefined>(
  undefined
);

interface ChannelProviderProps {
  children: React.ReactNode;
}

export const ChannelProvider: React.FC<ChannelProviderProps> = ({
  children,
}: ChannelProviderProps) => {
  const [currentChannelId, setCurrentChannelId] =
    useState<string>(DEFAULT_CHANNEL_ID);
  const [username, setUsername] = useState<string>(faker.person.fullName());
  const [userId, setUserId] = useState<string>(crypto.randomUUID());
  const [channels, setChannels] = useState<Channel[]>([]);
  const [totalConnectionCount, setTotalConnectionCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  // 컴포넌트가 마운트되면 localStorage에서 username 가져오기
  useEffect(() => {
    const savedUsername = localStorage.getItem("chatUsername");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // 현재 이벤트 소스 참조를 저장하기 위한 ref
  const eventSourceRef = useRef<EventSource | null>(null);
  // 연결 재시도 타이머 참조
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 연결 재시도 횟수
  const retryCountRef = useRef<number>(0);
  // 최대 재시도 횟수
  const MAX_RETRY_COUNT = 3;

  const createSSEConnection = useCallback(() => {
    setConnectionStatus("connecting");
    let hasReceivedMessage = false;

    try {
      // URL에 사용자 정보 추가
      const url = new URL("/api/sse", window.location.origin);

      // 새 이벤트 소스 생성
      const eventSource = new EventSource(url.toString());

      // 기본 onopen 핸들러 (표준 이벤트 핸들러)
      eventSource.onopen = (event) => {
        console.log("SSE 연결 열림:", event);
        retryCountRef.current = 0;
      };

      // 기본 onmessage 핸들러 (표준 이벤트 핸들러)
      eventSource.onmessage = (event) => {
        try {
          hasReceivedMessage = true;
          const parsedData = JSON.parse(event.data) as ChannelEvent;
          console.log("SSE 메시지 수신:", parsedData);

          if (parsedData.type !== "ping") {
            console.log("연결 성공 메시지:", parsedData);
            setConnectionStatus("connected");
            setTotalConnectionCount(parsedData.connectionCount || 0);
            setChannels(parsedData.channels || []);
            console.log("채널 생성/업데이트 메시지:", parsedData);
          } else {
            console.log("ping 메시지 수신:", parsedData);
            setTotalConnectionCount(parsedData.connectionCount || 0);
          }
        } catch (error) {
          console.error("메시지 파싱 오류:", error, event.data);
        }
      };

      // 기본 onerror 핸들러 (표준 이벤트 핸들러)
      eventSource.onerror = (error) => {
        console.error("SSE 연결 오류:", error);

        // 메시지를 받았다가 연결이 끊어진 경우는 즉시 재연결 시도
        if (hasReceivedMessage) {
          setConnectionStatus("connecting");
          eventSource.close();
          setTimeout(() => {
            createSSEConnection();
          }, 1000);
          return;
        }

        // 아직 메시지를 받지 못한 경우는 재시도 로직 적용
        if (retryCountRef.current < MAX_RETRY_COUNT) {
          setConnectionStatus("connecting");
          eventSource.close();

          const retryDelay = Math.min(1000 * 2 ** retryCountRef.current, 10000);
          console.log(
            `SSE 연결 재시도 ${
              retryCountRef.current + 1
            }/${MAX_RETRY_COUNT} (${retryDelay}ms 후)`
          );

          retryTimerRef.current = setTimeout(() => {
            retryCountRef.current++;
            createSSEConnection();
          }, retryDelay);
        } else {
          setConnectionStatus("disconnected");
          eventSource.close();
          console.error("SSE 연결 최대 재시도 횟수 초과");
        }
      };

      // 이벤트 소스 반환
      return eventSource;
    } catch (error) {
      console.error("SSE 연결 생성 중 오류:", error);
      setConnectionStatus("disconnected");
      return null;
    }
  }, []);

  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const eventSource = createSSEConnection();

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSourceRef.current) {
        console.log("기존 SSE 연결 종료 중...");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [createSSEConnection]);

  return (
    <ChannelContext.Provider
      value={{
        currentChannelId,
        username,
        userId,
        channels,
        connectionStatus,
        setUsername,
        totalConnectionCount,
        setCurrentChannelId,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannelContext = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannelContext must be used within a ChannelProvider");
  }
  return context;
};
