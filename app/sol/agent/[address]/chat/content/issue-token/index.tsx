import { validNumberInput } from "@/lib/utils/input-helper";
import {
  ActionButton,
  Button,
  Checkbox,
  FormItem,
  FormValue,
  IconClose,
  TextField,
  message as toast,
} from "@/primitive/components";
import { useEffect, useState } from "react";
import { TokenNumber } from "@/components/token-number";
import BigNumber from "bignumber.js";
import { ChatContentContainer } from "../container";
import { ContentWithUser, IAttachment } from "../../types";
import { useSolana } from "@/lib/hooks/use-solana";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { FILE_SIZE_IN_BYTE, FILE_SIZE_IN_MB, IMAGE_ID } from "./constants";
import { useMemoizedFn } from "ahooks";
import { useChatContext } from "../../store";
import { PublicKey } from "@solana/web3.js";
import { NFT } from "@/types";
import { CancelButton } from "../cancel-button";
import { PoweredBy } from "./powered-by";
import { initialIssueTokenForm, IssueTokenFormType } from "./types";
import { IssueTokenForm } from "./form";

export function IssueToken({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  const { deleteMessageById, addAndSendMessage } = useChatContext();

  const [form, setForm] = useState<IssueTokenFormType>(initialIssueTokenForm);

  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <div className='flex items-center gap-8'>
          <span className='font-bold text-size-16'>Issue Token</span>
          <PoweredBy />
        </div>
        <IssueTokenForm form={form} setForm={setForm} nft={nft} />
        <div className='w-full flex justify-end items-center gap-16'>
          <CancelButton
            onClick={() => {
              deleteMessageById(message.id);
            }}
          />
          <Button
            size='s'
            onClick={() => {
              if (Object.values(form).some((item) => item.isInValid)) {
                return;
              }
              let allValid = true;
              const newForm = { ...form };
              Object.keys(newForm).forEach((_key) => {
                const key = _key as keyof typeof newForm;
                if (newForm[key].required && !newForm[key].value) {
                  allValid = false;
                  newForm[key].isInValid = true;
                  newForm[key].errorMsg = "Required";
                }
              });
              if (!allValid) {
                setForm(newForm);
                return;
              }
              addAndSendMessage(
                `Create a new token called ${
                  form.tokenName.value
                } with symbol $${form.symbol.value}${
                  form.twitter.value
                    ? `, with twitter ${form.twitter.value}`
                    : ""
                } with description "${form.description.value}"${
                  form.twitter.value
                    ? `, with twitter ${form.twitter.value}`
                    : ""
                }${
                  form.twitter.value
                    ? `, with website ${form.website.value}`
                    : ""
                }${
                  form.telegram.value
                    ? `, with telegram ${form.telegram.value}`
                    : ""
                }${
                  form.amount.value
                    ? `, buy ${form.amount.value} SOL worth`
                    : ""
                }.`,
                form.image.value
              );
              deleteMessageById(message.id);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </ChatContentContainer>
  );
}
