import { useEffect, useState } from "react";
import { PriorityFeeType, useTradeConfigStore } from "../store/trade-config";
import { isNumber } from "@/lib/utils/number/is-number";

const MIN_TIP = 0.001;
export function useSettingModalService() {
  const {
    tradeSettingModalController,
    tradeSettingModalVisible,
    slippage,
    setSlippage,
    estimatePriorityFee,
    priorityFeeType,
    setPriorityFeeType,
    customPriorityFee,
    setCustomPriorityFee,
    tradeMode,
    setTradeMode,
    tip,
    setTip,
  } = useTradeConfigStore();
  const [innerPriorityFee, setInnerPriorityFee] = useState(customPriorityFee);
  const [innerSlippage, setInnerSlippage] = useState(
    (slippage * 100).toString()
  );
  const [innerTradeMode, setInnerTradeMode] = useState(tradeMode);
  const [innerTip, setInnerTip] = useState(tip);
  const [innerPriorityFeeType, setInnerPriorityFeeType] =
    useState<PriorityFeeType>(priorityFeeType);

  const isFastMode = innerTradeMode === "FAST";
  const isCustomPriorityFee = innerPriorityFeeType === "custom";

  const showTipError = +innerTip < MIN_TIP;

  const disabled =
    (+innerPriorityFee === 0 && isCustomPriorityFee) ||
    +slippage === 0 ||
    showTipError;

  const showAntiMevLowPriorityFeeWarning =
    !isFastMode &&
    isCustomPriorityFee &&
    +innerPriorityFee < estimatePriorityFee.high;

  const handleConfirm = () => {
    if (isNumber(+innerSlippage)) {
      setSlippage(+innerSlippage / 100);
    }
    setPriorityFeeType(innerPriorityFeeType);
    setCustomPriorityFee(innerPriorityFee);
    setTip(innerTip);
    setTradeMode(innerTradeMode);
    tradeSettingModalController.setFalse();
  };

  useEffect(() => {
    if (!tradeSettingModalVisible) {
      setInnerPriorityFee(customPriorityFee);
      setInnerSlippage((slippage * 100).toString());
      setInnerPriorityFeeType(priorityFeeType);
      setInnerTip(tip);
      setInnerTradeMode(tradeMode);
    }
  }, [
    customPriorityFee,
    priorityFeeType,
    slippage,
    tip,
    tradeMode,
    tradeSettingModalVisible,
  ]);

  return {
    isFastMode,
    innerPriorityFee,
    innerPriorityFeeType,
    innerTradeMode,
    innerTip,
    innerSlippage,
    setInnerTradeMode,
    setInnerPriorityFee,
    setInnerPriorityFeeType,
    setInnerSlippage,
    setInnerTip,
    handleConfirm,
    disabled,
    showTipError,
    showAntiMevLowPriorityFeeWarning,
    tradeSettingModalController,
    tradeSettingModalVisible,
    estimatePriorityFee,
    isCustomPriorityFee,
    MIN_TIP,
  };
}
