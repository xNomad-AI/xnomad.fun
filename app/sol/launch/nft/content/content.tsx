"use client";
import { Spin } from "@/primitive/components";
import { useState } from "react";
import { Container } from "./container";
import { Base } from "./base";
import { Review } from "./review";
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
        <Spin className='!text-[64px]' />
        <p className='text-center text-size-16 font-bold'>
          Estimated time is about 3 minutes. Please do not close the page until
          asset submission is completed.
        </p>
      </Container>
    </div>
  );
}
