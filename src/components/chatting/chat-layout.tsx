"use client";

import { useState, useEffect } from "react";
import { ChannelList } from "./channel-list";
import { DirectMessageList } from "./direct-message-list";
import { ChannelHeader } from "./channel-header";
import { MessageArea } from "./message-area";
import { MessageInput } from "./message-input";
import { Channel, DirectMessage, Message } from "./types";

export function ChatLayout() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>("general");

  // 채널이 변경될 때마다 메시지 초기화
  useEffect(() => {
    setMessages([]);
    // 실제 SSE 구현에서는 여기서 채널 구독을 변경
  }, [currentChannel]);

  // 메시지 전송 함수
  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: "You",
      timestamp: new Date().toLocaleTimeString(),
      channelId: currentChannel,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      {/* Left sidebar */}
      <div className="w-64 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold">Channels</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChannelList />
        </div>
      </div>

      {/* Right chat area */}
      <div className="flex-1 flex flex-col">
        <ChannelHeader />
        <MessageArea />
        <MessageInput />
      </div>
    </div>
  );
}