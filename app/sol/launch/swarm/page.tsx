"use client";
import { use100vh } from "react-div-100vh";
import { SwarmForm } from "./form";
import { Steps } from "./steps";
import { SwarmProvider } from "./store";

export default function Page() {
  const vh = use100vh();
  return (
    <div
      style={{
        height: (vh ?? 1000) - 64,
      }}
      className='pt-64 min-h-0 mobile:pt-32 w-full max-w-[40rem] flex flex-col mx-auto mobile:mx-16 gap-48 overflow-scroll relative'
    >
      <SwarmProvider>
        <Steps />
        <SwarmForm />
      </SwarmProvider>
    </div>
  );
}
