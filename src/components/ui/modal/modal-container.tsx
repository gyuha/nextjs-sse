"use client";
import { MODAL_SIZE } from "@/components/ui/modal/modal";
import useMobileDetection from "@/hooks/use-mobile-detection";
import { cn } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import { motion } from "framer-motion";
import type React from "react";

const effect = {
  hidden: {
    y: "-1vh",
    scale: 0.9,
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    scale: 1,
    transition: {
      type: "easeOut",
      duration: 0.2,
    },
  },
  exit: {
    y: "1vh",
    scale: 0.9,
    opacity: 0,
    transition: {
      type: "easeIn",
      duration: 0.2,
    },
  },
};

interface IModalContainerProps {
  className?: string;
  children: React.ReactNode;
  size?: ModalSize;
  zIndex?: number;
}

const ModalContainer = ({
  children,
  className,
  size = "md",
  zIndex,
}: IModalContainerProps): React.JSX.Element | null => {
  const isMobile = useMobileDetection();
  const { modalCount } = useModal();

  return (
    <motion.div
      tabIndex={-1}
      className={cn(
        "relative inset-0 rounded-xl z-60",
        "gap-6 rounded-xl border shadow-sm m-1",
        "flex max-h-full max-w-full flex-col scroll-auto",
        isMobile ? "h-full !w-full px-6" : "p-6",
        className || "gap-6 bg-white shadow"
      )}
      style={{ 
        width: MODAL_SIZE[size || "md"],
        zIndex: zIndex
      }}
      variants={effect}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </motion.div>
  );
};

export default ModalContainer;
