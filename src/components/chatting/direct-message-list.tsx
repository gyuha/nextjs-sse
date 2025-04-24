"use client";

import { Button } from "@/components/ui/button";
import { DirectMessage } from "./types";

interface DirectMessageListProps {
  directMessages: DirectMessage[];
  currentChannel: string;
  onSelectChannel: (channelId: string) => void;
}

export function DirectMessageList({ directMessages, currentChannel, onSelectChannel }: DirectMessageListProps) {
  return (
    <div>
      <div className="uppercase text-xs font-semibold text-neutral-500 tracking-wider px-4 py-2">
        DIRECT MESSAGES
      </div>
      <ul>
        {directMessages.map((dm) => (
          <li key={dm.id} onClick={() => onSelectChannel(dm.id)}>
            <Button
              variant={currentChannel === dm.id ? "secondary" : "ghost"}
              className="w-full justify-start px-4 py-2 h-auto font-normal"
            >
              <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center mr-2 text-xs relative">
                {dm.initial}
                {dm.online && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                )}
              </div>
              {dm.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}