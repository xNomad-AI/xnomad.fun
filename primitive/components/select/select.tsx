import { useControllableValue } from "ahooks";
import clsx from "clsx";
import { PropsWithChildren, ReactNode, useMemo, useState } from "react";

import { Dropdown } from "../dropdown";
import { useDropdown } from "../dropdown/context";
import { IconDownFilled, IconSearch } from "../icon";
import { TextField } from "../text-field";
import { SelectController, useSelectController } from "./controller";
import { SelectOption } from "./select-option";

import { InteractiveBox } from "../interactive-box";
import { size } from "lodash";

export type SelectProps<T> = {
  // 基础设置
  value?: T;
  onSelect?: (value: T) => void;
  // 下拉框设置
  optionConfig?: {
    data: Array<T>;
    renderer: (value: T, index: number, isSelected: boolean) => React.ReactNode;
    key?: (value: T) => string;
    foot?: ReactNode;
  };
  dropDownStretch?: boolean; // dropdown是否拉伸
  placement?: Parameters<typeof Dropdown>[0]["placement"];
  // 标题设置
  titleStretch?: boolean;
  titleConfig?: {
    prefix?: React.ReactNode;
    renderer?: (currentValue?: T, data?: T[]) => React.ReactNode; // children 优先于 titleContent
    suffix?: ReactNode;
  };
  controller?: SelectController<T>;
  // 可选配置
  onClose?: () => void;
  onOpen?: () => void;
  onDropDownScroll?: React.UIEventHandler<HTMLDivElement>; // 一般是配合滚动加载使用
  placeholder?: string;
  disabled?: boolean;
  searchConfig?: SearchProps<T>;
  activeIndex?: number[]; // 可以控制哪些选项显示已选中，优先级高于组件内部的状态
  stayOpenAfterSelect?: boolean; // 点击后是否立即关闭
  enableDeselect?: boolean; // 是否支持没有选中项
  // 自定义设置
  content?: ReactNode;
  className?: string;
  dropdownClassName?: string;
  dropdownContainerClassName?: string;
  contentMaxHeight?: number;
  emptyContent?: ReactNode;
  nest?: boolean;
  disableFlipAutoHide?: boolean;
  reverse?: boolean;
};
export function Select<T>(props: PropsWithChildren<SelectProps<T>>) {
  const {
    children,
    className,
    placeholder,
    disabled = false,
    dropdownClassName,
    searchConfig = {},
    content,
    contentMaxHeight,
    onDropDownScroll,
    emptyContent,
    activeIndex,
    enableDeselect,
    stayOpenAfterSelect,
    controller,
    optionConfig,
    titleConfig,
    titleStretch,
    dropDownStretch,
    onClose,
    onOpen,
    dropdownContainerClassName,
    placement,
    nest = false,
    disableFlipAutoHide = false,
    reverse = false,
  } = props;
  const { renderer: titleContent, prefix, suffix } = titleConfig ?? {};
  const _selectController = useSelectController<T>();
  const selectController = controller || _selectController;
  const { dropdownController } = selectController;
  const { data, renderer, key, foot } = optionConfig ?? {};
  const [selectedItem, setSelectedItem] = useControllableValue<T | undefined>(
    props,
    {
      trigger: "onSelect",
    }
  );
  const { search, textFieldValue } = useSearch(searchConfig);
  const displayedData = useMemo(
    () =>
      data?.filter?.(
        (value, index, arr) =>
          !searchConfig.searchFilter ||
          !textFieldValue ||
          searchConfig.searchFilter?.(textFieldValue, {
            value,
            index,
            allValues: arr,
          })
      ),
    [data, textFieldValue, searchConfig]
  );
  const contentDefaultHeight = useMemo(
    () => (searchConfig.searchFilter ? "16.5rem" : "20rem"),
    [searchConfig.searchFilter]
  );
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    onClose?.();
    setVisible(false);
  };
  const handleOpen = () => {
    onOpen?.();
    setVisible(true);
  };
  return (
    <Dropdown
      ref={dropdownController}
      nest={nest}
      onClose={handleClose}
      placement={placement}
      onOpen={handleOpen}
      disableFlipAutoHide={disableFlipAutoHide}
      content={
        content ?? (
          <>
            {searchConfig.searchFilter && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className='px-12 mb-8'
              >
                {search}
              </div>
            )}
            <div
              className='scrollbar w-full flex flex-col overflow-y-auto'
              onScroll={onDropDownScroll}
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                maxHeight: contentMaxHeight
                  ? contentMaxHeight
                  : contentDefaultHeight,
              }}
            >
              {displayedData?.length && displayedData?.length > 0
                ? displayedData.map((item, index) => {
                    const isSelected = Array.isArray(activeIndex)
                      ? activeIndex.includes(index)
                      : selectedItem === item;
                    return (
                      <SelectOption
                        key={key ? key(item) : JSON.stringify(item)}
                        selected={isSelected}
                        reverse={reverse}
                        handleSelect={() => {
                          if (enableDeselect && isSelected) {
                            setSelectedItem(undefined, index);
                            selectController.SelectValueHandle(undefined);
                          } else {
                            setSelectedItem(item, index);
                            selectController.SelectValueHandle(item);
                          }
                          if (!stayOpenAfterSelect) {
                            dropdownController.current?.close();
                          }
                        }}
                      >
                        {renderer?.(item, index, isSelected)}
                      </SelectOption>
                    );
                  })
                : emptyContent}
              {foot}
            </div>
          </>
        )
      }
      className={clsx(dropdownContainerClassName, {
        "!w-full !flex-grow": titleStretch,
      })}
      stretch={dropDownStretch}
      trigger={disabled ? [] : ["click"]}
      dropdownClassName={clsx(
        !reverse ? "!bg-background" : "!bg-surface",
        dropdownClassName
      )}
    >
      <InteractiveBox
        disabled={disabled}
        className={clsx(
          "flex items-center rounded-6 relative cursor-pointer w-full",
          {
            "w-full flex-grow": titleStretch,
          },
          "h-40 px-12 gap-8",
          reverse ? "bg-background" : " bg-surface",
          className
        )}
      >
        {prefix}
        <div className='flex-grow flex-shrink'>
          {children || titleContent?.(selectedItem, data) || placeholder}
        </div>
        {suffix ?? (
          <IconDownFilled
            className={clsx("flex-shrink transition-transform duration-300", {
              "-rotate-180": visible,
            })}
          />
        )}
      </InteractiveBox>
    </Dropdown>
  );
}

interface SearchProps<T> {
  searchFilter?: (
    inputValue: string | undefined,
    filterOption: { value: T; index: number; allValues: T[] }
  ) => boolean; // 搜索框的逻辑需要自定义
  onTextFiledChange?: (v: string) => void;
  placeholder?: string;
}
function useSearch<T>({
  onTextFiledChange,
  placeholder = "search",
}: SearchProps<T>) {
  const [textFieldValue, setTextFieldValue] = useState<string | undefined>(
    undefined
  );
  const search = useMemo(
    () => (
      <div className='w-full'>
        <TextField
          prefixNode={<IconSearch />}
          value={textFieldValue}
          onChange={(e) => {
            setTextFieldValue(e?.target?.value);
            onTextFiledChange?.(e?.target?.value);
          }}
          placeholder={placeholder}
        />
      </div>
    ),
    [onTextFiledChange, placeholder, setTextFieldValue, textFieldValue]
  );
  return {
    search,
    textFieldValue,
  };
}
