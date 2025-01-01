import clsx from 'clsx';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { style } from './style';
import { ActionButtonVariant } from './type';

type Props = {
  variant?: ActionButtonVariant;
  rounded?: boolean;
  // 强调显示
  emphasize?: boolean;
  disabled?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function ActionButton(props: Props) {
  const {
    variant = 'solid',
    rounded = false,
    emphasize = false,
    disabled = false,
    children,
    className,
    ...attributes
  } = props;

  return (
    <div
      className={clsx(
        'group/actionButton relative min-w-[2em] h-[2em] box-border flex items-center justify-center cursor-pointer',
        rounded ? 'rounded-full' : 'rounded-4',
        emphasize ? 'shadow-base dark:border-1' : '',
        style[variant],
        className
      )}
      role="action-button"
      aria-roledescription="action-button"
      aria-disabled={disabled}
      {...attributes}
    >
      <div className="peer relative z-1 flex items-center">{children}</div>
      {variant === 'ghost' ? (
        <div
          className={clsx(
            'absolute top-0 left-0 bottom-0 right-0 bg-white-10',
            rounded ? 'rounded-full' : 'rounded-4',
            !disabled && 'group-hover/actionButton:bg-white-40 peer-hover:bg-white-40'
          )}
        />
      ) : null}
    </div>
  );
}
