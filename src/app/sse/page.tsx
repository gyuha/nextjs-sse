"use client";

import { ChatLayout } from "@/components/chatting/chat-layout";
import { ChattingProvider } from "./_components/chatting-provider";

export default function SSEChatPage() {
  return <ChattingProvider><ChatLayout /></ChattingProvider>;
}