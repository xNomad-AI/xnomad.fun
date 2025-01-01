import { Options } from "@popperjs/core";
import clsx from "clsx";
import {
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import ClickAwayListener from "react-click-away-listener";
import { usePopper } from "react-popper";

import { useMountFloatLayer } from "../float-layer";
import { dropdownContext } from "./context";

export type DropdownProps = {
  content?: ReactNode;
  className?: string;
  dropdownClassName?: string;
  trigger?: ("click" | "hover")[];
  placement?: "start" | "end" | "auto";
  stretch?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onClose?: () => void;
  onOpen?: () => void;
  nest?: boolean;
  disableFlipAutoHide?: boolean;
};
const { Provider } = dropdownContext;
export type DropdownController = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const Dropdown = forwardRef<
  DropdownController,
  PropsWithChildren<DropdownProps>
>(function Dropdown(props, ref) {
  const {
    children,
    content,
    className,
    stretch = false,
    trigger = ["hover", "click"],
    placement: position = "end",
    dropdownClassName,
    onVisibleChange,
    onClose,
    onOpen,
    nest = false,
    disableFlipAutoHide = false,
  } = props;

  const [show, setShow] = useState(false);
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const clickAction = trigger.includes("click");
  const hoverAction = trigger.includes("hover");

  const options = useMemo(() => {
    return {
      placement: position === "auto" ? "auto" : `bottom-${position}`,
      modifiers: [
        { name: "eventListeners", enabled: true },
        {
          name: "flip",
          options: {
            fallbackPlacements: [`top-${position}`],
          },
        },
        {
          name: "offset",
          options: {
            offset: [0, 0],
          },
        },
        {
          name: "hide",
          enabled: !disableFlipAutoHide,
        },
      ],
    } satisfies Partial<Options>;
  }, [disableFlipAutoHide, position]);

  const { styles, attributes, forceUpdate } = usePopper(
    referenceElement,
    popperElement,
    options
  );

  const open = () => {
    forceUpdate?.();
    setShow(true);
    onOpen?.();
    onVisibleChange?.(true);
  };

  const close = () => {
    setShow(false);
    onVisibleChange?.(false);
    onClose?.();
  };

  const toggle = () => {
    if (show) {
      close();
    } else {
      open();
    }
  };

  const handleClick = () => {
    if (clickAction && hoverAction) {
      open();
    } else if (clickAction) {
      toggle();
    }
  };

  const handleClickAway = (event: Event) => {
    if (
      event.target !== popperElement &&
      show &&
      (event.target as any)?.nodeName !== "INPUT" &&
      !popperElement?.contains(event.target as Node)
    ) {
      close();
    }
  };

  useImperativeHandle(ref, () => {
    return {
      close,
      open,
      toggle,
    };
  });

  const dropdownWidth = useMemo(() => {
    if (show && stretch) {
      return referenceElement?.getBoundingClientRect()?.width;
    }
    return undefined;
  }, [referenceElement, show, stretch]);

  useEffect(() => {
    if (show) {
      forceUpdate?.();
    }
  }, [forceUpdate, show]);

  const _dropdown = (
    <div
      ref={setPopperElement}
      onMouseEnter={hoverAction ? open : undefined}
      onFocus={hoverAction ? open : undefined}
      onBlur={hoverAction ? close : undefined}
      onMouseLeave={hoverAction ? close : undefined}
      style={{
        ...styles.popper,
        width: dropdownWidth,
      }}
      {...attributes.popper}
      data-show={show}
      className={clsx(
        nest ? "fixed z-float" : "",
        'hidden data-[show="true"]:block',
        "data-[popper-reference-hidden=true]:invisible",
        "data-[popper-reference-hidden=true]:pointer-events-none",
        "data-[popper-placement^=bottom]:pt-8",
        "data-[popper-placement^=top]:pb-8"
      )}
    >
      <div
        className={clsx(
          "shadow-base border-1 bg-background py-8 rounded-6 overflow-hidden",
          dropdownClassName
        )}
      >
        {content}
      </div>
    </div>
  );

  const dropdownFloat = useMountFloatLayer(_dropdown, {
    until: show && !nest,
    mount: show && !nest,
  });

  return (
    <Provider value={{ visible: show, open, close, toggle }}>
      <ClickAwayListener onClickAway={handleClickAway} focusEvent={"focusout"}>
        <div
          ref={setReferenceElement}
          className={clsx(
            "cursor-default inline-block w-max relative",
            className
          )}
          onMouseEnter={hoverAction ? open : undefined}
          onClick={handleClick}
          onFocus={hoverAction ? open : undefined}
          onBlur={hoverAction ? close : undefined}
          onMouseLeave={hoverAction ? close : undefined}
        >
          {children}
          {nest ? _dropdown : null}
        </div>
      </ClickAwayListener>
      {nest ? null : dropdownFloat}
    </Provider>
  );
});
