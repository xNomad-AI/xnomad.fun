import { useMount } from 'ahooks';
import { useState } from 'react';

export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useMount(() => {
    setIsMounted(true);
  });

  return {
    isMounted,
  };
}
