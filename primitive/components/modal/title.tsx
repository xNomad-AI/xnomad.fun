import clsx from "clsx";
import { PropsWithChildren } from "react";

import { PropsWithClassName } from "../helper";
import { IconClose, IconCloseCircleNew } from "../icon";

type Props = {
  onClose?: () => void;
  closable?: boolean;
};
export function ModalTitle(
  props: PropsWithChildren<PropsWithClassName<Props>>
) {
  const { onClose, closable, className, children } = props;
  return (
    <div
      className={clsx(
        "flex items-center justify-between shrink-0 p-24 pb-0",
        className
      )}
    >
      <div className='text-size-20 text-text1 font-bold'>{children}</div>
      {closable ? (
        <IconCloseCircleNew
          onClick={onClose}
          className='text-size-24 cursor-pointer'
        />
      ) : null}
    </div>
  );
}

export function ModalTitleWithBorder(
  props: PropsWithChildren<PropsWithClassName<Props>>
) {
  const { onClose, closable, className, children } = props;
  return (
    <div
      className={clsx(
        "flex items-center justify-between shrink-0 p-24 border-b border-solid border-dividing",
        className
      )}
    >
      <div className='text-size-20 text-text1 font-bold'>{children}</div>
      {closable ? (
        <IconClose onClick={onClose} className='text-size-24 cursor-pointer' />
      ) : null}
    </div>
  );
}
