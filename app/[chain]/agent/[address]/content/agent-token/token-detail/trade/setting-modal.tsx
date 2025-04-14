import { PriorityFeeItem } from "./priority-fee-item";
import { useSettingModalService } from "./setting-modal-service";
import {
  Button,
  IconInfo,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { toDecimal } from "@/lib/utils/number/to-decimal";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";

export function TradeSettingModal() {
  const { chain } = useChainStore();
  const {
    tradeSettingModalController,
    tradeSettingModalVisible,
    innerTip,
    setInnerTradeMode,
    setInnerSlippage,
    setInnerTip,
    showTipError,
    isFastMode,
    innerSlippage,
    disabled,
    handleConfirm,
    MIN_TIP,
  } = useSettingModalService();

  return (
    <Modal
      open={tradeSettingModalVisible}
      onMaskClick={tradeSettingModalController.setFalse}
      size='s'
    >
      <ModalTitleWithBorder
        closable
        onClose={tradeSettingModalController.setFalse}
      >
        Setting
      </ModalTitleWithBorder>
      <ModalContent className='!gap-16'>
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
                onChange={() => setInnerTradeMode("ANTI-MEV")}
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
        {chain === "solana" && (
          <div className='flex flex-col gap-8 w-full'>
            <span>Tip({getCurrencySymbol(chain)})</span>
            <TextField
              placeholder='Custom'
              value={innerTip}
              onChange={(e) => {
                const value = toDecimal(e.target.value);
                setInnerTip(value);
              }}
            />
            {showTipError ? (
              <span className='text-size-12 text-red'>{`Please increase to >=${MIN_TIP} for better performance.`}</span>
            ) : null}
          </div>
        )}
        <div className='flex items-center w-full gap-16'>
          <Button
            variant='secondary'
            stretch
            onClick={tradeSettingModalController.setFalse}
          >
            Cancel
          </Button>
          <Button stretch disabled={disabled} onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
