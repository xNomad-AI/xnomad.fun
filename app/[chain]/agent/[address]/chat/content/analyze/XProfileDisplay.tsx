import { Card } from "@/primitive/components";
import { Twitter } from "./types";
import { toThousandNum } from "@/lib/utils/number";
import clsx from "clsx";
import { TextAnchor } from "@/components/text-button";
import { format } from "date-fns";

export function XProfileDisplay({
  twitter,
  tokenInfo,
}: {
  twitter?: Twitter;
  tokenInfo: {
    symbol?: string;
    address?: string;
    holder?: number;
  } | null;
}) {
  if (!twitter && !tokenInfo) {
    return null;
  }

  return (
    <Card className="w-full p-0 bg-background text-size-14 overflow-hidden border-l-0 border-r-0 rounded-none">
      <div className="token-info-table">    
        <div className="token-info-row">
          <div className="token-info-label">X Profile</div>
          <div className="token-info-value">
            {twitter?.screen_name ? (
              <a 
                href={`https://x.com/${twitter?.screen_name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                https://x.com/{twitter?.screen_name}
              </a>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        
        <div className="token-info-row">
          <div className="token-info-label">Name</div>
          <div className="token-info-value">
            {twitter?.screen_name ? `@${twitter?.screen_name}` : "N/A"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Registered in</div>
          <div className="token-info-value">
            {twitter?.register_date
              ? format(new Date(twitter?.register_date), "MMM dd, yyyy")
              : "N/A"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Followers</div>
          <div className="token-info-value">
            {twitter?.followers_count 
              ? toThousandNum(twitter?.followers_count) 
              : "0"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Influencers</div>
          <div className="token-info-value">
            {twitter?.influencers_count 
              ? toThousandNum(twitter?.influencers_count) 
              : "0"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Projects</div>
          <div className="token-info-value">
            {twitter?.projects_count 
              ? `${toThousandNum(twitter?.projects_count)}(includes project founders, employees, etc.)`
              : "N/A (includes project founders, employees, etc.)"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">VC</div>
          <div className="token-info-value">
            {twitter?.venture_capitals_count 
              ? `${toThousandNum(twitter?.venture_capitals_count)} (includes VC founders, employees, etc.)`
              : "N/A (includes VC founders, employees, etc.)"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Tweets</div>
          <div className="token-info-value">
            {twitter?.tweets_count 
              ? toThousandNum(twitter?.tweets_count) 
              : "N/A"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Holder</div>
          <div className="token-info-value">
            {tokenInfo?.holder 
              ? toThousandNum(tokenInfo.holder) 
              : "N/A"}
          </div>
        </div>

        <div className="token-info-row">
          <div className="token-info-label">Search on X</div>
          <div className="token-info-value">
            {tokenInfo?.symbol && (
              <a 
                href={`https://x.com/search?q=${tokenInfo?.symbol}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-10"
              >
                Search Name
              </a>
            )}
            {tokenInfo?.address && (
              <a 
                href={`https://x.com/search?q=${tokenInfo?.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Search CA
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}