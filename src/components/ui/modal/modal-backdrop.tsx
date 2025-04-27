'use client';
import { cn } from '@/lib/utils';
import useModal from '@/stores/modal-store';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useState } from 'react';

interface IModalBackdropProps {
  className?: string;
  children: React.ReactNode;
  zIndex: number;
}

const ModalBackdrop = ({
  className,
  children,
  zIndex,
}: IModalBackdropProps): React.JSX.Element | null => {
  const { modals, modalCount, closeModal } = useModal();
  const [opening, setOpening] = useState(false);

  const closeModalByClick = () => {
    if (opening) {
      return;
    }
    if (modals[modalCount() - 1]?.backdropDismiss === true) {
      return;
    }
    closeModal();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (modalCount()) {
      // 모달이 열리면 body의 overflow를 hidden으로 설정
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫히면 overflow 속성을 제거
      document.body.style.overflow = '';
    }

    // 컴포넌트가 언마운트될 때 원래 상태로 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [modals]);

  return (
    <AnimatePresence initial={false}>
      <motion.div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
          'bg-neutral-950 bg-opacity-60',
          `z-${zIndex}`,
          !modalCount() && 'pointer-events-none',
          className,
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: modalCount() ? 1 : 0 }}
        exit={{ opacity: 0 }}
        onAnimationStart={() => setOpening(true)}
        onAnimationComplete={() => setOpening(false)}
        onClick={() => closeModalByClick()}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalBackdrop;
