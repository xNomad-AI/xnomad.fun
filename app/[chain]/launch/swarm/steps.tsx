import { Fragment } from "react";
import { steps, stepTitles } from "./store/creator";
import clsx from "clsx";
import { useSwarmStore } from "./store";

export function Steps() {
  const { step: currentStep } = useSwarmStore();
  if (currentStep === "success" || currentStep === "waiting") {
    return null;
  }
  return (
    <>
      <h1 className='text-size-24 font-bold'>Create a Swarm</h1>
      <div className='w-full flex items-center gap-16'>
        {steps.map((step, index) => {
          if (step === "success" || step === "waiting") {
            return null;
          }
          return (
            <Fragment key={step}>
              {index > 0 && <div className='flex-1 h-1 bg-text2'></div>}
              <span
                className={clsx("font-bold text-text2", {
                  "!text-text1": currentStep === step,
                })}
              >
                {index + 1}. {stepTitles[step]}
              </span>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
