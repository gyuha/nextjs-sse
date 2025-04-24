'use client';
import { Channel, Message } from "@/components/chatting/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ChattingProviderState {
  channelId: string;
  channels: Channel[];
  messages: Message[];
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

  const channels: Channel[] = [
    { id: "general", name: "General" },
    { id: "random", name: "Random", unreadCount: 3 },
    { id: "support", name: "Support", unreadCount: 1 },
    { id: "team", name: "Team" },
  ]

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Received:", data);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, data];
        return newMessages;
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <ChattingContext.Provider value={{ channelId, channels, messages, setChannelId }}>
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
