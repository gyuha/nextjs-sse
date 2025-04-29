"use client";
import { cn } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";

interface IModalBackdropProps {
  className?: string;
  children?: React.ReactNode;
  zIndex: number;
}

const ModalBackdrop = ({
  className,
  children,
  zIndex,
}: IModalBackdropProps): React.JSX.Element | null => {
  const { modals, modalCount, closeModal } = useModal();
  const [opening, setOpening] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (modalCount()) {
      // 모달이 열리면 body의 overflow를 hidden으로 설정
      document.body.style.overflow = "hidden";
    } else {
      // 모달이 닫히면 overflow 속성을 제거
      document.body.style.overflow = "";
    }

    // 컴포넌트가 언마운트될 때 원래 상태로 복원
    return () => {
      document.body.style.overflow = "";
    };
  }, [modals]);

  if (!modalCount()) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "fixed inset-0 flex items-center justify-center backdrop-blur-sm",
        "bg-neutral-950 bg-opacity-60",
        className
      )}
      style={{ zIndex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onAnimationStart={() => setOpening(true)}
      onAnimationComplete={() => setOpening(false)}
    >
      {children}
    </motion.div>
  );
};

export default ModalBackdrop;
