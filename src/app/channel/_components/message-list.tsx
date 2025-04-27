"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                message.role === "user" ? "bg-blue-500" : "bg-gray-500"
              }`}
            >
              {message.role === "user" ? "U" : "A"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {message.role === "user" ? "You" : "Assistant"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-1 text-sm">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
