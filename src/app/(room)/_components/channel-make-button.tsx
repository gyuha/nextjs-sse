"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type React from "react";
import ChannelMakeModal from "./channel-make-modal";
import useModal from "@/stores/modal-store";
import { useRef } from "react";

const ChannelMakeButton = (): React.JSX.Element | null => {
  const { openModal } = useModal();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    openModal({
      title: "새 채팅채널 만들기",
      custom: <ChannelMakeModal />,
      size: "md",
      portalTarget: containerRef,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn("w-full flex items-center gap-2")}
        onClick={handleOpen}
      >
        <Plus className="h-4 w-4" />
        <span>새 채팅채널 만들기</span>
        <div ref={containerRef} className="relative" />
      </Button>
    </>
  );
};

export default ChannelMakeButton;
