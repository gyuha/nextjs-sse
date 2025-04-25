"use client";

import { ChannelHeader } from "../sse/_components/channel-header";
import { ChannelList } from "../sse/_components/channel-list";
import { MessageArea } from "../sse/_components/message-area";
import { MessageInput } from "../sse/_components/message-input";

export function ChatLayout() {

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      {/* Left sidebar */}
      <div className="w-64 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold">Channels</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <ChannelList />
        </div>
      </div>

      {/* Right chat area */}
      <div className="flex-1 flex flex-col">
        <ChannelHeader />
        <MessageArea />
        <MessageInput />
      </div>
    </div>
  );
}