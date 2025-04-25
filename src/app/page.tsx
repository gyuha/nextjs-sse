"use client";

import ChannelContainer from "./_components/channel-container";
import { ChattingChannelProvider } from "./_components/chatting-channel-provider";

export default function ChatChannelEntry() {
    return (
        <ChattingChannelProvider>
            <ChannelContainer />
        </ChattingChannelProvider>
    );
}
