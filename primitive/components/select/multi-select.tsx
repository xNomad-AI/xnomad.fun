import { useControllableValue } from "ahooks";
import clsx from "clsx";
import { JSX, PropsWithChildren, ReactNode, useCallback } from "react";

import { Checkbox } from "../checkbox";
import { Select, SelectProps } from "./select";

export interface MultiOption<V> {
  value: V;
  label: ReactNode | string | number;
  key?: string | number;
}

export type MultiSelectType<V> = (props: MultiSelectProps<V>) => JSX.Element;

interface MultiSelectProps<V>
  extends Pick<
    SelectProps<MultiOption<V>>,
    | "searchConfig"
    | "onDropDownScroll"
    | "controller"
    | "emptyContent"
    | "dropdownClassName"
    | "titleStretch"
    | "dropDownStretch"
    | "className"
    | "placement"
    | "nest"
    | "disableFlipAutoHide"
  > {
  defaultValue?: V[];
  value?: V[];
  options: MultiOption<V>[];
  renderItem?: (v?: MultiOption<V>) => ReactNode;
  onSelect?: (value: V, allSelected: V[]) => void;
  titleConfig?: {
    prefix?: React.ReactNode;
    renderer?: (value?: V[], options?: MultiOption<V>[]) => React.ReactNode; // children 优先于 titleContent
    suffix?: ReactNode;
    tooltip?: ReactNode;
    height?: number;
    padding?: string;
    width?: number | string;
    stretch?: boolean;
  };
  maxInfo?: {
    max: number;
    text: string;
    onExceedMax: () => void;
  };
  withNumTag?: boolean;
  foot?: ReactNode;
}

export function MultiSelect<V>(props: PropsWithChildren<MultiSelectProps<V>>) {
  const {
    options = [],
    onSelect,
    titleConfig,
    renderItem,
    maxInfo,
    searchConfig,
    onDropDownScroll,
    withNumTag,
    foot,
    children,
    defaultValue = [],
    controller,
    titleStretch,
    dropDownStretch,
    className,
    placement,
    nest = false,
    disableFlipAutoHide,
  } = props;
  const optionWithIndex = options.map((op, index) => ({
    ...op,
    index,
  }));
  const [selectedItems, setSelectedItems] = useControllableValue<V[]>(props, {
    defaultValue,
  });
  const onItemClick = (item: MultiOption<V>) => {
    const isSelected = selectedItems.some((v) => v === item?.value);
    let newSelected: V[];
    if (isSelected) {
      newSelected = selectedItems.filter((v) => v !== item?.value);
    } else {
      newSelected = [...selectedItems, item.value];
    }
    if ([...newSelected].length > (maxInfo?.max ?? Infinity)) {
      maxInfo?.onExceedMax?.();
      return;
    }
    onSelect?.(item.value, newSelected);
    setSelectedItems([...newSelected]);
  };

  const optionRender = useCallback(
    (item?: MultiOption<V>) => {
      const isSelected = selectedItems.some((v) => v === item?.value);
      return (
        <div className='flex items-center h-full w-full justify-between'>
          {renderItem ? renderItem(item) : item?.label}
          <Checkbox className='text-size-18 flex-shrink-0' value={isSelected} />
        </div>
      );
    },
    [renderItem, selectedItems]
  );

  return (
    <Select
      nest={nest}
      disableFlipAutoHide={disableFlipAutoHide}
      placement={placement}
      className={className}
      searchConfig={searchConfig}
      titleConfig={{ ...titleConfig, renderer: undefined }}
      titleStretch={titleStretch}
      dropDownStretch={dropDownStretch}
      onDropDownScroll={onDropDownScroll}
      onSelect={onItemClick}
      optionConfig={{
        data: optionWithIndex,
        renderer: (item) => optionRender(item),
        key: (item) => item?.key?.toString?.() || JSON.stringify(item?.value),
        foot,
      }}
      emptyContent={props.emptyContent}
      activeIndex={optionWithIndex
        .filter((op) => selectedItems?.includes?.(op.value))
        .map((si) => si.index)}
      stayOpenAfterSelect
      controller={controller}
    >
      {withNumTag && selectedItems.length > 0 && (
        <NumTag>{selectedItems.length}</NumTag>
      )}
      {children || titleConfig?.renderer?.(selectedItems, options)}
    </Select>
  );
}

function NumTag({
  children,
  className,
  ...rest
}: PropsWithChildren<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >
>) {
  return (
    <span
      {...rest}
      className={clsx(
        className,
        "absolute -top-8 -right-8 h-18 text-size-12 w-18 rounded-full leading-[1.125rem] text-center bg-primary text-white"
      )}
    >
      {children}
    </span>
  );
}
