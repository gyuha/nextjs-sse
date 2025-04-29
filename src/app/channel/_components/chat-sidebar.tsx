"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Hash, X } from "lucide-react";
import { useChattingContext } from "./chat-provider";
import { useChannelContext } from "@/app/(room)/_components/channel-provider";

interface ChatSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ChatSidebar({ isOpen, setIsOpen }: ChatSidebarProps) {
  const { channels, currentChannelId, setCurrentChannelId} = useChannelContext();
  const isMobile = useMobile();

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out`
    : "w-64 border-r bg-white";

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div className={sidebarClasses}>
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Channels</h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="p-2">
          <div className="mb-4">
            <h2 className="px-3 mb-1 text-xs font-semibold text-gray-500 uppercase">
              Channels
            </h2>
            <ul className="space-y-1">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <button
                    onClick={() => setCurrentChannelId(channel.id)}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm rounded-md",
                      currentChannelId === channel.id
                        ? "bg-gray-100 font-medium"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <Hash className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{channel.name}</span>
                    {(channel.userCount ?? 0) > 0 && (
                      <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                        {channel.userCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
