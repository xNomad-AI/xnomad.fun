import { bungee } from "@/app/layout/font";
import { IssueTokenForm } from "@/app/sol/agent/[address]/chat/content/issue-token/form";
import { PoweredBy } from "@/app/sol/agent/[address]/chat/content/issue-token/powered-by";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import {
  Card,
  Toggle,
  Tooltip,
  IconInfo,
  Button,
} from "@/primitive/components";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import clsx from "clsx";
import { Step } from "./content";
import { Container } from "./container";
import { useLaunchStore } from "../store";
import { useEffect, useState } from "react";
import {
  initialIssueTokenForm,
  IssueTokenFormType,
} from "@/app/sol/agent/[address]/chat/content/issue-token/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreatePreCheck, uploadMetaData } from "../network";
import { useMemoizedFn } from "ahooks";
import { api } from "@/primitive/api";
import { useSolana } from "@/lib/hooks/use-solana";
import { onError } from "@/lib/utils/error";
import { useRouter } from "next/navigation";
import { TokenNumber } from "@/components/token-number";
export const TOKEN_DEPLOY_TIME = 10 * 1000;
export function Review({
  step,
  setStep,
}: {
  step: Step;
  setStep: (step: Step) => void;
}) {
  const router = useRouter();
  const { publicKey, signTransaction } = useWallet();
  const { form, resetAll } = useLaunchStore();
  const [issueToken, setIssueToken] = useState(false);
  const [issueTokenForm, setIssueTokenForm] = useState<IssueTokenFormType>(
    initialIssueTokenForm
  );
  const [mintFee, setMintFee] = useState<CreatePreCheck | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<string | null>(null);
  const [tokenImageMetadata, setTokenImageMetadata] = useState<string | null>(
    null
  );
  const getMintFee = useMemoizedFn(async () => {
    const res = await api.v1.get<CreatePreCheck>(
      "/launchpad/solana/common-collection-nft-fee",
      {
        userAddress: publicKey?.toBase58(),
      }
    );
    setMintFee(res);
  });
  useEffect(() => {
    if (publicKey) {
      getMintFee();
    }
  }, [publicKey]);
  const { connection, inspectTransaction } = useSolana();
  const create = useMemoizedFn(async () => {
    setSubmitting(true);
    try {
      const imageUrl =
        imageMetadata || (await uploadMetaData(form.image.value as File));
      setImageMetadata(imageUrl);
      let createToken;
      if (issueToken) {
        const tokenImage =
          tokenImageMetadata ||
          (await uploadMetaData(issueTokenForm.image.value as File));
        setTokenImageMetadata(tokenImage);
        createToken = {
          tokenInfo: {
            name: issueTokenForm.tokenName.value,
            symbol: issueTokenForm.symbol.value,
            image: tokenImage,
            description: issueTokenForm.description.value,
            twitter: issueTokenForm.twitter.value,
            telegram: issueTokenForm.telegram.value,
            website: issueTokenForm.website.value,
          },
          buyAmountSol: parseFloat(issueTokenForm.amount.value),
        };
      }
      const createInfo = await api.v1.post<{ tx: string }>(
        "/launchpad/solana/create-common-collection-nft",
        {
          nft: {
            adjectives: form.adjectives.value.split(","),
            description: form.description.value,
            greeting: form.greeting.value,
            image: imageUrl,
            knowledge: form.knowledge.value.split("."),
            lore: form.lore.value.split(","),
            name: form.name.value,
            personality: form.personality.value.split(","),
            style: form.style.value.split(","),
          },
          createToken,
          userAddress: publicKey?.toBase58(),
        }
      );
      setSubmitting(false);
      if (!createInfo.tx) {
        throw new Error("Transaction not found");
      }
      if (!signTransaction) {
        throw new Error("Wallet not connected");
      }
      const versionTx = VersionedTransaction.deserialize(
        new Uint8Array(Buffer.from(createInfo.tx, "hex"))
      );
      setStep("creating");
      const startTime = Date.now();
      const res = await signTransaction(versionTx);
      const tx = await connection.sendTransaction(res, {
        preflightCommitment: "confirmed",
      });
      inspectTransaction(tx).then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const onFinish = () => {
          setStep("success");
          resetAll();
          setIssueTokenForm(initialIssueTokenForm);
        };
        if (duration < TOKEN_DEPLOY_TIME) {
          setTimeout(() => {
            onFinish();
          }, TOKEN_DEPLOY_TIME - duration);
        } else {
          onFinish();
        }
      });
    } catch (error) {
      onError(error);
      setStep("review");
      setSubmitting(false);
    }
  });

  return (
    <>
      <Container
        className='w-full my-64 mx-32 mobile:m-16'
        value='review'
        current={step}
      >
        <h1 className='text-size-24 font-bold'>Confirm Creating</h1>
        <Card className='w-full p-16 flex items-center gap-24'>
          <img
            height={80}
            width={80}
            className='flex-shrink-0 rounded-12 object-contain w-[80px] aspect-square'
            src={form.image.value ? URL.createObjectURL(form.image.value) : ""}
          />
          <TextWithEllipsis
            className={clsx("flex-1 text-size-24", bungee.className)}
          >
            {form.name.value}
          </TextWithEllipsis>
        </Card>
        <Card className='w-full p-16 flex flex-col gap-16'>
          <div className='flex items-center justify-between gap-24'>
            <div className='flex items-center gap-8'>
              <span className='text-size-16 font-bold'>Issue Agent Token</span>
              <PoweredBy />
            </div>
            <Toggle value={issueToken} onChange={setIssueToken} />
          </div>

          {issueToken && (
            <>
              <p className='text-text2'>
                This token will be bound to the agent and{" "}
                <span className='text-red'>cannot be unbound once created</span>
                . You can also launch tokens after the AI NFT launched.
              </p>
              <IssueTokenForm
                account={publicKey as PublicKey}
                form={issueTokenForm}
                nftImage={form.image.value as File}
                setForm={setIssueTokenForm}
              />
            </>
          )}
        </Card>
        <div className='w-full flex flex-col gap-16'>
          <div className='flex items-center justify-between w-full'>
            <span>AI-NFT Creating Fee</span>
            <p className={"font-bold"}>
              <span
                className={clsx({
                  "line-through text-text2":
                    (mintFee?.discountPercentage ?? 0) > 0,
                })}
              >
                {mintFee?.fee} SOL
              </span>
              {(mintFee?.discountPercentage ?? 0) > 0 && (
                <span>&nbsp;{mintFee?.feeAfterDiscount} SOL</span>
              )}
            </p>
          </div>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center gap-4'>
              Discount{" "}
              <Tooltip
                content={"xNomad holders enjoy a 70% reduction in creating fee"}
                contentClassName='!w-fit'
              >
                <IconInfo />
              </Tooltip>
            </div>
            {(mintFee?.discountPercentage ?? 0) > 0 ? (
              <div className='flex items-center gap-8'>
                <div className='h-18 px-4 flex items-center text-black text-size-12 bg-[url(/tag-bg.webp)] bg-no-repeat bg-center bg-cover rounded-4'>
                  xNomad Holder
                </div>
                <span>{mintFee?.discountPercentage ?? 0}% off</span>
              </div>
            ) : (
              <span>0</span>
            )}
          </div>
          {issueToken && (
            <div className='flex items-center justify-between w-full'>
              <p>
                Buy $
                {issueTokenForm.symbol.value || (
                  <span className='text-text2'>Ticker</span>
                )}
              </p>

              <TokenNumber
                className='font-bold'
                number={issueTokenForm.amount.value ?? 0}
                suffix='SOL'
              />
            </div>
          )}
        </div>
        <div></div>
        <div className='w-full flex flex-col gap-16 items-center justify-center'>
          <Button
            className='!w-full max-w-[400px]'
            variant='secondary'
            onClick={() => {
              setStep("base");
            }}
          >
            Last Step
          </Button>
          <Button
            loading={submitting}
            onClick={() => {
              if (issueToken) {
                if (
                  Object.keys(issueTokenForm).some(
                    (key) =>
                      issueTokenForm[key as keyof typeof issueTokenForm]
                        .isInValid
                  )
                ) {
                  return;
                }
                let allValid = true;
                const newForm = { ...issueTokenForm };
                Object.keys(newForm).forEach((_key) => {
                  const key = _key as keyof typeof newForm;
                  if (typeof newForm[key].value === "boolean") {
                    return;
                  }
                  if (newForm[key].required && !newForm[key].value) {
                    newForm[key].isInValid = true;
                    newForm[key].errorMsg = "Required";
                    allValid = false;
                  }
                });
                if (!allValid) {
                  setIssueTokenForm(newForm);
                  return;
                }
              }
              create();
            }}
            className='!w-full max-w-[400px]'
          >
            Create
          </Button>
        </div>
      </Container>
      <Container
        className='h-[calc(100vh-64px)] justify-center items-center'
        value='success'
        current={step}
      >
        <img
          height={320}
          width={320}
          className='flex-shrink-0 rounded-12 border object-contain border-white-20 w-[20rem] aspect-square'
          src={imageMetadata ?? ""}
        />
        <p className='text-center text-size-20 font-bold'>
          Congratulations! Your AI-NFT was launched successfully!
        </p>
        <div className='w-full flex items-center justify-center'>
          <Button
            className='!w-full max-w-[400px]'
            onClick={() => {
              resetAll();
              router.push(`/sol/profile/${publicKey?.toBase58()}`);
            }}
          >
            View My AI-NFT
          </Button>
        </div>
      </Container>
    </>
  );
}
