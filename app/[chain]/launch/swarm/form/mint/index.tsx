import { Button, IconAdd, message } from "@/primitive/components";
import { useSwarmStore } from "../../store";
import { checkForm } from "@/app/[chain]/agent/[address]/chat/lib/form";
import { useMemo, useState } from "react";
import { emptyStage, emptyWhitelistStage } from "../../store/creator";
import { StageForm } from "./stage";
import { useMemoizedFn } from "ahooks";
import {
  getSwarmTransaction,
  uploadAssets,
  uploadLogo,
  uploadSwarm,
} from "./network";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { processCsvFile, useWeb3StorageClient } from "./utils";
import { VersionedTransaction } from "@solana/web3.js";
import { useSolana } from "@/lib/hooks/use-solana";
import { onError } from "@/lib/utils/error";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";

export function MintForm() {
  const { chain } = useChainStore();
  const { publicKey, signTransaction } = useWallet();
  const { setVisible } = useConnectModalStore();
  const { form, updateForm, setForm, setStep } = useSwarmStore();
  const whitelistStages = useMemo(
    () => form.mint.whitelistStages.value,
    [form.mint.whitelistStages]
  );
  const publicStages = useMemo(
    () => form.mint.publicStages.value,
    [form.mint.publicStages]
  );
  const [isSubmitting, setSubmitting] = useState(false);
  const { connection, inspectTransaction } = useSolana();
  const web3StorageClient = useWeb3StorageClient();
  const onSubmit = useMemoizedFn(async () => {
    if (!publicKey || !signTransaction) {
      setVisible(true);
      return;
    }
    setSubmitting(true);
    setStep("waiting");
    try {
      const logoCid = await web3StorageClient?.uploadFile(
        form.basic.image.value as File
      );
      const whitelistStages = [];
      for (let i = 0; i < form.mint.whitelistStages.value.length; i++) {
        const stage = form.mint.whitelistStages.value[i];
        const csvFile = await processCsvFile(
          stage.whitelistAddresses.value as File
        );
        whitelistStages.push({
          ...stage,
          whitelistAddresses: csvFile,
        });
      }
      const { swarmId } = await uploadSwarm({
        name: form.basic.name.value,
        description: form.basic.description.value,
        logo: `https://${logoCid}.ipfs.w3s.link/${form.basic.image.value?.name}`,
        socialMedia: {
          website: form.basic.website.value,
          twitter: form.basic.twitter.value,
          discord: form.basic.discord.value,
        },
        creatorInfo: {
          email: form.basic.email.value,
          address: publicKey.toBase58(),
          recipientAddress: form.basic.receiver.value,
          royaltyBps: parseFloat(form.basic.royalty.value),
        },
        aiAgentSettings: {
          background: form.agent.background.value,
          style: form.agent.style.value,
        },
        mintStages: form.mint.publicStages.value
          .map((stage) => ({
            name: stage.name.value,
            price: parseFloat(stage.price.value),
            maxMintsPerAddress: parseInt(stage.maxMintPerAddress.value),
            startTime: new Date(stage.startTime.value).getTime(),
            endTime: new Date(stage.endTime.value).getTime(),
          }))
          .concat(
            whitelistStages.map((stage) => ({
              name: stage.name.value,
              price: parseFloat(stage.price.value),
              maxMintsPerAddress: parseInt(stage.maxMintPerAddress.value),
              startTime: new Date(stage.startTime.value).getTime(),
              endTime: new Date(stage.endTime.value).getTime(),
              whitelistAddresses: stage.whitelistAddresses,
            }))
          ),
      });
      await uploadAssets(swarmId, form.assets.assets.value as File);
      const res = await getSwarmTransaction(swarmId);
      const versionTx = VersionedTransaction.deserialize(
        new Uint8Array(Buffer.from(res.tx, "hex"))
      );
      const signature = await signTransaction(versionTx);
      const tx = await connection.sendTransaction(signature, {
        preflightCommitment: "confirmed",
      });
      inspectTransaction(tx).then(() => {
        setStep("success");
      });
    } catch (error) {
      onError(error);
      setStep("mint");
    } finally {
      setSubmitting(false);
    }
  });
  return (
    <>
      <div className='w-full flex flex-col gap-32'>
        <div className='flex flex-col gap-24 w-full'>
          <div className='flex items-center justify-between w-full'>
            <h2 className='text-size-20 font-bold'>
              Whitelist Stage
              {whitelistStages.length > 1 ? `(${whitelistStages.length})` : ""}
            </h2>
            <IconAdd
              className='cursor-pointer text-size-24'
              onClick={() => {
                if (whitelistStages.length >= 5) {
                  message("Reached the maximum limit of 5.", {
                    type: "error",
                  });
                  return;
                }
                updateForm("mint", "whitelistStages", {
                  value: [emptyWhitelistStage].concat(whitelistStages),
                  isInValid: false,
                });
              }}
            />
          </div>
          {[...whitelistStages].map((stage, index) => (
            <StageForm stage={stage} index={index} key={index} isWhiteList />
          ))}
        </div>
        <div className='flex flex-col gap-24 w-full'>
          <div className='flex items-center justify-between w-full'>
            <h2 className='text-size-20 font-bold'>Public Stage</h2>
            {publicStages.length < 1 && (
              <IconAdd
                className='cursor-pointer text-size-24'
                onClick={() => {
                  updateForm("mint", "publicStages", {
                    value: [emptyStage].concat(publicStages),
                    isInValid: false,
                  });
                }}
              />
            )}
          </div>

          {[...publicStages].map((stage, index) => (
            <StageForm stage={stage} index={index} key={index} />
          ))}
        </div>
      </div>
      <div className='w-full flex items-center justify-between'>
        <div className='flex items-center gap-8'>Launch Fee</div>
        <div className='flex items-center font-bold'>
          1.5 {getCurrencySymbol(chain)}
        </div>
      </div>
      <div className='w-full pb-32 flex flex-col gap-16 items-center'>
        <Button
          variant='secondary'
          onClick={() => {
            setStep("agent");
          }}
          className='w-full max-w-[400px]'
        >
          Last Step
        </Button>
        <Button
          onClick={() => {
            for (let i = 0; i < form.mint.whitelistStages.value.length; i++) {
              const stage = form.mint.whitelistStages.value[i];
              const { allValid: stageValid, newForm: newStage } =
                checkForm(stage);
              if (!stageValid) {
                updateForm("mint", "whitelistStages", {
                  value: form.mint.whitelistStages.value.map((s, index) =>
                    index === i ? newStage : s
                  ),
                  isInValid: false,
                });
                return;
              }
            }
            for (let i = 0; i < form.mint.publicStages.value.length; i++) {
              const stage = form.mint.publicStages.value[i];
              const { allValid: stageValid, newForm: newStage } =
                checkForm(stage);
              if (!stageValid) {
                updateForm("mint", "publicStages", {
                  value: form.mint.publicStages.value.map((s, index) =>
                    index === i ? newStage : s
                  ),
                  isInValid: false,
                });
                return;
              }
            }
            onSubmit();
          }}
          className='w-full max-w-[400px]'
        >
          Next Step
        </Button>
      </div>
    </>
  );
}
