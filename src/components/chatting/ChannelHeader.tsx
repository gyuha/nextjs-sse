"use client";

import { Channel, DirectMessage } from "./types";

interface ChannelHeaderProps {
  currentChannel: string;
  channels: Channel[];
  directMessages: DirectMessage[];
}

export function ChannelHeader({ currentChannel, channels, directMessages }: ChannelHeaderProps) {
  // 채널 이름 가져오기
  const getCurrentChannelName = () => {
    const channel = channels.find((c) => c.id === currentChannel);
    if (channel) return channel.name;

    const dm = directMessages.find((dm) => dm.id === currentChannel);
    if (dm) return dm.name;

    return "Unknown";
  };

  const isChannelType = channels.some(c => c.id === currentChannel);
  
  return (
    <div className="p-4 border-b border-neutral-200 flex items-center">
      <h2 className="font-semibold text-lg">
        {isChannelType ? `# ${getCurrentChannelName()}` : getCurrentChannelName()}
      </h2>
      {!isChannelType && (
        <span className="text-sm text-neutral-500 ml-auto">
          {directMessages.find(dm => dm.id === currentChannel)?.online ? "온라인" : "오프라인"}
        </span>
      )}
    </div>
  );
}