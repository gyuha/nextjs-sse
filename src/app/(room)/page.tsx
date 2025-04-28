import type { Metadata } from "next";
import ChannelContainer from "./_components/channel-container";
import { ChannelProvider } from "./_components/channel-provider";

export const metadata: Metadata = {
  title: "Next.js Chat App",
  description: "Chat application built with Next.js and SSE",
};

export default function ChatChannelEntry() {
  return (
    <ChannelProvider>
      <ChannelContainer />
    </ChannelProvider>
  );
}
