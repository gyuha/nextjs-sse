"use client";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal/modal";
import StringToHtml from "@/components/ui/string-to-html";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import type React from "react";

const InfoContianer = ({ children }: { children: React.ReactNode }) => (
  <pre
    className={cn(
      "my-6 justify-center gap-2.5 rounded-sm bg-zinc-100 px-4 py-3"
    )}
  >
    {children}
  </pre>
);
const ContentContianer = ({ children }: { children: React.ReactNode }) => (
  <div className={cn("justify-center gap-2.5 text-base")}> {children} </div>
);
const AlertContianer = ({ children }: { children: React.ReactNode }) => (
  <div
    className={cn(
      "my-6 w-full justify-center gap-2.5 px-4 py-3 text-center text-base"
    )}
  >
    {children}
  </div>
);

const ModalDefault = ({
  className,
  size = "md",
  ...rest
}: ModalProps): React.JSX.Element | null => {
  if (!("alert" in rest) && !("content" in rest)) {
    return null;
  }

  const { closeModal } = useModal();
  const isMobile = useMobile();

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
    <Modal.Container
      size={size}
      className={isMobile ? "justify-center gap-4 bg-white" : ""}
    >
      <Modal.Header hideCloseButton={hideCloseButton} handleClose={handleClose}>
        {title}
      </Modal.Header>
      <Modal.Content className={className}>
        <>
          {"info" in rest && <InfoContianer>{rest.info}</InfoContianer>}
          {"alert" in rest && (
            <AlertContianer>
              <StringToHtml text={rest.alert} />
            </AlertContianer>
          )}
          {"content" in rest && (
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
                variant={"secondary"}
                size={"lg"}
                className="min-w-0 border-[1.5px] border-neutral-900"
                onClick={() => {
                  handleCancel();
                }}
              >
                취소
              </Button>
            ) : null
          ) : null}
          {txtCancel && !handleCancel && (
            <Button
              variant={"secondary"}
              size={"lg"}
              className="min-w-0 border-[1.5px] border-neutral-900"
              onClick={closeModal}
            >
              {txtCancel}
            </Button>
          )}
          <Button
            variant={"default"}
            size={"lg"}
            onClick={handleOk ? handleOk : closeModal}
            className={hideBottomCancelButton ? "w-40" : "min-w-0"}
          >
            확인
          </Button>
        </Modal.Footer>
      )}
    </Modal.Container>
  );
};

export default ModalDefault;
