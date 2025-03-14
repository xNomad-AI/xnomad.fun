import { useMemoizedFn, useUnmount, useUpdateEffect, useBoolean } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { Datafeed, paramsArray, SPLIT_SYMBOL } from "./datafeed";
import { TradingViewGraphProps } from "./types";
import { TokenPriceChartDraw } from ".";
import { useTheme } from "@/lib/theme";
import { toThousandNum } from "@/lib/utils/number";
import { useTokenPageSocketStore } from "../../store/socket";
import { dealSmallNumber } from "@/components/token-number/utils";
import BigNumber from "bignumber.js";

export const useTradingView = ({
  pairAddress,
  baseToken,
  quoteToken,
  chartType,
  precision,
  draw,
}: TradingViewGraphProps & {
  draw?: TokenPriceChartDraw;
}) => {
  const { initTradingView, dealDrawingBar } = useTradingViewBase({
    pairAddress,
    baseToken,
    quoteToken,
    chartType,
    precision,
  });

  const {
    isSmallTradingViewInitialize,
    showTradingViewExpandIcon,
    smallTradingViewDrawingBarVisible,
    smallTradingViewRef,
  } = useSmallTradingView({ initTradingView, dealDrawingBar, chartType, draw });
  const {
    expandTradingViewDrawingBarVisible,
    isExpandTradingViewInitialize,
    tradingViewExpanded,
  } = useExpandTradingView({
    initTradingView,
    dealDrawingBar,
    chartType,
  });

  return {
    smallTradingViewRef,
    tradingViewExpanded,
    showTradingViewExpandIcon,
    smallTradingViewDrawingBarVisible,
    expandTradingViewDrawingBarVisible,
    isSmallTradingViewInitialize,
    isExpandTradingViewInitialize,
  };
};

