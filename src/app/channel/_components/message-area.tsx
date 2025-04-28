"use client";

import { useChattingContext } from "@/app/channel/_components/chat-provider";
import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";

export function MessageArea() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { channelId, messages } = useChattingContext();

  // 메시지가 추가될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-neutral-500">
          메시지가 없습니다. 대화를 시작해보세요!
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
