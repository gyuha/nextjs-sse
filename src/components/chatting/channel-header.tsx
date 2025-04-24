"use client";

import { useChattingProvider } from "@/app/sse/_components/chatting-provider";
import { Channel, DirectMessage } from "./types";

interface ChannelHeaderProps {
  currentChannel: string;
  channels: Channel[];
  directMessages: DirectMessage[];
}

export function ChannelHeader() {
  const { channelId, channels, setChannelId } = useChattingProvider();

  // 채널 이름 가져오기
  const getCurrentChannelName = () => {
    const channel = channels.find((c) => c.id === channelId);
    if (channel) return channel.name;

    return "Unknown";
  };

  const isChannelType = channels.some(c => c.id === channelId);
  
  return (
    <div className="p-4 border-b border-neutral-200 flex items-center">
      <h2 className="font-semibold text-lg">
        {isChannelType ? `# ${getCurrentChannelName()}` : getCurrentChannelName()}
      </h2>
    </div>
  );
}

