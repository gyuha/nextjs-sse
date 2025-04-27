'use client';
import { Button } from '@/components/ui/button';
import { uuid } from '@/lib/utils';
import useModal from '@/stores/modal-store';
import type React from 'react';

const Modal = (): React.JSX.Element | null => {
  const { openModal } = useModal();

  return <Button
  onClick={() => {
    openModal({
      title: `modal #${uuid()}`,
      info: `test
information`,
      content: 'Hello, Modal!!!!',
      size: 'lg',
    });
  }}
>
  Open
</Button>
};

export default Modal;
