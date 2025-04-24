"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Channel = {
  id: string;
  name: string;
  unreadCount?: number;
};

type DirectMessage = {
  id: string;
  name: string;
  online: boolean;
  initial: string;
};

type Message = {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  channelId: string;
};

export default function SSEChatPage() {
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
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채널이 변경될 때마다 메시지 초기화
  useEffect(() => {
    setMessages([]);
    // 실제 SSE 구현에서는 여기서 채널 구독을 변경
  }, [currentChannel]);

  // 메시지가 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (messageInput.trim() === "") return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageInput,
      sender: "You",
      timestamp: new Date().toLocaleTimeString(),
      channelId: currentChannel,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  // 채널 이름 가져오기
  const getCurrentChannelName = () => {
    const channel = channels.find((c) => c.id === currentChannel);
    if (channel) return channel.name;

    const dm = directMessages.find((dm) => dm.id === currentChannel);
    if (dm) return dm.name;

    return "Unknown";
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      {/* Left sidebar */}
      <div className="w-64 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold">Channels</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <div className="uppercase text-xs font-semibold text-neutral-500 tracking-wider px-4 py-2">
              CHANNELS
            </div>
            <ul>
              {channels.map((channel) => (
                <li key={channel.id} onClick={() => setCurrentChannel(channel.id)}>
                  <Button
                    variant={currentChannel === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start px-4 py-2 h-auto font-normal"
                  >
                    <span className="mr-2">#</span>
                    {channel.name}
                    {channel.unreadCount && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {channel.unreadCount}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="uppercase text-xs font-semibold text-neutral-500 tracking-wider px-4 py-2">
              DIRECT MESSAGES
            </div>
            <ul>
              {directMessages.map((dm) => (
                <li key={dm.id} onClick={() => setCurrentChannel(dm.id)}>
                  <Button
                    variant={currentChannel === dm.id ? "secondary" : "ghost"}
                    className="w-full justify-start px-4 py-2 h-auto font-normal"
                  >
                    <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center mr-2 text-xs relative">
                      {dm.initial}
                      {dm.online && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                      )}
                    </div>
                    {dm.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right chat area */}
      <div className="flex-1 flex flex-col">
        {/* Channel header */}
        <div className="p-4 border-b border-neutral-200 flex items-center">
          <h2 className="font-semibold text-lg">
            {currentChannel.startsWith("general") || 
             currentChannel.startsWith("random") || 
             currentChannel.startsWith("support") || 
             currentChannel.startsWith("team") 
             ? `# ${getCurrentChannelName()}` 
             : getCurrentChannelName()}
          </h2>
          {!currentChannel.startsWith("general") && 
           !currentChannel.startsWith("random") && 
           !currentChannel.startsWith("support") && 
           !currentChannel.startsWith("team") && (
            <span className="text-sm text-neutral-500 ml-auto">
              {directMessages.find(dm => dm.id === currentChannel)?.online ? "온라인" : "오프라인"}
            </span>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500">
              메시지가 없습니다. 대화를 시작해보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center mr-2">
                    {message.sender.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{message.sender}</span>
                      <span className="text-xs text-neutral-500 ml-2">{message.timestamp}</span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.6 11.6L22 7v10l-6.4-4.5v-1z"/>
                <rect width="15" height="10" x="2" y="7" rx="2"/>
              </svg>
            </Button>
            <div className="relative flex-1">
              <Input
                placeholder="메시지를 입력하세요..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="pr-10"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
                onClick={sendMessage}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}