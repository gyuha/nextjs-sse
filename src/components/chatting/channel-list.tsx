"use client";

import { Button } from "@/components/ui/button";
import { Channel } from "./types";

interface ChannelListProps {
  channels: Channel[];
  currentChannel: string;
  onSelectChannel: (channelId: string) => void;
}

export function ChannelList({ channels, currentChannel, onSelectChannel }: ChannelListProps) {
  return (
    <div className="mb-6">
      <div className="uppercase text-xs font-semibold text-neutral-500 tracking-wider px-4 py-2">
        CHANNELS
      </div>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id} onClick={() => onSelectChannel(channel.id)}>
            <Button
              variant={currentChannel === channel.id ? "secondary" : "ghost"}
              className="w-full justify-start px-4 py-2 h-auto font-normal"
            >
              <span className="mr-2">#</span>
              {channel.name}
              {channel.unreadCount && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {channel.unreadCount}
                </span>
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}