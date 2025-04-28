"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type React from "react";
import ChannelMakeModal from "./channel-make-modal";

const ChannelMakeButton = (): React.JSX.Element | null => {
  return (
    <ChannelMakeModal
      triggerProps={{
        asChild: true,
        children: (
          <Button
            variant="outline"
            className={cn("w-full flex items-center gap-2")}
          >
            <Plus className="h-4 w-4" />
            <span>새 채팅채널 만들기</span>
          </Button>
        ),
      }}
    />
  );
};

export default ChannelMakeButton;
