"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import { Plus } from "lucide-react";
import type React from "react";
import { ChannelMakeModalWithContext } from "./channel-make-modal";
import { useChannelContext } from "./channel-provider";
import type { Channel } from "@/types";

const ChannelMakeButton = (): React.JSX.Element | null => {
  const { openModal } = useModal();
  // 채널 컨텍스트 데이터를 컴포넌트 내부에서 가져옵니다 (ChannelProvider 내부에 있음)
  const channelContext = useChannelContext();
  
  const openChannelMakeModal = () => {
    // HOC 없이 필요한 데이터만 선택적으로 전달
    // 이렇게 하면 모달이 열릴 때 contextProvider 외부에서 useChannelContext를 호출하는 일이 없음
    const { channels } = channelContext;
    
    openModal({
      title: "새 채팅채널 만들기",
      form: <ChannelMakeModalWithContext channels={channels} />,
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
