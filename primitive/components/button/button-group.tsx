import clsx from 'clsx';
import { PropsWithChildren } from 'react';

import { buttonGroupContext } from './group-context';
import { style } from './style';
import { ButtonSize } from './type';

const { Provider } = buttonGroupContext;

type Props = {
  stretch?: boolean;
  size?: ButtonSize;
};

export function ButtonGroup(props: PropsWithChildren<Props>) {
  const { stretch, children, size = 'm' } = props;
  return (
    <Provider
      value={{
        inGroup: true,
        size,
      }}
    >
      <div
        className={clsx(
          'flex items-center justify-center overflow-hidden',
          stretch ? 'w-full' : 'w-fit',
          '[&_[data-role="button-group-item"]]:flex-grow',
          style.rounded[size],
          '[&_[data-role="button-group-item"]:last-of-type]:brightness-110'
        )}
        role="button-group"
      >
        {children}
      </div>
    </Provider>
  );
}
