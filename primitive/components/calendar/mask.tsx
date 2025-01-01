import { PropsWithChildren, ReactNode } from 'react';

type Props = {
  mask?: ReactNode;
};

export function MaskContainer(props: PropsWithChildren<Props>) {
  return (
    <div className="relative">
      {props.children}
      {props.mask ? <div className="absolute top-0 bottom-0 left-0 right-0">{props.mask}</div> : null}
    </div>
  );
}
