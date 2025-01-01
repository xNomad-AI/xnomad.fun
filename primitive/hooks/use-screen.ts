'use client';

import { ScreenBreakpoint, getScreen } from '@/theme';
import { useMount } from 'ahooks';
import { useMemo } from 'react';
import { create } from 'zustand';

type BreakpointStore = {
  breakpoint: ScreenBreakpoint;
  subscribe: () => void;
};
const useBreakpointStore = create<BreakpointStore>((set, get) => {
  const breakpoint: ScreenBreakpoint = 'base';
  let subscribed = false;
  function onResize() {
    const viewport = window.innerWidth;
    const next = getScreen(viewport);

    if (next !== get().breakpoint) {
      set((state) => ({ ...state, breakpoint: next }));
    }
  }
  return {
    breakpoint,
    subscribe() {
      if (!subscribed) {
        subscribed = true;
        // mount时就去计算下breakpoint
        onResize();
        window.addEventListener('resize', onResize);
      }
    },
  };
});

export function useBreakpoint(lt: ScreenBreakpoint = 'base') {
  const { breakpoint, subscribe } = useBreakpointStore();

  useMount(subscribe);

  const match = useMemo(() => {
    const list: ScreenBreakpoint[] = ['mobile', 'portrait-tablet', 'landscape-tablet', 'base', 'max'];
    const current = list.findIndex((item) => item === breakpoint);
    const target = list.findIndex((item) => item === lt);
    return current <= target;
  }, [breakpoint, lt]);

  return {
    breakpoint,
    match,
  };
}
