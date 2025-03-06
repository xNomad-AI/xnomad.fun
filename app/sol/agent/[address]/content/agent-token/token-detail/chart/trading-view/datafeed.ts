import { TokenPriceChart } from "./types";
type QueryParams = {
  address: string;
};

type TokenPriceChartQuery = QueryParams & {
  /**
   * 1m/3m/5m/15m/30m/1H/2H/4H/6H/8H/12H/1D/3D/1W/1M
   */
  interval: string;
  from: number;
  to: number;
};

const getTokenPriceChartApiPath = (props: TokenPriceChartQuery) => {
  const url = `/addresses/token/ohlc/${props.address}?interval=${props.interval}&from=${props.from}&to=${props.to}`;
  const baseUrl = `${process.env.TOKEN_STORY_API_HOST}/api/v1`;
  return `${baseUrl}${url}`;
};

const timeIntervalMap: Record<
  string,
  { timeframe: string; aggregate: number }
> = {
  // 1m/3m/5m/15m/30m/1H/2H/4H/6H/8H/12H/1D/3D/1W/1M
  "1": { timeframe: "1m", aggregate: 1 },
  "5": { timeframe: "5m", aggregate: 5 },
  "15": { timeframe: "15m", aggregate: 15 },
  "60": { timeframe: "1H", aggregate: 1 },
  "240": { timeframe: "4H", aggregate: 4 },
  "720": { timeframe: "12H", aggregate: 12 },
  "1D": { timeframe: "1D", aggregate: 1 },
  "3D": { timeframe: "3D", aggregate: 3 },
  "1W": { timeframe: "1W", aggregate: 1 },
};

export const TIME_FRAMES = [
  { text: "1min", resolution: "1" },
  { text: "5mins", resolution: "5" },
  { text: "15mins", resolution: "15" },
  { text: "1hour", resolution: "60" },
  { text: "4hours", resolution: "240" },
  { text: "12hours", resolution: "720" },
  { text: "1day", resolution: "D" },
  { text: "3days", resolution: "3D" },
  { text: "1week", resolution: "W" },
];
const TimestampMap = {
  "1": 1 * 60,
  "5": 5 * 60,
  "15": 15 * 60,
  "60": 60 * 60,
  "240": 240 * 60,
  "720": 720 * 60,
  "1D": 24 * 60 * 60,
  "3D": 3 * 24 * 60 * 60,
  "1W": 7 * 24 * 60 * 60,
};

const MinRequetNumberMap = {
  "1": 500,
  "5": 500,
  "15": 500,
  "60": 200,
  "240": 200,
  "720": 60,
  "1D": 30,
  "3D": 10,
  "1W": 4,
};

const configurationData = {
  supported_resolutions: ["1", "5", "15", "1H", "4H", "12H", "1D", "3D", "1W"],
  supports_marks: true,
  symbols_types: [
    {
      name: "crypto",
      value: "crypto",
    },
  ],
};

const formerIntervalArr: any[] = [];
export const SPLIT_SYMBOL = "&-";
export const paramsArray: any[] = [];
interface ApiRes {
  items: TokenPriceChart[];
  meta: {
    base: {
      address: string;
      name: string;
      symbol: string;
      coingecko_coin_id: string;
    };
    quote: {
      address: string;
      name: string;
      symbol: string;
      coingecko_coin_id: string;
    };
  };
}
export class Datafeed {
  constructor() {}

  public onReady = (callback: any) => {
    setTimeout(() => callback(configurationData), 300);
  };

