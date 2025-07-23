import { Button, Card, FormItem, Toggle } from "@/primitive/components";
import clsx from "clsx";
import { useSwarmStore } from "../store";
import { checkForm } from "@/app/[chain]/agent/[address]/chat/lib/form";
import { TextAnchor } from "@/components/text-button";

export function AgentForm() {
  const { form, updateForm, setStep, setForm } = useSwarmStore();
  return (
    <>
      <div className='min-h-0 flex-1 h-full w-full flex flex-col gap-48 overflow-scroll'>
        <p className='text-size-12 text-text2'>
          Provide the following information to generate a unique personality for
          each NFT.
        </p>
        <FormItem label='Background Setting' {...form.agent.background}>
          <Card
            className={clsx("p-12 focus-within:border-white-40", {
              "border-red": form.agent.background.isInValid,
            })}
          >
            <textarea
              placeholder={`e.g. Walle is a small, diligent robot designed to clean Earth's waste. He has spent centuries compacting trash while developing a fascination for human artifacts. His most prized possession is a VHS tape of Hello, Dolly! He longs for companionship and dreams of love. When he meets EVE, he follows her across space on an adventure. Despite his mechanical nature, he displays deep emotions and loyalty.`}
              className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
              value={form.agent.background.value}
              onChange={(e) => {
                const value = e.target.value;

                updateForm("agent", "background", {
                  value: value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </Card>
        </FormItem>
        <FormItem label='Style' {...form.agent.style}>
          <Card
            className={clsx("p-12 focus-within:border-white-40", {
              "border-red": form.agent.style.isInValid,
            })}
          >
            <textarea
              placeholder={`e.g. Innocent, Hopeful, Expressive, Nonverbal, Gestural, Emotion-driven`}
              className='min-h-[76px] bg-transparent w-full focus-visible:outline-none placeholder:text-text2'
              value={form.agent.style.value}
              onChange={(e) => {
                const value = e.target.value;

                updateForm("agent", "style", {
                  value: value,
                  isInValid: false,
                  errorMsg: "",
                });
              }}
            />
          </Card>
        </FormItem>
        <div className='w-full flex flex-col gap-10'>
          <div className='w-full flex items-center justify-between'>
            <p>Allow Owner to Bind Agent Token</p>
            <Toggle disable />
          </div>
          <ul className='list-disc pl-16 text-text2 text-size-12'>
            <li>
              Agent token is the only one token bind with the ai agent, which
              will be recommended to the token marketplace and cannot be
              unbound.
            </li>
            <li>
              {" "}
              If you want to allow owners to bind agent tokens, please contact
              us.{" "}
              <TextAnchor
                href={""}
                className='inline-flex text-white'
                target='_blank'
              >
                contact us.
              </TextAnchor>
            </li>
          </ul>
        </div>
      </div>
      <div className='w-full pb-32 flex flex-col gap-16 items-center'>
        <Button
          variant='secondary'
          onClick={() => {
            setStep("assets");
          }}
          className='w-full max-w-[400px]'
        >
          Last Step
        </Button>
        <Button
          onClick={() => {
            const { allValid, newForm } = checkForm(form.agent);
            if (!allValid) {
              setForm({
                ...form,
                agent: newForm,
              });
              return;
            }
            setStep("mint");
          }}
          className='w-full max-w-[400px]'
        >
          Next Step
        </Button>
      </div>
    </>
  );
}
