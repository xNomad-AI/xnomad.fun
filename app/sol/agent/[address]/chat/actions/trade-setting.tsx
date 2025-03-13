import {
  Button,
  IconInfo,
  message,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { useEffect, useMemo, useState } from "react";
import { toDecimal } from "@/lib/utils/number/to-decimal";
import { useAgentStore } from "../../store";
import { Config } from "../../content/features/types";
import { useMemoizedFn } from "ahooks";
import { api } from "@/primitive/api";
import { getAgentConfig } from "../../content/features/network";
import { onError } from "@/lib/utils/error";

export function TradeSetting() {
  const { agentConfig, setAgentConfig, nft } = useAgentStore();
  const [isSetting, setIsSetting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [innerPriorityFee, setInnerPriorityFee] = useState(
    agentConfig?.trade?.priorityFee ?? ""
  );
  const [innerSlippage, setInnerSlippage] = useState(
    ((agentConfig?.trade?.slippage ?? 0) * 100).toString()
  );
  const [innerTradeMode, setInnerTradeMode] = useState<Config["trade"]["mode"]>(
    agentConfig?.trade?.mode ?? "FAST"
  );
  const [innerTip, setInnerTip] = useState(agentConfig?.trade.tip ?? "0.001");

  useEffect(() => {
    setInnerPriorityFee(agentConfig?.trade?.priorityFee ?? "");
    setInnerSlippage(((agentConfig?.trade?.slippage ?? 0) * 100).toString());
    setInnerTradeMode(agentConfig?.trade?.mode ?? "FAST");
  }, [agentConfig?.trade]);
  const isFastMode = useMemo(() => innerTradeMode === "FAST", [innerTradeMode]);
  const onClose = useMemoizedFn(() => {
    setIsModalOpen(false);
  });
  return (
    <>
      <Button
        size='s'
        onClick={() => {
          setIsModalOpen(true);
        }}
        className='!font-normal whitespace-pre'
        variant='secondary'
      >
        Setting
      </Button>
      <Modal size='m' open={isModalOpen} onMaskClick={onClose}>
        <ModalTitleWithBorder closable onClose={onClose}>
          Edit Setting
        </ModalTitleWithBorder>
        <ModalContent>
          <div className='flex flex-col gap-8 w-full'>
            <span>Trading Mode</span>
            <div className='flex items-center gap-16'>
              <RadioGroup
                value={isFastMode ? "FAST" : "ANTI-MEV"}
                className='gap-16'
              >
                <Radio
                  value='FAST'
                  checked={isFastMode}
                  onChange={() => setInnerTradeMode("FAST")}
                >
                  <div className='flex items-center gap-8'>
                    Fast{" "}
                    <Tooltip content='Send to the next available validator for the highest chance of success'>
                      <IconInfo className='text-size-16' />
                    </Tooltip>
                  </div>
                </Radio>
                <Radio
                  value='ANTI-MEV'
                  checked={!isFastMode}
                  onChange={() => setInnerTradeMode("ANTI_MEV")}
                >
                  <div className='flex items-center gap-8'>
                    Anti-MEV{" "}
                    <Tooltip content='Send with MEV protection, which effectively prevents transactions from sandwich attacks'>
                      <IconInfo className='text-size-16' />
                    </Tooltip>
                  </div>
                </Radio>
              </RadioGroup>
            </div>
          </div>
          <div className='flex flex-col gap-8 w-full'>
            <span>Slippage(0%-100%)</span>
            <TextField
              value={innerSlippage}
              placeholder='Custom'
              onChange={(e) => {
                const value = toDecimal(e.target.value);
                const num = +value;
                if (num < 0.01 && num !== 0) {
                  setInnerSlippage("0.01");
                } else if (num > 30) {
                  setInnerSlippage("30");
                } else {
                  setInnerSlippage(value);
                }
              }}
              suffixNode={"%"}
            />
          </div>
          <div className='flex flex-col gap-8 w-full'>
            <span>Priority Fee(SOL)</span>
            <TextField
              placeholder={isFastMode ? "Custom" : ">0.018"}
              value={innerPriorityFee}
              onChange={(e) => {
                const value = toDecimal(e.target.value);
                setInnerPriorityFee(value);
              }}
            />
          </div>
          <div className='flex flex-col gap-8 w-full'>
            <div className='flex items-center gap-8'>
              <span>Tip(SOL)</span>
              <Tooltip content={"Tip to get the optimal performance."}>
                <IconInfo className='text-size-16' />
              </Tooltip>
            </div>
            <TextField
              placeholder={"> 0.001"}
              value={innerTip}
              onChange={(e) => {
                const value = toDecimal(e.target.value);
                setInnerTip(value);
              }}
            />
          </div>
          <div className='flex w-full items-center justify-end gap-8'>
            <Button variant='secondary' onClick={onClose}>
              Cancel
            </Button>
            <Button
              loading={isSetting}
              onClick={() => {
                setIsSetting(true);
                api.v1
                  .post(`/agent/trade/settings?agentId=${nft.agentId}`, {
                    slippage: +innerSlippage / 100,
                    priorityFee: +innerPriorityFee,
                    mode: innerTradeMode,
                    tip: innerTip,
                  })
                  .then(() => {
                    message("Trade setting updated", { type: "success" });
                    getAgentConfig(nft.id).then((config) => {
                      setAgentConfig(config);
                    });
                    onClose();
                  })
                  .catch(onError)
                  .finally(() => {
                    setIsSetting(false);
                  });
              }}
            >
              Confirm
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
