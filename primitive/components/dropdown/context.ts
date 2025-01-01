import { createContext, useContext } from 'react';

type DropdownContext = {
  visible: boolean;
  close: () => void;
  open: () => void;
  toggle: () => void;
};

export const dropdownContext = createContext<Partial<DropdownContext>>({});

export function useDropdown() {
  return useContext(dropdownContext) as DropdownContext;
}
