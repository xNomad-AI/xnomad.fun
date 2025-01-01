import clsx from 'clsx';
import { PropsWithChildren, ReactNode, UIEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTableProps } from './context';

type Props = {
  stickyNode: ReactNode;
};

function getElementSize(element: HTMLElement) {
  const style = getComputedStyle(element);
  // const width = element.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  // const height = element.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  return element.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
}

export function StickyContainer(props: PropsWithChildren<Props>) {
  const { headStickyType, className, tableClassName, id, scrollContainer, dataSource, isLoading } = useTableProps();
  const [stickyVisible, setStickyVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const restore = useRef<ReturnType<typeof setTimeout> | null>(null);

  const container = useRef<HTMLDivElement | null>(null);

  const handleTableHorizontalScroll = useCallback<UIEventHandler<HTMLDivElement>>((event) => {
    const target = event.target as HTMLDivElement;
    if (ref.current) {
      ref.current.scrollLeft = target.scrollLeft;
    }
    setStickyVisible(true);
    if (restore.current) {
      clearTimeout(restore.current);
    }
    restore.current = setTimeout(() => {
      setStickyVisible(false);
    }, 300);
  }, []);

  const [offset, setOffset] = useState(0);

  const handleResize = useCallback(() => {
    if (scrollContainer) {
      const nodes = scrollContainer.querySelectorAll('[data-role="sticky"]');
      let offset = 0;

      nodes.forEach((node) => {
        offset += getElementSize(node as HTMLElement);
      });
      setOffset(offset);
    }
  }, [scrollContainer]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dataSource, handleResize]);

  const style = useMemo(() => {
    if (stickyVisible && headStickyType === 'page' && scrollContainer) {
      const nodes = scrollContainer.querySelectorAll('[data-role="fill"]');
      let critical = 0;
      nodes.forEach((node) => {
        critical += getElementSize(node as HTMLElement);
      });
      return {
        top: scrollContainer.scrollTop > critical ? scrollContainer.scrollTop - critical + 0.5 : undefined,
        zIndex: 6,
      };
    }

    return undefined;
  }, [headStickyType, scrollContainer, stickyVisible]);

  return (
    <div className={clsx('relative', className)} ref={container}>
      {headStickyType === 'page' ? (
        <div
          className={clsx('sticky max-w-full z-5 h-0 overflow-visible visible', stickyVisible ? 'invisible' : 'visible')}
          style={{
            top: isLoading ? '0px' : offset,
          }}
        >
          <div className="w-full h-fit overflow-hidden" ref={ref}>
            {props.stickyNode}
          </div>
        </div>
      ) : null}
      <div
        id={id}
        className={clsx('relative max-w-full overflow-auto scrollbar', tableClassName)}
        onScroll={handleTableHorizontalScroll}
      >
        <div className={clsx(headStickyType === 'container' ? 'sticky z-6 top-0' : 'relative z-4')} style={style}>
          {props.stickyNode}
        </div>
        {props.children}
      </div>
    </div>
  );
}
