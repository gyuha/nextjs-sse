"use client";

import { Message } from "./types";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center mr-2">
        {message.sender? message.sender.charAt(0) : "U"}
      </div>
      <div>
        <div className="flex items-center">
          <span className="font-medium">{message.sender}</span>
          <span className="text-xs text-neutral-500 ml-2">{message.timestamp}</span>
        </div>
        <p className="mt-1">{message.content}</p>
      </div>
    </div>
  );
}