import { createContext, useContext } from 'react';

import { ButtonSize } from './type';

type ButtonGroupState = {
  inGroup: boolean;
  size: ButtonSize;
};
export const buttonGroupContext = createContext<ButtonGroupState>({
  inGroup: false,
  size: 'm',
});

export function useButtonGroup() {
  return useContext(buttonGroupContext);
}
