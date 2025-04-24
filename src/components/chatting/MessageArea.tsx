"use client";

import { useRef, useEffect } from "react";
import { Message } from "./types";

interface MessageAreaProps {
  messages: Message[];
}

export function MessageArea({ messages }: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  );
}