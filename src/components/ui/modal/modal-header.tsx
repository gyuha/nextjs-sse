'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useModal from '@/stores/modal-store';
import { Cross2Icon } from '@radix-ui/react-icons';
import type React from 'react';

interface IModalHeaderProps {
  children: React.ReactNode;
  hideCloseButton?: boolean;
  handleClose?: () => void;
}

const ModalHeader = ({
  children,
  hideCloseButton,
  handleClose,
}: IModalHeaderProps): React.JSX.Element | null => {
  const { closeModal } = useModal();

  return (
    <>
      {(children && <div className="font-bold text-lg">{children}</div>) || null}
      {(!hideCloseButton && (
        <Button
          variant={'ghost'}
          onClick={handleClose ? handleClose : closeModal}
          className={cn(
            'absolute z-50 w-6 min-w-0 px-0',
            children ? 'right-10 top-10 h-[30px]' : 'right-6 top-6 h-6',
          )}
        >
          <span className="sr-only">Close</span>
          <Cross2Icon className="size-6" />
        </Button>
      )) ||
        null}
    </>
  );
};

export default ModalHeader;
