"use client";

import { useState } from "react";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { MessageArea } from "./message-area";
import CheckInChannel from "./check-in-channel";

export default function ChatContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CheckInChannel />
      <ChatSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader toggleSidebar={toggleSidebar} />
        <MessageArea />
        <ChatInput />
      </div>
    </div>
  );
}
