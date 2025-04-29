type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'half' | '2xl' | '3xl';

type ModalHeaderProps = {
  title?: string;
  hideCloseButton?: boolean;
};

type ModalHandleProps = {
  hideBottomButton?: boolean;
  hideBottomCancelButton?: boolean;
  handleCancel?: () => void;
  handleOk?: () => void;
  handleClose?: () => void;
  txtCancel?: string;
  txtOK?: string;
  disabledCancel?: boolean;
  disabledOk?: boolean;
};

type ModalAlertProps = {
  alert: React.ReactNode | string;
} & ModalHeaderProps &
  ModalHandleProps;

type ContentModalProps = {
  info?: React.ReactNode | string;
  content: React.ReactNode | string;
} & ModalHeaderProps &
  ModalHandleProps;

type FormModalProps = {
  form: React.ReactNode | string;
} & ModalHeaderProps;

type CustomModalProps = {
  custom: React.ReactNode | string;
};

type ModalProps = {
  id?: string;
  className?: string;
  size?: ModalSize;
  height?: string;
  backdropDismiss?: boolean;
  disabledEscKey?: boolean;
  zIndex?: number;
  forcusLockDisabled?: boolean;
  portal?: boolean;
  portalTarget?: React.RefObject<HTMLElement> | null;
} & (ModalAlertProps | ContentModalProps | FormModalProps | CustomModalProps);
