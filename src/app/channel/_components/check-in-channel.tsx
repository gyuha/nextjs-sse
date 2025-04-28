import { useChannelContext } from "@/app/(room)/_components/channel-provider";
import useModal from "@/stores/modal-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CheckInChannel = () => {
  const router = useRouter();
  const { currentChannelId } = useChannelContext();
  const { openModal, closeAllModal } = useModal();

  useEffect(() => {
    if (currentChannelId === "" || currentChannelId === null) {
      openModal({
        title: "채널 선택",
        content: "채널을 선택해주세요",
        disabledCancel: true,
        handleOk: () => {
          closeAllModal();
          router.push("/");
        },
      });
    }
  }, []);
  return null;
};

export default CheckInChannel;
