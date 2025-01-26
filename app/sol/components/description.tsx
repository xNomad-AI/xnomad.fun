"use client";

import { TextButton } from "@/components/text-button";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

type Props = {
  __html: string;
};

export function Description(props: Props) {
  const { __html } = props;
  const [overflow, setOverflow] = useState(false);

  const [manualFull, manualSetFull] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dom = ref.current;
    const onResize = () => {
      if (dom) {
        const { scrollWidth, clientWidth } = dom;
        const overflow = scrollWidth > clientWidth;
        setOverflow(overflow);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className='flex flex-col gap-4'>
      <div
        className='portrait-tablet:hidden flex items-center gap-0 relative box-border z-2 text-text2 min-h-20'
        data-role='fill'
      >
        <div
          ref={ref}
          className={clsx(
            "leading max-w-full min-w-0",
            "[&>*]:inline",
            "[&_a]:underline [&_a]:cursor-pointer ",
            manualFull ? "" : "truncate max-h-20  [&_*]:inline"
          )}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html,
          }}
        ></div>
        {!manualFull && overflow ? (
          <TextButton
            className='text-text1'
            withDecoration
            onClick={() => {
              manualSetFull(true);
            }}
          >
            More
          </TextButton>
        ) : null}
      </div>
      {manualFull && overflow ? (
        <TextButton
          withDecoration
          onClick={() => {
            manualSetFull(false);
          }}
        >
          Less
        </TextButton>
      ) : null}
    </div>
  );
}
