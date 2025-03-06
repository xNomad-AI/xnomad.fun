import { Card, Spin } from "@/primitive/components";
import "./index.css";
import { TradingViewGraphProps } from "./types";
import { useTradingView } from "./use-trading-view";

function TradingViewGraph({
  pairAddress,
  baseToken,
  quoteToken,
  chartType,
  precision,
  draw,
}: TradingViewGraphProps & {
  draw?: TokenPriceChartDraw;
}) {
  const { smallTradingViewRef, isSmallTradingViewInitialize } = useTradingView({
    pairAddress,
    baseToken,
    quoteToken,
    chartType,
    precision,
    draw,
  });
  return (
    <>
      {isSmallTradingViewInitialize && (
        <div
          className='flex items-center justify-center absolute w-full h-full z-[1003] top-0 left-0 bg-background'
          style={{
            height: `100%`,
          }}
        >
          <Spin />
        </div>
      )}
      <div
        id={"tv_chart_container"}
        className='tradingViewContainer'
        ref={smallTradingViewRef}
        style={
          isSmallTradingViewInitialize
            ? {
                width: 0,
                height: 0,
                opacity: 0,
              }
            : { height: "100%", width: "100%" }
        }
      ></div>
    </>
  );
}

export type TokenPriceChartDraw = {
  needDrawMarkers?: boolean;
  needDrawAveragePriceLine?: boolean;
  drawMarkers?: (widget: any) => any;
  drawAveragePriceLine?: (widget: any) => any;
};

export function TokenPriceChart({
  pairAddress,
  baseToken,
  quoteToken,
  precision = 2,
  draw,
}: {
  pairAddress: string;
  baseToken: string;
  quoteToken: string;
  precision?: number;
  draw?: TokenPriceChartDraw;
}) {
  return (
    <TradingViewGraph
      key={`${pairAddress}-${baseToken}-${quoteToken}-${precision}`}
      pairAddress={pairAddress}
      baseToken={baseToken}
      quoteToken={quoteToken}
      chartType={"usd"}
      precision={precision}
      draw={draw}
    />
  );
}
