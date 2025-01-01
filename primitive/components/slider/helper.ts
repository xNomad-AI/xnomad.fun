import { useCallback, useEffect, useRef } from 'react';

type ElementMoveHandle = (x: number, y: number) => void;

export function useMovableElement<T extends HTMLElement>(onMove?: ElementMoveHandle) {
  const record = useRef({ x: 0, y: 0 });

  const handleMoveRef = useRef(onMove);

  handleMoveRef.current = onMove;

  const ref = useRef<T>(null);

  const canMove = useRef(false);

  const listeners = useRef<ElementMoveHandle[]>([]);

  const addElementMoveListener = useCallback((cb: ElementMoveHandle) => listeners.current.push(cb), []);

  const removeElementMoveListener = useCallback(
    (cb: ElementMoveHandle) => (listeners.current = listeners.current.filter((listener) => listener !== cb)),
    []
  );

  useEffect(() => {
    const dom = ref.current;

    const handleEnd = () => {
      if (canMove.current) {
        canMove.current = false;
      }
    };

    const move = (x: number, y: number) => {
      if (canMove.current) {
        const offset = {
          y: y - record.current.y,
          x: x - record.current.x,
        };
        listeners.current.forEach((listener) => listener(offset.x, offset.y));
        handleMoveRef.current?.(offset.x, offset.y);
        record.current.x = x;
        record.current.y = y;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      move(touch.clientX, touch.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.stopPropagation();
      move(e.pageX, e.pageY);
    };

    const start = (x: number, y: number, target: unknown) => {
      if (target === ref.current) {
        canMove.current = true;
        record.current.x = x;
        record.current.y = y;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('touch down');
      start(e.pageX, e.pageY, e.target);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const touch = e.touches[0];
      start(touch.clientX, touch.clientY, touch.target);
    };

    dom?.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    dom?.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      dom?.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);

      dom?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, []);

  return { ref, addElementMoveListener, removeElementMoveListener };
}
