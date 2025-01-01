import { useMemoizedFn } from 'ahooks';
import { useMemo, useRef, useState } from 'react';

type SetStateFn<T> = (oldState: T) => T;
type SetStateParam<T> = T | SetStateFn<T>;
/**
 * 不要使用ref.current进行赋值
 * @param initState 初始状态
 * @returns
 */
export function useRefState<T>(initState: T) {
  const [state, setState] = useState<T>(initState);
  const ref = useRef<T>(initState);
  const setAllState = useMemoizedFn((newState: SetStateParam<T>) => {
    if (typeof newState === 'function') {
      const _newState = (newState as SetStateFn<T>)(ref.current);
      setState(_newState);
      ref.current = _newState;
    } else {
      ref.current = newState;
      setState(newState);
    }
  });
  const res = useMemo(() => [state, setAllState, ref], [setAllState, state]);
  return res as [T, (newState: SetStateParam<T>) => void, React.MutableRefObject<T>];
}
