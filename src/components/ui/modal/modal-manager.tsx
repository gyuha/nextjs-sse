"use client";
import Modal, { MODAL_Z_INDEX } from "@/components/ui/modal/modal";
import ModalBackdrop from "@/components/ui/modal/modal-backdrop";
import { uuid } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";
import FocusLock from "react-focus-lock";
import { createPortal } from "react-dom";

// REF : https://gist.github.com/magalhaespaulo/737a5c35048c18b8a2209d8a9fae977c - tailwind with framer-motion

const Modals = () => {
  const { modals, closeModal, focusLockDisabled, modalCount } = useModal();

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (focusLockDisabled || modalCount() === 0) {
        return;
      }
      if (e.key === "Escape") {
        if (
          modals.length > 0 &&
          modals[modals.length - 1].disabledEscKey !== true
        ) {
          closeModal();
        }
      }
    },
    [modals, closeModal]
  );

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  // 포털을 사용하지 않는 기본 모달들
  const regularModals = modals.filter(modal => !modal.portal);

  return (
    <AnimatePresence initial={false}>
      {regularModals.length > 0 && (
        <ModalBackdrop zIndex={MODAL_Z_INDEX} />
      )}
      {regularModals.map((modalProps, idx) => {
        // 모달에 id가 있으면 그것을 사용하고, 없으면 인덱스를 사용
        const modalKey = modalProps.id || `modal-${idx}`;
        // 순차적으로 z-index 증가시키기
        const zIndex = modalProps.zIndex || MODAL_Z_INDEX + idx;
        return (
          <Modal.Ground key={modalKey}>
            <Modal {...modalProps} zIndex={zIndex} />
          </Modal.Ground>
        );
      })}

      {/* 포털을 사용하는 모달들 */}
      {modals
        .filter(modal => modal.portal && modal.portalTarget?.current)
        .map((modalProps, idx) => {
          const modalKey = modalProps.id || `portal-modal-${idx}`;
          const zIndex = modalProps.zIndex || MODAL_Z_INDEX + modals.length + idx;
          
          return modalProps.portalTarget?.current 
            ? createPortal(
                <AnimatePresence initial={false}>
                  <ModalBackdrop zIndex={zIndex} className="absolute">
                    <Modal.Ground key={modalKey}>
                      <Modal {...modalProps} zIndex={zIndex} />
                    </Modal.Ground>
                  </ModalBackdrop>
                </AnimatePresence>,
                modalProps.portalTarget.current
              )
            : null;
        })}
    </AnimatePresence>
  );
};

export default Modals;
