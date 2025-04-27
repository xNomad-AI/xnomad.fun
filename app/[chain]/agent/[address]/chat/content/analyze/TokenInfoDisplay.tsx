import { Card } from "@/primitive/components";
import { TokenInfo } from "./types";
import { TokenNumber } from "@/components/token-number";
import { toThousandNum } from "@/lib/utils/number";
import clsx from "clsx";
import { AgeCell } from "../../../content/agent-token/token-list/age-cell";

export function TokenInfoDisplay({
  tokenInfo,
  chain,
  ca,
}: {
  tokenInfo: TokenInfo | null;
  chain: string;
  ca: string;
}) {
  if (!tokenInfo) {
    return null;
  }

  return (
    <>
      <Card className="w-full p-0 bg-background text-size-14 overflow-hidden border-l-0 border-r-0 rounded-none">
        <div className="token-info-table">
          <div className="token-info-row">
            <div className="token-info-label">Token</div>
            <div className="token-info-value">${tokenInfo.symbol}</div>
          </div>
          
          <div className="token-info-row">
            <div className="token-info-label">CA</div>
            <div className="token-info-value overflow-hidden text-ellipsis">
              {tokenInfo.address}
            </div>
          </div>
          
          <div className="token-info-row">
            <div className="token-info-label">Chain</div>
            <div className="token-info-value">{tokenInfo.chain}</div>
          </div>
          
          <div className="token-info-row">
            <div className="token-info-label">Price</div>
            <div className="token-info-value">
              <TokenNumber 
                number={tokenInfo.price ?? ""} 
                prefix={"$"} 
              />
              {" "}
              <span className={clsx({
                "rate-positive": (tokenInfo.priceChange1h ?? 0) > 0,
                "rate-negative": (tokenInfo.priceChange1h ?? 0) < 0,
              })}>
                {(tokenInfo.priceChange1h ?? 0) > 0 ? "+" : ""}
                {(tokenInfo.priceChange1h ?? 0).toFixed(2)}%
              </span>
              (1H)
            </div>
          </div>
          
          {chain === "solana" && (
            <div className="token-info-row">
              <div className="token-info-label">Age</div>
              <div className="token-info-value">
                <AgeCell time={(tokenInfo.createTime ?? 0) * 1000} />
              </div>
            </div>
          )}
          
          <div className="token-info-row">
            <div className="token-info-label">Market Cap</div>
            <div className="token-info-value">
              <TokenNumber 
                number={tokenInfo.marketCap ?? ""} 
                prefix={"$"} 
              />
            </div>
          </div>
          
          <div className="token-info-row">
            <div className="token-info-label">Liq</div>
            <div className="token-info-value">
              <TokenNumber 
                number={tokenInfo.liquidity ?? ""} 
                prefix={"$"} 
              />
            </div>
          </div>
          
          <div className="token-info-row">
            <div className="token-info-label">24H Vol</div>
            <div className="token-info-value">
              <TokenNumber 
                number={tokenInfo.volume24h ?? ""} 
                prefix={"$"} 
              />
              {" "}
              <span className={clsx({
                "rate-positive": (tokenInfo.volume24hChange ?? 0) > 0,
                "rate-negative": (tokenInfo.volume24hChange ?? 0) < 0,
              })}>
                {(tokenInfo.volume24hChange ?? 0) > 0 ? "+" : ""}
                {(tokenInfo.volume24hChange ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="token-info-row">
            <div className="token-info-label">Holder</div>
            <div className="token-info-value">
              {toThousandNum(tokenInfo.holder ?? 0)}
            </div>
          </div>
          
          {chain === "solana" && (
            <div className="token-info-row">
              <div className="token-info-label">Top 10 Holders</div>
              <div className="token-info-value">
                {toThousandNum((tokenInfo.holdPercenttop100 ?? 0) * 100)}%
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <div className="w-full h-[338px] overflow-hidden mt-16">
        <iframe
          width="100%"
          id="gmgn-embed"
          title="gmgn Embed"
          src={
            chain === "solana"
              ? `https://www.gmgn.cc/kline/sol/${
                  ca || tokenInfo.address
                }?theme=dark&interval=15`
              : `https://dexscreener.com/bsc/${
                  ca || tokenInfo.address
                }?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`
          }
          frameBorder="0"
          allow="clipboard-write"
          allowFullScreen
          className={clsx("mobile:mt-[16px] h-[calc(100%+40px)]")}
        />
      </div>
    </>
  );
} 