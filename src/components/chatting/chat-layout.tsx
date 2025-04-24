"use client";

import { useState, useEffect } from "react";
import { ChannelList } from "./channel-list";
import { DirectMessageList } from "./direct-message-list";
import { ChannelHeader } from "./channel-header";
import { MessageArea } from "./message-area";
import { MessageInput } from "./message-linput";
import { Channel, DirectMessage, Message } from "./types";

export function ChatLayout() {
  const [channels, setChannels] = useState<Channel[]>([
    { id: "general", name: "General" },
    { id: "random", name: "Random", unreadCount: 3 },
    { id: "support", name: "Support", unreadCount: 1 },
    { id: "team", name: "Team" },
  ]);

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
    { id: "sarah", name: "Sarah Johnson", online: true, initial: "S" },
    { id: "alex", name: "Alex Wong", online: true, initial: "A" },
    { id: "maria", name: "Maria Garcia", online: true, initial: "M" },
  ]);

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
          <ChannelList 
            channels={channels} 
            currentChannel={currentChannel} 
            onSelectChannel={setCurrentChannel} 
          />
          <DirectMessageList 
            directMessages={directMessages} 
            currentChannel={currentChannel} 
            onSelectChannel={setCurrentChannel} 
          />
        </div>
      </div>

      {/* Right chat area */}
      <div className="flex-1 flex flex-col">
        <ChannelHeader 
          currentChannel={currentChannel} 
          channels={channels} 
          directMessages={directMessages} 
        />
        <MessageArea />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}