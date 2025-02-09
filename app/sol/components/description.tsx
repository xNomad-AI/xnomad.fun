"use client";

import { useMemo, useState } from "react";

import { TextButton } from "@/components/text-button";
import { useBreakpoint } from "@/primitive/hooks/use-screen";

type Props = {
  __html: string;
};

export function Description(props: Props) {
  const { __html } = props;
  const [manualFull, manualSetFull] = useState(false);
  const words = useMemo(() => {
    return __html.split(" ");
  }, [__html]);
  const { breakpoint } = useBreakpoint();
  const wordsLimit = useMemo(
    () => (breakpoint === "mobile" ? 20 : 200),
    [breakpoint]
  );
  const isOverflow = useMemo(
    () => words.length > wordsLimit,
    [words, wordsLimit]
  );
  return (
    <p>
      <span
        className='z-2'
        dangerouslySetInnerHTML={{
          __html:
            isOverflow && !manualFull
              ? `${words.slice(0, wordsLimit).join(" ")}...`
              : __html,
        }}
      ></span>
      &nbsp;
      {!manualFull && isOverflow ? (
        <TextButton
          withDecoration
          className='text-white inline-flex'
          onClick={() => {
            manualSetFull(true);
          }}
        >
          Show More
        </TextButton>
      ) : manualFull && isOverflow ? (
        <TextButton
          withDecoration
          className='text-white inline-flex'
          onClick={() => {
            manualSetFull(false);
          }}
        >
          Less
        </TextButton>
      ) : null}
    </p>
  );
}
