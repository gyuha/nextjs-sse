import { Message } from "@/components/chatting/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface chattingProviderState {
  channelId: string;
  messages: Message[];
}

interface chattingProvider extends chattingProviderState {
  setChannelId: React.Dispatch<React.SetStateAction<string>>;
}

const chattingProvider = createContext<chattingProvider | undefined>(undefined);

interface chattingProviderProps {
  children: React.ReactNode;
}

export const ChattingProvider: React.FC<chattingProviderProps> = ({
  children,
}: chattingProviderProps) => {
  const [channelId, setChannelId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

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
    <chattingProvider.Provider value={{ channelId, messages, setChannelId }}>
      {children}
    </chattingProvider.Provider>
  );
};

export const useChattingProvider = () => {
  const context = useContext(chattingProvider);
  if (!context) {
    throw new Error(
      "usechatting-provider must be used within a chatting-provider"
    );
  }
  return context;
};
