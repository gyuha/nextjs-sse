"use client"

import { MessageList } from "./message-list"
import { useMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatHeader } from "./chat-header"
import { ChatInput } from "./chat-input"
import { MessageArea } from "./message-area"

export default function ChatContainer() {
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader toggleSidebar={toggleSidebar} />
        <MessageArea />
        <ChatInput />
      </div>
    </div>
  )
}
