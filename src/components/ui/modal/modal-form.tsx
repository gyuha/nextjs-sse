import Modal from '@/components/ui/modal/modal';
import type React from 'react';

const ModalForm = ({ className, size = 'md', ...rest }: ModalProps): React.JSX.Element | null => {
  if (!('form' in rest)) {
    return null;
  }

  const { title, hideCloseButton = false, form } = rest;

  return (
    <Modal.Container size={size}>
      <Modal.Header hideCloseButton={hideCloseButton}>{title}</Modal.Header>
      <Modal.Content>
        <div className={className}>{form}</div>
      </Modal.Content>
    </Modal.Container>
  );
};

export default ModalForm;
