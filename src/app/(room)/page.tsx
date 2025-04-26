"use client";

import ChannelContainer from "./_components/channel-container";
import { ChannelProvider } from "./_components/channel-provider";

export default function ChatChannelEntry() {
  return (
    <ChannelProvider>
      <ChannelContainer />
    </ChannelProvider>
  );
}
