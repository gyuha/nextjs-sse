"use client";
import { Button } from "@/components/ui/button";
import type React from "react";
import { useChannelContext } from "./channel-provider";
import useModal from "@/stores/modal-store";
import ChannelMakeModal from "./channel-make-modal";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ChannelMakeButton = (): React.JSX.Element | null => {
  const { openModal } = useModal();
  const openChannelMakeModal = () => {
    openModal({
      title: "새 채팅채널 만들기",
      form: <ChannelMakeModal />,
      size: "md",
    });
  };

  return (
    <Button
      onClick={() => openChannelMakeModal()}
      variant="outline"
      className={cn("w-full flex items-center gap-2")}
    >
      <Plus className="h-4 w-4" />
      <span>새 채팅채널 만들기</span>
    </Button>
  );
};

export default ChannelMakeButton;
