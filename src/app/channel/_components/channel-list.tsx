"use client";

import { Button } from "@/components/ui/button";
import { Channel } from "./types";
import { useChattingProvider } from "@/app/channel/_components/chatting-provider";

interface ChannelListProps {
  channels: Channel[];
  currentChannel: string;
  onSelectChannel: (channelId: string) => void;
}

export function ChannelList() {
  const { channelId, setChannelId, channels } = useChattingProvider();
  return (
    <div className="mb-6">
      <div className="uppercase text-xs font-semibold text-neutral-500 tracking-wider px-4 py-2">
        CHANNELS
      </div>
      <ul>
        {channels.map((channel: Channel) => (
          <li key={channel.id} onClick={() => setChannelId(channel.id)}>
            <Button
              variant={channelId === channel.id ? "secondary" : "ghost"}
              className="w-full justify-start px-4 py-2 h-auto font-normal"
            >
              <span className="mr-2">#</span>
              {channel.name}
              {channel.userCount && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {channel.userCount}
                </span>
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

