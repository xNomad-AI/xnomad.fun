import { useSwarmStore } from "../store";
import { AgentForm } from "./agent";
import { AssetForm } from "./asset";
import { BasicForm } from "./basic";
import { MintForm } from "./mint";
import { Result } from "./result";

export function SwarmForm() {
  const { step } = useSwarmStore();
  return (
    <>
      {step === "basic" && <BasicForm />}
      {step === "assets" && <AssetForm />}
      {step === "agent" && <AgentForm />}
      {step === "mint" && <MintForm />}
      <Result />
    </>
  );
}
