"use client";
import { Container } from "@/app/layout/contianer";
import { Content } from "./content";
import { Suspense } from "react";

export default function Page() {
  return (
    <Container className='flex flex-col gap-16'>
      <div className='flex flex-col gap-8'>
        <h1 className='text-size-20 font-bold'>Agent Token</h1>
        <p className='text-text2'>
          The following shows the agent tokens of the AI agents.
        </p>
      </div>
      <Suspense>
        <Content />
      </Suspense>
    </Container>
  );
}
