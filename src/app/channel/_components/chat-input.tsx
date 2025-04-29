"use client";

import { useChannelContext } from "@/app/(room)/_components/channel-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useChattingContext } from "./chat-provider";
import { sendMessage } from "./send-message-event";

export function ChatInput() {
  const [messageInput, setMessageInput] = useState("");
  const { currentChannelId } = useChannelContext();
  const { connectionStatus, username } = useChattingContext();

  const handleSendMessage = async () => {
    if (messageInput.trim() === "") return;
    if (connectionStatus !== "connected") {
      console.warn(
        "SSE 연결이 활성화되지 않았습니다. 메시지를 보낼 수 없습니다."
      );
      return;
    }

    await sendMessage(connectionStatus, currentChannelId, messageInput, username);
    setMessageInput("");
  };

  return (
    <div className="p-4 border-t border-neutral-200">
      <div className="flex items-center space-x-2">
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
            disabled={connectionStatus !== "connected"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </div>
      </div>
      {connectionStatus !== "connected" && (
        <div className="mt-2 text-xs text-red-500">
          {connectionStatus === "connecting"
            ? "서버에 연결 중..."
            : "서버 연결이 끊어졌습니다. 새로고침을 시도해 보세요."}
        </div>
      )}
    </div>
  );
}
