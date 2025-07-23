/**
 * @docs https://www.tradingview.com/charting-library-docs/v27/api/modules/Charting_Library/#shapepoint
 * @docs https://www.tradingview.com/charting-library-docs/v27/api/interfaces/Charting_Library.CreateShapeOptions/
 */

import { toThousandNum } from "@/lib/utils/number";

const colors: Record<string, string> = {
  buy: "rgba(12, 161, 85, 1)",
  sell: "rgba(235, 58, 23, 1)",
};
export function addMarker(
  tvWidget: any,
  time: number,
  price: number,
  type: "buy" | "sell",
  amount: number
) {
  return (
    tvWidget
      .activeChart()
      .createExecutionShape()
      // Total:$1000  Amount:1.2M  Price:$0.0024
      .setTooltip(
        `Price:$${toThousandNum(price)}
Total:$${toThousandNum((amount || 0) * price)}}
Amount:${toThousandNum(amount)}`
      )
      .setTextColor(colors[type])
      .setArrowColor(colors[type])
      .setArrowHeight(10)
      .setArrowSpacing(10)
      .setDirection(type)
      .setTime(time)
      .setPrice(price)
  );
}

/**
 * 绘制平均价格线
 * @param tvWidget TradingView 实例
 * @param averagePrice 平均价格
 */
export function drawAveragePriceLine(tvWidget: any, averagePrice: number) {
  try {
    return (
      tvWidget
        .chart()
        .createOrderLine()
        .setText("")
        .setQuantity("")
        // .setQuantity(formats.USD(averagePrice))
        .setPrice(averagePrice)
        .setExtendLeft(true)
        .setLineStyle(1)
        .setLineLength(0)
        .setLineColor("rgba(255, 181, 45, 1)")
        .setQuantityBackgroundColor("rgba(255, 181, 45, 1)")
        .setQuantityBorderColor("rgba(255, 181, 45, 1)")
    );
  } catch (error) {
    // console.log("error", error);
  }
}
