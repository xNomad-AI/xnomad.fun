import { useSolana } from "@/lib/hooks/use-solana";
import {
  Button,
  FormItem,
  FormValue,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  TextField,
} from "@/primitive/components";
import { urlValidation } from "@/primitive/utils/url";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { TokenInfo } from "../../token-list/network";
import { useMemoizedFn } from "ahooks";
import { EditInfoConfig, editTokenInfo, getEditInfoConfig } from "./network";
import { NFT } from "@/types";
import { toCardNum } from "@/lib/utils/number";
import { onError } from "@/lib/utils/error";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { TokenNumber } from "@/components/token-number";
import { useAgentStore } from "../../../../store";
import { useAccount, useClient, useSendTransaction } from "wagmi";
import { useChainStore } from "@/app/layout/chain-provider";
import { parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
const emptyForm = {
  description: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  twitter: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  telegram: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  website: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  amount: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
};
export function EditInfoModal({
  onClose,
  open,
  tokenInfo,
  nft,
}: {
  onClose: () => void;
  open: boolean;
  tokenInfo: TokenInfo;
  nft: NFT;
}) {
  const { chain } = useChainStore();
  const { setPrimaryToken } = useAgentStore();
  const { publicKey, sendTransaction } = useWallet();
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { connection } = useSolana();
  const [form, setForm] = useState<{
    description: FormValue<string>;
    twitter: FormValue<string>;
    telegram: FormValue<string>;
    website: FormValue<string>;
  }>(emptyForm);
  useEffect(() => {
    setForm({
      description: {
        ...form.description,
        value: tokenInfo.description,
      },
      twitter: {
        ...form.twitter,
        value: tokenInfo.twitter ?? "",
      },
      telegram: {
        ...form.telegram,
        value: tokenInfo.telegram ?? "",
      },
      website: {
        ...form.website,
        value: tokenInfo.website ?? "",
      },
    });
  }, [tokenInfo]);
  const isEmpty = useMemo(
    () => Object.values(form).some((item) => item.value === ""),
    [form]
  );
  const nothingChange = useMemo(() => {
    if (form.description.value !== tokenInfo.description) {
      return false;
    }
    if (form.twitter.value !== tokenInfo.twitter) {
      return false;
    }
    if (form.telegram.value !== tokenInfo.telegram) {
      return false;
    }
    if (form.website.value !== tokenInfo.website) {
      return false;
    }
    return true;
  }, [form, tokenInfo]);
  const [editConfig, setEditConfig] = useState<EditInfoConfig>();
  useEffect(() => {
    getEditInfoConfig(nft.id, chain).then(setEditConfig);
  }, [nft.id, chain]);
  const [isEditing, setIsEditing] = useState(false);
  const senSol = useMemoizedFn(async () => {
    if (!editConfig || !publicKey) throw new Error("Invalid config");

    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: publicKey,
    }).add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(editConfig.recipient),
        lamports: new BigNumber(editConfig.solAmount ?? 1)
          .multipliedBy(10 ** 9)
          .toNumber(),
      })
    );

    const tx = await sendTransaction(transaction, connection);
    const res = await connection.confirmTransaction(tx, "confirmed");
    if (res.value.err) {
      throw res.value.err;
    }
    return tx;
  });
  const client = useClient();
  const submit = useMemoizedFn(async () => {
    if (!editConfig || !publicKey) return;
    setIsEditing(true);
    try {
      let tx;
      if (chain === "solana") {
        tx = await senSol();
      } else {
        if (!client) {
          throw new Error("Invalid client");
        }
        tx = await sendTransactionAsync({
          to: editConfig.recipient as `0x${string}`,
          value: parseEther("0.2"),
        });
        const res = await waitForTransactionReceipt(client, {
          hash: tx,
        });
        if (res.status !== "success") {
          throw new Error("Transaction failed");
        }
      }
      const newInfo = await editTokenInfo(
        nft.id,
        tx,
        {
          description: form.description.value,
          twitter: form.twitter.value,
          telegram: form.telegram.value,
          website: form.website.value,
        },
        chain
      );
      setPrimaryToken(newInfo);
      onClose();
    } catch (error) {
      onError(error);
    } finally {
      setIsEditing(false);
    }
  });
  return (
    <Modal onMaskClick={onClose} open={open} size='m'>
      <ModalTitleWithBorder closable onClose={onClose}>
        Edit Token Info
      </ModalTitleWithBorder>
      <ModalContent className='!gap-16'>
        <p className='text-size-12 text-text2'>
          An update of the on-chain information is required, please pay 1{" "}
          {getCurrencySymbol(chain)} to complete.
        </p>
        <FormItem label={"Description"} {...form.description}>
          <TextField
            className='!bg-background'
            value={form.description.value}
            placeholder='Less than 200 characters'
            onChange={(event) => {
              const value = event.target.value;
              if (value.length > 200) {
                setForm({
                  ...form,
                  description: {
                    ...form.description,
                    value,
                    isInValid: true,
                    errorMsg: "Less than 200 characters",
                  },
                });
                return;
              }
              setForm({
                ...form,
                description: {
                  ...form.description,
                  value: event.target.value,
                  isInValid: false,
                },
              });
            }}
          />
        </FormItem>

        <FormItem label={"X(Twitter)"} {...form.twitter}>
          <TextField
            className='!bg-background'
            value={form.twitter.value}
            placeholder='e.g. https://twitter.com/username'
            onChange={(event) => {
              const value = event.target.value;
              const isValid = urlValidation(value);
              setForm({
                ...form,
                twitter: {
                  ...form.twitter,
                  value,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Invalid URL",
                },
              });
            }}
          />
        </FormItem>
        <FormItem label={"Telegram"} {...form.telegram}>
          <TextField
            className='!bg-background'
            value={form.telegram.value}
            placeholder='e.g. https://t.me/username'
            onChange={(event) => {
              const value = event.target.value;
              const isValid = urlValidation(value);
              setForm({
                ...form,
                telegram: {
                  ...form.telegram,
                  value,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Invalid URL",
                },
              });
            }}
          />
        </FormItem>
        <FormItem label={"Website"} {...form.website}>
          <TextField
            className='!bg-background'
            value={form.website.value}
            placeholder='e.g. https://example.com'
            onChange={(event) => {
              const value = event.target.value;
              const isValid = urlValidation(value);
              setForm({
                ...form,
                website: {
                  ...form.website,
                  value,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Invalid URL",
                },
              });
            }}
          />
        </FormItem>
        <div className='w-full flex items-center gap-16'>
          <Button variant='secondary' stretch onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isEmpty || nothingChange}
            variant='secondary'
            stretch
            loading={isEditing}
            onClick={() => {
              if (Object.values(form).some((item) => item.isInValid)) {
                return;
              }
              let allValid = true;
              const newForm = { ...form };
              Object.keys(newForm).forEach((_key) => {
                const key = _key as keyof typeof newForm;
                if (newForm[key].required) {
                  if (
                    !newForm[key].value ||
                    (typeof newForm[key].value === "object" &&
                      Object.values(newForm[key].value).some((item) => !item))
                  ) {
                    allValid = false;
                    newForm[key].isInValid = true;
                    newForm[key].errorMsg = "Required";
                  }
                }
              });
              if (!allValid) {
                setForm(newForm);
                return;
              }
              submit();
            }}
          >
            Pay{" "}
            <TokenNumber
              className='inline-flex'
              number={editConfig?.solAmount ?? 1}
            />{" "}
            {getCurrencySymbol(chain)} to Submit
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
