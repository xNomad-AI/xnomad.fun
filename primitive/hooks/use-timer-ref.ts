import { useRef } from 'react';

export function useTimerRef() {
  return useRef<ReturnType<typeof setTimeout> | null>(null);
}
