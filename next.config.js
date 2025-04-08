/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_SEVER_API_HOST: process.env.NEXT_SEVER_API_HOST,
    NEXT_CLIENT_API_HOST: process.env.NEXT_CLIENT_API_HOST,
    NEXT_AGENT_API_HOST: process.env.NEXT_AGENT_API_HOST,
    NEXT_AIRDROP_API_HOST: process.env.NEXT_AIRDROP_API_HOST,
    SOLANA_RPC: process.env.SOLANA_RPC,
    DEPLOY_ENV: process.env.DEPLOY_ENV,
    TWITTER_ENABLED: process.env.TWITTER_ENABLED,
    TOKEN_STORY_API_HOST: process.env.TOKEN_STORY_API_HOST,
    OKX_SECRET_KEY: process.env.OKX_SECRET_KEY,
    OKX_ACCESS_KEY: process.env.OKX_ACCESS_KEY,
    OKX_PROJECT_ID: process.env.OKX_PROJECT_ID,
    OKX_PASS_PHRASE: process.env.OKX_PASS_PHRASE,
    JUP_SWAP_FEE_ACCOUNT: process.env.JUP_SWAP_FEE_ACCOUNT,
    CHAT_STREAM_ENABLED: process.env.CHAT_STREAM_ENABLED,
    EVM_FEE_RECIPIENT: process.env.EVM_FEE_RECIPIENT,
    BSC_ENABLED: process.env.BSC_ENABLED,
  },
  compiler: {
    removeConsole: process.env.DEPLOY_ENV === "prod",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
};
