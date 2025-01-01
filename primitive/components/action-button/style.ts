import clsx from 'clsx';

import { ActionButtonVariant } from './type';

export const style: Record<ActionButtonVariant, string> = {
  solid: clsx('bg-background hover:bg-surface'),
  ghost: clsx('bg-white-10'),
  secondary: clsx('bg-surface light:hover:brightness-[0.95] dark:hover:brightness-110 transition-[filter]'),
};
