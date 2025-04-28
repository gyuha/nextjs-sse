"use client";

import ChatContainer from "./_components/chat-container";
import { ChattingProvider } from "./_components/chat-provider";

export default function SSEChatPage() {
  return (
    <ChattingProvider>
      <ChatContainer />
    </ChattingProvider>
  );
}
