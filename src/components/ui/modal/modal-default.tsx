import useWindowSize from '@/hooks/use-window-size';
import { Button } from '@/components/ui/button';
import StringToHtml from '@/components/ui/string-to-html';
import Modal from '@/components/ui/modal/modal';
import useModal from '@/stores/modal-store';
import type React from 'react';
import tw from 'twin.macro';

const InfoContianer = tw.pre`my-6 justify-center gap-2.5 rounded-sm bg-zinc-100 px-4 py-3`;
const ContentContianer = tw.div`justify-center gap-2.5 text-base`;
const AlertContianer = tw.div`my-6 w-full justify-center gap-2.5 px-4 py-3 text-center text-base`;

const ModalDefault = ({
  className,
  size = 'md',
  ...rest
}: ModalProps): React.JSX.Element | null => {
  if (!('alert' in rest) && !('content' in rest)) {
    return null;
  }

  const { closeModal } = useModal();
  const isMobile = useWindowSize();

  const {
    // @ts-ignore
    title,
    // @ts-ignore
    hideCloseButton = false,
    handleClose,
    handleOk,
    hideBottomButton,
    handleCancel,
    hideBottomCancelButton,
    txtCancel,
    txtOK,
  } = rest;

  return (
    <Modal.Container size={size} className={isMobile ? 'justify-center gap-4 bg-white' : ''}>
      <Modal.Header hideCloseButton={hideCloseButton} handleClose={handleClose}>
        {title}
      </Modal.Header>
      <Modal.Content className={className}>
        <>
          {'info' in rest && <InfoContianer>{rest.info}</InfoContianer>}
          {'alert' in rest && (
            <AlertContianer>
              <StringToHtml text={rest.alert} />
            </AlertContianer>
          )}
          {'content' in rest && (
            <ContentContianer>
              <StringToHtml text={rest.content} />
            </ContentContianer>
          )}
        </>
      </Modal.Content>
      {!hideBottomButton && (
        <Modal.Footer>
          {handleCancel !== undefined ? (
            !hideBottomCancelButton ? (
              <Button
                variant={'secondary'}
                scale={'lg'}
                className="min-w-0 border-[1.5px] border-neutral-900"
                onClick={() => {
                  handleCancel();
                }}
              >
                {txtCancel ? txtCancel : t('common.button.cancel')}
              </Button>
            ) : null
          ) : null}
          {txtCancel && !handleCancel && (
            <Button
              variant={'secondary'}
              scale={'lg'}
              className="min-w-0 border-[1.5px] border-neutral-900"
              onClick={closeModal}
            >
              {txtCancel}
            </Button>
          )}
          <Button
            variant={'default'}
            scale={'lg'}
            onClick={handleOk ? handleOk : closeModal}
            className={hideBottomCancelButton ? 'w-40' : 'min-w-0'}
          >
            {txtOK ? txtOK : t('common.button.ok')}
          </Button>
        </Modal.Footer>
      )}
    </Modal.Container>
  );
};

export default ModalDefault;
