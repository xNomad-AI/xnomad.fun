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
