import { isNumber } from "@/lib/utils/number/is-number";
import { useBoolean, useMemoizedFn } from "ahooks";
import constate from "constate";
import { useMemo, useState } from "react";
export type EstimatePriorityFee = {
  min: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
  unsafeMax: number;
};

export type PriorityFeeType = keyof EstimatePriorityFee | "custom";

function initSlippage() {
  const value = localStorage.getItem("token-page-slippage");
  if (value && isNumber(+value)) {
    return +value;
  }
  return 0.25;
}

function initPriorityFeeType(): PriorityFeeType {
  const value = localStorage.getItem("token-page-priority-fee-type");
  if (
    value !== null &&
    [
      "min",
      "low",
      "medium",
      "high",
      "veryHigh",
      "unsafeMax",
      "custom",
    ].includes(value)
  ) {
    return value as PriorityFeeType;
  }
  return "medium";
}

function initPriorityFee() {
  const value = localStorage.getItem("token-page-priority-fee");
  if (value !== null && isNumber(+value) && +value !== 0) {
    return value;
  }
  return "";
}
export type SwapMode = "FAST" | "ANTI-MEV";
export type GasMode = "LOW" | "MEDIUM" | "HIGH";
function initTradeMode(): SwapMode {
  const value = localStorage.getItem("token-page-trade-mode");
  if (value !== null && ["FAST", "ANTI-MEV"].includes(value)) {
    return value as SwapMode;
  }
  return "FAST";
}

function useService() {
  const [tradeSettingModalVisible, tradeSettingModalController] =
    useBoolean(false);
  const [slippage, _setSlippage] = useState(initSlippage);
  const [priorityFeeType, _setPriorityFeeType] =
    useState<PriorityFeeType>(initPriorityFeeType);
  const [customPriorityFee, _setCustomPriorityFee] = useState(initPriorityFee);
  const [tradeMode, _setTradeMode] = useState(initTradeMode);
  const [tip, setTip] = useState("0.001");
  const [gasMode, _setGasMode] = useState<GasMode>("MEDIUM");
  const [gasFee, _setGasFee] = useState<string>("");
  const estimatePriorityFee = useMemo<EstimatePriorityFee>(() => {
    return {
      min: 0,
      low: 0.002,
      medium: 0.006,
      high: 0.012,
      veryHigh: 0.018,
      unsafeMax: 0,
    };
  }, []);

  const priorityFee = useMemo(() => {
    if (priorityFeeType !== "custom") {
      return estimatePriorityFee[priorityFeeType];
    }
    return +customPriorityFee;
  }, [customPriorityFee, estimatePriorityFee, priorityFeeType]);

  const setSlippage = useMemoizedFn((value: number) => {
    _setSlippage(value);
    localStorage.setItem("token-page-slippage", value.toString());
  });

  const setPriorityFeeType = useMemoizedFn((value: PriorityFeeType) => {
    _setPriorityFeeType(value);
    localStorage.setItem("token-page-priority-fee-type", value.toString());
  });

  const setCustomPriorityFee = useMemoizedFn((value: string) => {
    _setCustomPriorityFee(value);
    localStorage.setItem("token-page-priority-fee", value.toString());
  });

  const setTradeMode = useMemoizedFn((value: SwapMode) => {
    _setTradeMode(value);
    localStorage.setItem("token-page-trade-mode", value.toString());
  });

  const setGasMode = useMemoizedFn((value: GasMode) => {
    _setGasMode(value);
    localStorage.setItem("token-page-gas-mode", value.toString());
  });

  const setGasFee = useMemoizedFn((value: string) => {
    _setGasFee(value);
    localStorage.setItem("token-page-gas-fee", value.toString());
  });

  return {
    slippage,
    setSlippage,
    tradeSettingModalController,
    estimatePriorityFee,
    priorityFee,
    setPriorityFeeType,
    priorityFeeType,
    setCustomPriorityFee,
    customPriorityFee,
    tradeMode,
    setTradeMode,
    tip,
    setTip,
    gasMode,
    setGasMode,
    gasFee,
    setGasFee,
    tradeSettingModalVisible,
  };
}

export const [TradeConfigProvider, useTradeConfigStore] = constate(useService);
