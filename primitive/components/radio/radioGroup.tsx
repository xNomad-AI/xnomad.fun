import clsx from 'clsx';
import React, { PropsWithChildren, useState } from 'react';

import RadioGroupContext from './context';

export type RadioGroupProps = PropsWithChildren<{
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  vertical?: boolean;
  className?: string;
}>;

// 当 defaultValue 有值时，代表此时组件为非受控组件，由组件内部接管状态
export function RadioGroup({ children, value, defaultValue, onChange, vertical = false, className }: RadioGroupProps) {
  const [groupValue, setGroupValue] = useState(defaultValue);

  const onRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
    // value为undefined代表此时RadioGroup是非受控组件,组件内部需要维护自身状态
    value === undefined && setGroupValue(e.target.value);
  };

  return (
    <RadioGroupContext.Provider value={{ value: groupValue ?? value, onChange: onRadioChange, vertical }}>
      <div
        className={clsx('flex items-center flex-wrap justify-start', className, {
          '!justify-center flex-col': vertical,
        })}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
