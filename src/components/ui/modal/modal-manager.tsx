"use client";
import Modal, { MODAL_Z_INDEX } from "@/components/ui/modal/modal";
import ModalBackdrop from "@/components/ui/modal/modal-backdrop";
import { uuid } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";
import FocusLock from "react-focus-lock";

// REF : https://gist.github.com/magalhaespaulo/737a5c35048c18b8a2209d8a9fae977c - tailwind with framer-motion

const Modals = () => {
  const { modals, closeModal, focusLockDisabled } = useModal();

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
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

  return (
    <ModalBackdrop zIndex={MODAL_Z_INDEX}>
      <AnimatePresence initial={false}>
        {modals.map((modalProps, idx) => {
          return (
            <Modal.Ground key={`${uuid()}-${idx}`}>
              <Modal {...modalProps} />
            </Modal.Ground>
          );
        })}
      </AnimatePresence>
    </ModalBackdrop>
  );
};

export default Modals;
