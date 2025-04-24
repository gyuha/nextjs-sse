"use client";

import { useChattingProvider } from "@/app/sse/_components/chatting-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Message } from "./types";


async function sendBroadcastMessage(channelId:string, content: string) {

    const newMessage: Message = {
      channelId,
      id: `msg-${Date.now()}`,
      content,
      sender: "You",
      timestamp: new Date().toLocaleTimeString(),
    };
  const response = await fetch('/api/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newMessage),
  });

  if (!response.ok) {
    throw new Error('Broadcast failed');
  }
}

export function MessageInput() {
  const [messageInput, setMessageInput] = useState("");
  const { channelId } = useChattingProvider();

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;
    sendBroadcastMessage(channelId, messageInput)
    setMessageInput("");
  };

  return (
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
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="pr-10"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full"
            onClick={handleSendMessage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}