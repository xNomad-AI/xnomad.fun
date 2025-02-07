/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_SEVER_API_HOST: process.env.NEXT_SEVER_API_HOST,
    NEXT_CLIENT_API_HOST: process.env.NEXT_CLIENT_API_HOST,
    NEXT_AGENT_API_HOST: process.env.NEXT_AGENT_API_HOST,
    NEXT_AIRDROP_API_HOST: process.env.NEXT_AIRDROP_API_HOST,
    DEPLOY_ENV: process.env.DEPLOY_ENV,
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
  swcMinify: true,
};

module.exports = nextConfig;
