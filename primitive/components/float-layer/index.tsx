import { createContext, PropsWithChildren, ReactNode, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const context = createContext<HTMLDivElement | null>(null);

const { Provider } = context;

export function FloatLayerProvider(props: PropsWithChildren<unknown>) {
  const [floatLayerElement, setFloatLayerElement] = useState<HTMLDivElement | null>(null);

  return (
    <Provider value={floatLayerElement}>
      {props.children}
      <div data-role="float-layer" className="fixed top-0 left-0 bottom-0 z-float" ref={setFloatLayerElement} />
    </Provider>
  );
}

type Option = {
  fallback?: boolean;
  mount?: boolean;
  until?: boolean;
};

/**
 *
 * @param children only absolute element accepted
 * @param option
 * @returns
 */
export function useMountFloatLayer(children: ReactNode, option: Option = {}) {
  const { fallback = false, mount = true, until = true } = option;
  const floatLayerElement = useContext(context);

  const canMount = useRef(until);

  if (canMount.current === false) {
    canMount.current = until;
  }

  if (floatLayerElement && canMount.current && mount) {
    return createPortal(children, floatLayerElement);
  }

  if (fallback) {
    return children;
  }

  return null;
}
