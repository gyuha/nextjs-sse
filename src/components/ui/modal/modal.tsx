"use client";
import ModalContainer from "@/components/ui/modal/modal-container";
import ModalDefault from "@/components/ui/modal/modal-default";
import ModalForm from "@/components/ui/modal/modal-form";
import ModalHeader from "@/components/ui/modal/modal-header";
import { cn } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import type React from "react";
import { useEffect } from "react";
import { ChatContainer } from "../../../app/channel/_components/chat-container";

export const MODAL_Z_INDEX = 50;
export const MODAL_SIZE: Record<ModalSize, string> = {
  sm: "400px",
  md: "640px",
  lg: "800px",
  xl: "1000px",
  full: "100%",
  half: "50%",
  "2xl": "1200px",
  "3xl": "1400px",
};

const Modal = ({
  className,
  size = "md",
  forcusLockDisabled,
  ...rest
}: ModalProps): React.JSX.Element | null => {
  const { setFocusLockDisabled } = useModal();

  useEffect(() => {
    if (forcusLockDisabled !== undefined) {
      setFocusLockDisabled(!!forcusLockDisabled);
    }

    return () => {
      if (forcusLockDisabled) {
        setFocusLockDisabled(false);
      }
    };
  }, [forcusLockDisabled]);

  if ("alert" in rest || "content" in rest) {
    return <ModalDefault {...rest} className={className} size={size} />;
  }

  if ("form" in rest) {
    return <ModalForm {...rest} className={className} size={size} />;
  }

  if ("custom" in rest) {
    const { custom } = rest;
    return (
      <Modal.Container className={className} size={size}>
        {custom}
      </Modal.Container>
    );
  }

  return <Modal.Container>Need any content...</Modal.Container>;
};

/*
# Modal 구조
Ground
└── Modal
    └── Container
        ├── Header
        ├── Content
        └── Footer
*/

/**
 *  모달의 배경
 */
Modal.Ground = ({ children }: { children: React.ReactNode }) => (
  <div
    className={cn(
      "fixed inset-0 z-50 flex h-full w-full items-center justify-center"
    )}
  >
    {children}
  </div>
);

/**
 * 모달의 컨테이너
 */
Modal.Container = ModalContainer;
Modal.Header = ModalHeader;
Modal.Content = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("w-full overflow-y-auto overflow-x-hidden")}>
    {children}
  </div>
);
Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className={cn("grid grid-flow-col justify-items-stretch gap-x-1")}>
    {children}
  </div>
);

export default Modal;
