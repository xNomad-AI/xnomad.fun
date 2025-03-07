import { memo, useEffect, useRef, useState } from "react";
import { TokenPriceChart } from "./trading-view";
import { Card, IconMenu } from "@/primitive/components";
import { TokenInfo } from "../../token-list/network";
import { isNumber } from "@/lib/utils/number/is-number";
const minChartHeight = 330;

function getHeight() {
  const value = localStorage.getItem("token-page-chart-height");
  if (value !== null && isNumber(+value) && +value > minChartHeight) {
    return +value;
  }
  return minChartHeight;
}
type Props = {
  ca: string;
  chain: string;
  tokenInfo: TokenInfo;
};
function BaseChart(props: Props) {
  const { ca, tokenInfo } = props;
  const zeroCount =
    tokenInfo.price
      ?.toString()
      ?.split(".")[1]
      ?.split("")
      .filter((item) => item === "0").length || 0;
  const precision = zeroCount > 0 ? zeroCount + 2 : 2;
  const [height, setHeight] = useState(getHeight);
  const resizableRef = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const dom = resizableRef.current;
    const c = container.current;
    if (dom && c) {
      let startY = 0;
      let heightMemo = Number.parseFloat(getComputedStyle(c).height);
      let nextHeight = heightMemo;
      const handleMouseMove = (event: MouseEvent) => {
        if (startY === 0) return;
        const deltaY = event.pageY - startY;
        const next = heightMemo + deltaY;
        nextHeight = next < minChartHeight ? minChartHeight : next;
        c.style.setProperty("height", nextHeight + "px");
      };

      const handleMouseUp = () => {
        startY = 0;
        setMoving(false);
        setHeight(nextHeight);
        heightMemo = nextHeight;
        localStorage.setItem("token-page-chart-height", heightMemo.toString());
        document.documentElement.style.cursor = "default";
        window.removeEventListener("mousemove", handleMouseMove);
      };

      const handleMouseDown = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        startY = event.pageY;
        setMoving(true);
        document.documentElement.style.cursor = "row-resize";
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      };

      dom.addEventListener("mousedown", handleMouseDown);
      return () => {
        dom.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);
  return (
    <Card
      ref={container}
      className='w-full relative'
      style={{
        height,
      }}
    >
      <div className='w-full h-[calc(100%-24px)] relative'>
        <TokenPriceChart
          pairAddress={ca}
          baseToken={tokenInfo.symbol}
          quoteToken={"USD"}
          precision={precision}
        />
      </div>
      {moving ? (
        <div className='w-full h-[calc(100%-16px)] absolute top-0 left-0 z-[1000]'></div>
      ) : null}
      <div
        ref={resizableRef}
        className='w-full h-24 flex items-center justify-center bg-background'
      >
        <IconMenu className='text-size-20' />
      </div>
    </Card>
  );
}

export const Chart = memo(BaseChart);
