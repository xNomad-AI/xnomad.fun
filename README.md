# xNomad.fun :robot:
![NPM Version](https://img.shields.io/badge/npm->20.0.0-blue) ![Typescript Version](https://img.shields.io/badge/Typescript-5-blue) ![React Version](https://img.shields.io/badge/React-18-blue) [![License](https://img.shields.io/npm/l/reactstrap.svg)](./LICENSE)

The repository is the open-source codebase for the website[<ins>xNomad.fun</ins>](https://xnomad.fun).
Project goals:
- To provide a reference for those who wish to develop AI-NFT applications based on our[<ins>MCV</ins>](https://github.com/xNomad-AI/mcv)项project.
- To leverage the power of the community to make the xNomad.fun project a groundbreaking initiative that will transform both the AI and blockchain industries.

If you're interested in us, feel free to learn more about us through the[<ins>xNomad Documentation</ins>](https://docs.xnomad.ai/).

## :rocket: Quick Start

1. First, you need to get the [core](https://github.com/xNomad-AI/core)service running, which will provide you with two endpoints. If you run the core service locally with the default configuration, you should get the following two endpoints:
  - localhost:8080
  - localhost:8080/agent  
> Of course, you can also deploy the core service on any server as needed.
2. Next, fill in the endpoints you got in the previous step into the `.env` file:
```
NEXT_AGENT_API_HOST="http://localhost:8080/agent"
NEXT_CLIENT_API_HOST="http://localhost:8080"
```
3. Finally, run the project.
```bash
pnpm install & pnpm run dev
```

## :memo: .env
| Variable              | Requirement | Description                                                                                                                                                                                                                                                                                     | Type       | Example                     |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------- |
| DEPLOY_ENV            | required    | Used to identify the current runtime environment                                                                                                                                                                                                                                                | dev/prod   | dev                         |
| NEXT_AGENT_API_HOST   | Required    | The interfaces related to "agent"                                                                                                                                                                                                                                                               | string     | http://localhost:8080/agent |
| NEXT_CLIENT_API_HOST  | Required    | The interfaces related to data                                                                                                                                                                                                                                                                  | string     | http://localhost:8080       |
| NEXT_AIRDROP_API_HOST | optional    | We have extended the agent with the ability to claim airdrops. If your project also wants to support this feature, please refer to our [this](https://github.com/xNomad-AI/airdrop-proxy) repository. After following the instructions and deploying it, fill in the endpoint of the interface. | string     | http://localhost:3000       |
| SOLANA_RPC            | optional    | Replace with your own Solana RPC endpoint as needed. If not filled in, the default RPC node will be used.                                                                                                                                                                                       | string     | https:xxxxxx.xxx            |
| TWITTER_ENABLED       | optional    | Whether to disable the agent's Twitter integration feature. Due to current restrictions from Twitter, this feature is not very stable. If your project requires this feature, please consider lifting the restriction accordingly.                                                              | true/false | false                       |

## :telephone_receiver: Contact

Website: [xnomad.ai](https://xnomad.ai)
Twitter: [@xNomadAI](https://x.com/xNomadAI)
Discord: [xnomad](https://discord.gg/xnomad)

## :scroll: License

This project is licensed under the MIT License. See the [<ins>LICENSE</ins>](./LICENSE) file for details.

## :heart:END

For questions and support, please open an issue in the GitHub repository.

Developed with :heart: by the xNomad Team.