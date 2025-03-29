import { SupportedChain } from "@/types/preference";

export const NOMADS_SOCIETY_ID = {
  solana:
    process.env.DEPLOY_ENV === "prod"
      ? "fd6f475863723a0a27cae7ec4e2c3468"
      : "a98bb836fd790c86e85cf6d158c3d6fd",
  bsc:
    process.env.DEPLOY_ENV === "prod"
      ? "dc6c78596874d160275de78a4df42209"
      : "dc6c78596874d160275de78a4df42209",
} satisfies Record<SupportedChain, string>;