  public resolveSymbol = async (
    symbolName: string,
    onSymbolResolvedCallback: any
  ) => {
    if (!paramsArray?.length) {
      symbolName
        .split(SPLIT_SYMBOL)
        ?.forEach((item: string) => paramsArray.push(item));
    }
    const precision = paramsArray[3];
    const symbolInfo = {
      ticker: paramsArray[0],
      currency: paramsArray[2],
      pairAddress: paramsArray[1],
      name: paramsArray[0],
      full_name: paramsArray[0],
      type: "crypto",
      session: "24x7",
      minmov: 1,
      // pricescale: precision === 2 ? 100 : 10000,
      pricescale: 10 ** precision,

      priceScaleMode: 1,
      has_intraday: true,
      has_no_volume: false,
      has_weekly_and_monthly: true,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: precision,
    };
    setTimeout(() => {
      onSymbolResolvedCallback(symbolInfo);
    }, 300);
  };

  public getBars = async (
    symbolInfo: any,
    resolution: any,
    periodParams: any,
    onHistoryCallback: any,
    onErrorCallback: any
  ) => {
    const { to, countBack, firstDataRequest } = periodParams;
    if (formerIntervalArr.length > 0 && firstDataRequest) {
      formerIntervalArr.forEach((interval) => {
        clearInterval(interval);
      });
    }
    const requestNumber = Math.max(
      MinRequetNumberMap[resolution as keyof typeof MinRequetNumberMap],
      countBack + 10
    );
    const end = to;
    const intervalTime = TimestampMap[resolution as keyof typeof TimestampMap];

    const getTradeData = async (endTime: number, limit: number) => {
      const timeInterval = timeIntervalMap[resolution as string];
      const res = await fetch(
        getTokenPriceChartApiPath({
          address: symbolInfo.pairAddress,
          interval: timeInterval.timeframe,
          from: endTime - limit * intervalTime,
          to: endTime,
        })
        // `https://api.geckoterminal.com/api/v2/networks/eth/pools/${symbolInfo.pairAddress}/ohlcv/${timeInterval.timeframe}?aggregate=${timeInterval.aggregate}&limit=${limit}&before_timestamp=${endTime}&currency=${symbolInfo.currency}`
      );
      const result = await res.json();
      return result as ApiRes;
    };

    const endTimeList = [end];
    const limit = Math.min(requestNumber, 1000);
    const MAX_POINTS = 1000;
    if (requestNumber > MAX_POINTS) {
      const partNum = Math.ceil(requestNumber / MAX_POINTS);

      for (let i = 1; i < partNum; i++) {
        endTimeList.unshift(end - i * limit * intervalTime);
      }
    }

    let data: any[] = [];
    try {
      const response = await Promise.all(
        endTimeList.map((endTime) => getTradeData(endTime, limit))
      );

      response.forEach((res) => {
        data = data.concat(res?.items || []);
      });
      const graphData = data.map((trade) => ({
        time: trade.unixTime * 1000,
        open: trade.o,
        close: trade.c,
        high: trade.h,
        low: trade.l,
        volume: trade.v,
      }));
      if (graphData.length > 0) {
        onHistoryCallback([...graphData.sort((a, b) => a.time - b.time)], {
          noData: false,
        });
      } else {
        onHistoryCallback([], {
          noData: true,
        });
      }
    } catch (error) {
      onHistoryCallback([], {
        noData: true,
      });
      onErrorCallback(error);
      console.log("getBars error", error);
    }
  };

  public onRealtimeCallback = (ohlcData: any) => {
    // console.log('onRealtimeCallback', ohlcData)
  };

  public subscribeBars = (
    symbolInfo: any,
    resolution: any,
    onRealtimeCallback: any,
    _subscribeUID: any
  ) => {
    this.onRealtimeCallback = onRealtimeCallback;
  };

  public unsubscribeBars = (_subscriberUID: any) => {
    return null;
  };

  public markLists: any[] = [];

  onDataCallback = (data: any) => {
    console.log("onDataCallback", data);
    this.markLists = data;
  };

  getMarks = (
    symbolInfo: any,
    startDate: any,
    endDate: any,
    onDataCallback: any,
    resolution: any
  ) => {
    this.onDataCallback = (data: any) => {
      this.markLists = data;
      onDataCallback(data);
    };
    onDataCallback(this.markLists);
  };
}
