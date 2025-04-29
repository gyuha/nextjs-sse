import React from 'react';
import type { JSX } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface IModalState {
  modals: ModalProps[];
  focusLockDisabled: boolean;
}

export interface IModalStore extends IModalState {
  modalCount: () => number;
  openModal: (
    modalProp: ModalProps | string | JSX.Element, 
    hideBottomButton?: boolean, 
    options?: { portal?: boolean; portalTarget?: React.RefObject<HTMLElement> }
  ) => void;
  closeModal: () => void;
  closeAllModal: () => void;
  setFocusLockDisabled: (lock: boolean) => void;
  reset: () => void;
}

const initialState: IModalState = {
  modals: [],
  focusLockDisabled: false,
};

const useModal = create<IModalStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      modalCount: () => get().modals.length,
      openModal: (
        props: ModalProps | string | JSX.Element, 
        hideBottomButton = false, 
        options?: { portal?: boolean; portalTarget?: React.RefObject<HTMLElement> }
      ) => {
        if (typeof props === 'string' || React.isValidElement(props)) {
          get().openModal(
            { 
              alert: props, 
              size: 'sm', 
              height: 'auto', 
              hideBottomButton,
              // portalTarget이 있을 때만 portal 옵션 적용
              ...(options?.portal && options?.portalTarget ? 
                { portal: true, portalTarget: options.portalTarget } : {})
            }
          );
          return;
        }
        
        // portalTarget이 있을 때만 portal 옵션 적용
        const portalOptions = options?.portal && options?.portalTarget ? 
          { portal: true, portalTarget: options.portalTarget } : {};
        
        const modalProps = {
          ...props,
          ...portalOptions
        };
        
        set((state) => ({ modals: [...state.modals, modalProps] }));
      },
      closeModal: () => {
        set((state) => ({ modals: state.modals.slice(0, state.modals.length - 1) }));
      },
      closeAllModal: () => {
        set(initialState);
      },
      setFocusLockDisabled: (lock: boolean) => {
        set({ focusLockDisabled: lock });
      },
      reset: () => {
        set(initialState);
      },
    })),
    {
      enabled: true,
    },
  ),
);

export default useModal;
