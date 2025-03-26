import { Button } from "@/primitive/components";
import { useMemo, useState } from "react";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { useChatContext } from "../../store";
import { PublicKey } from "@solana/web3.js";
import { NFT } from "@/types";
import { CancelButton } from "../cancel-button";
import { PoweredBy } from "./powered-by";
import { initialIssueTokenForm, IssueTokenFormType } from "./types";
import { IssueTokenForm } from "./form";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";
import { useUserStore } from "@/app/layout/chain-provider/hook";

export function IssueToken({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  const { chain } = useChainStore();
  const { deleteMessageById, addAndSendMessage } = useChatContext();

  const [form, setForm] = useState<IssueTokenFormType>(initialIssueTokenForm);
  const account = useMemo(
    () =>
      chain === "solana"
        ? new PublicKey(nft.agentAccount.solana)
        : nft.agentAccount.evm,
    [nft.agentAccount.solana, chain]
  );
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <div className='flex items-center gap-8'>
          <span className='font-bold text-size-16'>Issue Token</span>
          <PoweredBy />
        </div>
        <IssueTokenForm
          form={form}
          setForm={setForm}
          account={account}
          nftImage={nft.image}
        />
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
                } with symbol $${form.symbol.value}, with description "${
                  form.description.value
                }"${
                  form.twitter.value
                    ? `, with twitter ${form.twitter.value}`
                    : ""
                }${
                  form.website.value
                    ? `, with website ${form.website.value}`
                    : ""
                }${
                  form.telegram.value
                    ? `, with telegram ${form.telegram.value}`
                    : ""
                }${
                  form.amount.value
                    ? `, buy ${form.amount.value} ${getCurrencySymbol(
                        chain
                      )} worth`
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