function useTradingViewBase({
  baseToken,
  quoteToken,
  pairAddress,
  chartType,
  precision,
}: TradingViewGraphProps) {
  const { colors } = useTheme();
  const tradingViewInstanceArray = useRef<any[]>([]);

  const initTradingView = useMemoizedFn((id: string) => {
    if (paramsArray?.length > 0) {
      while (paramsArray?.length > 0) {
        paramsArray.pop();
      }
    }

    const tvWidget = new (window as any).TradingView.widget({
      symbol: [
        `${baseToken}/${quoteToken}`,
        pairAddress,
        chartType,
        precision,
      ].join(SPLIT_SYMBOL), // default symbol
      interval:
        localStorage.getItem(
          "trading_view_chart.lastUsedTimeBasedResolution"
        ) || "1", // default interval
      width: "100%",
      height: "100%",
      fullscreen: true, // displays the chart in the fullscreen mode
      container: id,
      theme: "dark",
      disabled_features: [
        "header_symbol_search",
        "header_compare",
        "header_saveload",
        "display_market_status",
        "symbol_search_hot_key",
        "display_market_status",
        "header_fullscreen_button",
        "volume_force_overlay",
        "symbol_info",
        "order_panel",
        "trading_account_manager",
        "show_object_tree",
        "object_tree_legend_mode",
        "add_to_watchlist",
        "header_layouttoggle",
        "open_account_manager",
        "multiple_watchlists",
        "order_panel",
        "buy_sell_buttons",
        "right_toolbar",
        "broker_button",
        "show_order_panel_on_start",
        "show_context_menu_in_crosshair_if_only_one_item",
        "trading_notifications",
        "show_trading_notifications_history",
        "watchlist_context_menu" as any,
        "buy_sell_buttons",
        "header_quick_search",
        "chart_hide_close_position_button",
      ],
      enabled_features: [
        "secondary_series_extend_time_scale",
        "custom_resolutions",
        "custom_indicators",
        // 分割线
        "seconds_resolution",
        "two_character_bar_marks_labels",
        "use_localstorage_for_settings",
      ],
      // time_frames: [
      //   { text: "3m", resolution: "60", description: "3 Month" },
      //   { text: "1m", resolution: "60", description: "1 Month" },
      //   { text: "5d", resolution: "5", description: "5 Days" },
      //   { text: "1d", resolution: "1", description: "1 Days" },
      // ],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: "en",
      datafeed: new Datafeed() as any,
      library_path: "/charting-library/charting_library/",
      custom_css_url: "/charting-library/custom.css",
      overrides: {
        "paneProperties.background": colors.background.DEFAULT,
        "paneProperties.color": colors.text1.DEFAULT,
        "paneProperties.backgroundType": "solid",
        "scalesProperties.backgroundColor": colors.background.DEFAULT,
        "scalesProperties.textColor": colors.text1.DEFAULT,
        volumePaneSize: "medium",

        "mainSeriesProperties.volCandlesStyle.downColor": colors.red.DEFAULT,
        "mainSeriesProperties.volCandlesStyle.upColor": colors.green.DEFAULT,
      },
      loading_screen: {
        foregroundColor: colors.background.DEFAULT,
        backgroundColor: colors.background.DEFAULT,
      },
      // hideHeaderWidget: true,
      favorites: {
        intervals: ["1", "5", "60", "240", "1D"],
        indicators: ["EMA Cross", "Relative Strength Index"],
      },
      custom_formatters: {
        priceFormatterFactory: (symbolInfo: any, minTick: any) => {
          return {
            format: (price: number, signPositive: boolean) => {
              const num = BigNumber(price);
              const isSmallNumber = num.lt(0.001) && num.gt(0);
              if (isSmallNumber) {
                const { nonZeroString, decimalSubscript } =
                  dealSmallNumber(price);
                return `0.0${decimalSubscript}${nonZeroString}`;
              }
              return toThousandNum(price);
            },
          };
        },
      },
      settings_adapter: {
        setValue: function (key: string, value: any) {
          localStorage.setItem(`trading_view_${key}`, value);
        },
        removeValue: function (key: string) {
          localStorage.removeItem(`trading_view_${key}`);
        },
      },
    });
    tradingViewInstanceArray.current.push(tvWidget);

    return tvWidget;
  });

  /**
   * Deal with drawing bar
   */
  const dealDrawingBar = useMemoizedFn(
    (tradingViewDocument: Document, onClick: () => void) => {
      const drawingBar = tradingViewDocument?.getElementById("drawing-toolbar");
      drawingBar?.childNodes?.forEach((childNode) => {
        if (
          (childNode as any)?.dataset?.name === "toolbar-drawing-toggle-button"
        ) {
          childNode.addEventListener("click", onClick);
        }
      });
    }
  );

  useUnmount(() => {
    tradingViewInstanceArray.current = [];
  });

  return { dealDrawingBar, initTradingView };
}

