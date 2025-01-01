import { Options } from '@popperjs/core';
import clsx from 'clsx';
import { CSSProperties, forwardRef, PropsWithChildren, ReactNode, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

import { useMountFloatLayer } from '../float-layer';

export type TooltipProps = {
  content?: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'horizontal' | 'none';
  style?: CSSProperties;
  contentClassName?: string;
  manual?: boolean;
};

export type TooltipController = {
  open: () => void;
  close: () => void;
  element: HTMLDivElement | null;
};

export const Tooltip = forwardRef<TooltipController, PropsWithChildren<TooltipProps>>(function Tooltip(props, ref) {
  const { children, manual = false, content, className, disabled = false, variant = 'none', style, contentClassName } = props;

  const [show, setShow] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const options = useMemo(() => {
    return {
      placement: variant === 'horizontal' ? 'left' : 'top',
      modifiers: [
        { name: 'arrow', options: { element: arrowElement } },
        { name: 'eventListeners', enabled: show },
        {
          name: 'flip',
          enabled: true,
          options: {
            fallbackPlacements: variant === 'horizontal' ? [] : ['bottom'],
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 0],
          },
        },
        {
          name: 'hide',
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 8,
          },
        },
      ],
    } satisfies Partial<Options>;
  }, [arrowElement, show, variant]);

  const { styles, attributes } = usePopper(referenceElement, popperElement, options);

  const open = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setShow(true);
  };

  const close = () => {
    timer.current = setTimeout(() => {
      setShow(false);
    }, 32);
  };

  const tooltip = useMountFloatLayer(
    disabled ? null : (
      <div
        ref={setPopperElement}
        onMouseEnter={open}
        onFocus={open}
        onBlur={close}
        onMouseLeave={close}
        style={styles.popper}
        {...attributes.popper}
        data-show={show}
        className={clsx(
          'text-size-12',
          'hidden group max-w-[20rem] w-max',
          'data-[show="true"]:block',
          'data-[popper-reference-hidden=true]:invisible data-[popper-reference-hidden=true]:pointer-events-none',
          'data-[popper-placement^=top]:pb-8',
          'data-[popper-placement^=bottom]:pt-8',
          'data-[popper-placement^=left]:pr-8',
          'data-[popper-placement^=right]:pl-8'
        )}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={clsx('bg-text1 text-background p-8 rounded-6 text-left', contentClassName)}
        >
          {content}
        </div>

        <div
          ref={setArrowElement}
          style={styles.arrow}
          className={clsx(
            'invisible bg-transparent',
            'group-data-[popper-reference-hidden=true]:before:invisible group-data-[popper-reference-hidden=true]:before:pointer-events-none',
            'before:absolute before:w-10 before:h-6 before:bg-transparent before:visible before:origin-[50%_0]',
            'before:border-t-6 before:border-l-5 before:border-r-5 before:border-transparent before:border-t-text1',
            'group-data-[popper-placement^=top]:before:-left-5',
            //
            'group-data-[popper-placement^=bottom]:top-8',
            ' group-data-[popper-placement^=bottom]:before:rotate-180',
            ' group-data-[popper-placement^=bottom]:before:-left-5',
            //
            'group-data-[popper-placement^=left]:right-13',
            ' group-data-[popper-placement^=left]:before:-rotate-90',
            //
            'group-data-[popper-placement^=right]:left-3',
            'group-data-[popper-placement^=right]:before:rotate-90'
          )}
        />
      </div>
    ),
    {
      until: show,
      mount: content !== null && show && !disabled,
    }
  );

  useImperativeHandle(ref, () => ({
    close,
    open,
    element: referenceElement,
  }));

  return (
    <>
      <div
        ref={setReferenceElement}
        className={clsx(className)}
        onMouseEnter={manual ? undefined : open}
        onFocus={manual ? undefined : open}
        onBlur={manual ? undefined : close}
        onMouseLeave={manual ? undefined : close}
        style={style}
      >
        {children}
      </div>
      {tooltip}
    </>
  );
});
