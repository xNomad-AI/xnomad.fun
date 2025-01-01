import { useRef, useState } from 'react';

import { DropdownController } from '../dropdown';

export type SelectController<T> = ReturnType<typeof useSelectController<T>>;

export function useSelectController<T>() {
  const dropdownController = useRef<DropdownController | null>(null);
  const [value, SelectValueHandle] = useState<T>();
  return {
    dropdownController,
    value,
    SelectValueHandle,
  };
}