function useSmallTradingView({
  dealDrawingBar,
  initTradingView,
  chartType,
  draw,
}: ReturnType<typeof useTradingViewBase> &
  Pick<TradingViewGraphProps, "chartType"> & {
    draw?: TokenPriceChartDraw;
  }) {
  const tradingViewRef = useRef<HTMLDivElement>(null);
  const [isInitialize, setIsInitializing] = useState(true);
  const [showTradingViewExpandIcon, setShowTradingViewExpandIcon] =
    useState(false);
  const [drawingBarVisible, setDrawingBarVisible] = useBoolean(false);
  const [forceRender, setForceRender] = useState(0);
  const interval = useRef<ReturnType<typeof setInterval>>();
  const widgetRef = useRef<any>(null);
  const { socket } = useTokenPageSocketStore();

  /**
   * Subscribe to realtime data
   */
  useEffect(() => {
    if (socket) {
      socket.on("ohlcData", ({ ohlcData }) => {
        const data = ohlcData?.data;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        widgetRef.current &&
          data &&
          widgetRef.current._options.datafeed.onRealtimeCallback({
            time: data.unixTime * 1000,
            open: data.o,
            close: data.c,
            high: data.h,
            low: data.l,
            volume: data.v,
          });
      });
    }
  }, [socket, widgetRef]);

  const [showTrades, setShowTrades] = useState(true);
  const averagePriceLine = useRef<any>(null);

  const handleDrawMarkers = useMemoizedFn(() => {
    if (widgetRef?.current && showTrades) {
      // todo
      // widgetRef.current.activeChart().clearMarks()
      draw?.drawMarkers?.(widgetRef.current);
    } else {
      widgetRef.current.activeChart().clearMarks();
    }
  });
  /**
   * Draw average price line
   */
  useEffect(() => {
    if (!showTradingViewExpandIcon) return;
    if (widgetRef?.current && showTrades) {
      averagePriceLine.current?.remove();
      averagePriceLine.current = null;
      averagePriceLine.current = draw?.drawAveragePriceLine?.(
        widgetRef.current
      );
    } else {
      averagePriceLine.current?.remove();
      averagePriceLine.current = null;
    }
  }, [
    draw,
    widgetRef,
    showTradingViewExpandIcon,
    showTrades,
    handleDrawMarkers,
  ]);

  /**
   * Draw buy marker
   */
  useEffect(() => {
    if (!showTradingViewExpandIcon) return;
    handleDrawMarkers();
  }, [
    draw,
    widgetRef,
    showTradingViewExpandIcon,
    showTrades,
    handleDrawMarkers,
  ]);

  /**
   * Show trades
   */
  const onShowTrades = useMemoizedFn((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.innerHTML = !showTrades ? "Hide trades" : "Show trades";
    setShowTrades((prev) => !prev);
  });

  useEffect(() => {
    if (!(window as any).TradingView || !tradingViewRef.current) {
      if (!interval.current) {
        console.log("trading view script not loaded");
        interval.current = setInterval(() => {
          setForceRender((prev) => prev + 1);
        }, 1000);
      }
      return;
    }
    if (interval.current) {
      clearInterval(interval.current);
    }
    setIsInitializing(true);
    const widget = initTradingView("tv_chart_container");

    widgetRef.current = widget;
    const onReady = () => {
      setIsInitializing(false);
      setShowTradingViewExpandIcon(true);
      dealDrawingBar(
        (tradingViewRef?.current?.firstChild as HTMLIFrameElement)
          ?.contentDocument as Document,
        () => {
          setDrawingBarVisible.toggle();
        }
      );

      handleDrawMarkers();
    };

    widget?.onChartReady(function () {
      widget?.headerReady().then(function () {
        onReady();

        const button = widget.createButton();
        button.addEventListener("click", onShowTrades);
        button.style.cursor = "pointer";
        button.textContent = showTrades ? "Hide trades" : "Show trades";

        handleDrawMarkers();
      });
    });
  }, [forceRender, chartType]);

  return {
    isSmallTradingViewInitialize: isInitialize,
    showTradingViewExpandIcon,
    smallTradingViewDrawingBarVisible: drawingBarVisible,
    smallTradingViewRef: tradingViewRef,
  };
}

function useExpandTradingView({
  dealDrawingBar,
  initTradingView,
  chartType,
}: ReturnType<typeof useTradingViewBase> &
  Pick<TradingViewGraphProps, "chartType">) {
  const [expandIsInitialize, setExpandIsInitializing] = useState(false);
  const [tradingViewExpanded, setTradingViewExpanded] = useState(false);
  const [expandedDrawingBarVisible, setExpandedDrawingBarVisible] =
    useBoolean(true);

  const expandedTradingViewRef = useRef<HTMLDivElement>();
  const escKeyDown = useMemoizedFn((e) => {
    if (e.key === "Escape") {
      onClickTradingViewCollapse();
    }
  });
  const onClickTradingViewCollapse = useMemoizedFn(() => {
    if (expandedTradingViewRef.current) {
      expandedTradingViewRef.current.style.zIndex = "-1000";
      expandedTradingViewRef.current.style.opacity = "0";
      expandedTradingViewRef.current.style.pointerEvents = "none";

      setTradingViewExpanded(false);
    }
  });
  const dispose = useMemoizedFn(() => {
    if (expandedTradingViewRef.current) {
      document.body.removeChild(expandedTradingViewRef.current);
      expandedTradingViewRef.current = undefined;
      window.removeEventListener("keydown", escKeyDown);
    }
  });
  useUpdateEffect(() => {
    dispose();
  }, [chartType]);
  useUnmount(() => {
    dispose();
  });
  return {
    isExpandTradingViewInitialize: expandIsInitialize,
    tradingViewExpanded,
    expandTradingViewDrawingBarVisible: expandedDrawingBarVisible,
  };
}
