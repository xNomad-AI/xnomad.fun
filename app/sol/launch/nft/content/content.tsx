"use client";
import Lottie from "lottie-react";
import Rocket from "./rocket.json";
import { useState } from "react";
import { Container } from "./container";
import { Base } from "./base";
import { Review, TOKEN_DEPLOY_TIME } from "./review";
export type Step = "base" | "review" | "creating" | "success";
export function Content() {
  const [step, setStep] = useState<Step>("base");

  return (
    <div className='w-full flex flex-col gap-16 items-center p-16'>
      <Base
        step={step}
        onNextStep={() => {
          setStep("review");
        }}
      />
      <Review step={step} setStep={setStep} />
      <Container
        className='h-[calc(100vh-64px)] justify-center items-center'
        value='creating'
        current={step}
      >
        <div className='w-[10rem] h-[10rem]'>
          <Lottie animationData={Rocket} loop />
        </div>
        <p className='text-size-16 font-bold text-center'>
          Estimated time is about {TOKEN_DEPLOY_TIME / 1000}s. Please do not
          close the page
          <br />
          until asset submission is completed.
        </p>
      </Container>
    </div>
  );
}
