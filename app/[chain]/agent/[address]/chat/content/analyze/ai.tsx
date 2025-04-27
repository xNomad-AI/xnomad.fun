import { Card, RadioButton, RadioButtonGroup } from "@/primitive/components";
import { useEffect, useState } from "react";
import { TokenNumber } from "@/components/token-number";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import clsx from "clsx";
import { RateNum } from "@/components/rate-number";
import { toCardNum, toThousandNum } from "@/lib/utils/number";
import { TextAnchor } from "@/components/text-button";
import { format } from "date-fns";
import { Empty } from "@/components/empty";
import {
  IconHeart,
  IconMessage,
  IconRetweet,
  IconTwitterVerified,
  IconViewed,
} from "./icons";
import { AgeCell } from "../../../content/agent-token/token-list/age-cell";
import { useChainStore } from "@/app/layout/chain-provider";
import "./token-info.css";
import { TokenInfoDisplay } from "./TokenInfoDisplay";
import { News, TokenInfo, Twitter } from "./types";
import { XProfileDisplay } from "./XProfileDisplay";

export function AnalyzeResponse({
  message,
  nft,
}: {
  message: ContentWithUser & {
    data?: {
      info?: TokenInfo;
      news?: News[];
      twitter?: Twitter;
    };
  };
  nft: NFT;
}) {
  const { chain } = useChainStore();
  const ca =
    message.text
      .split("\n")
      .slice(-1)[0]
      .match(/\((.*?)\)/)?.[1] ??
    message.text.split("\n").slice(-1)[0].split(": ")[1];
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(
    message.data?.info ?? null
  );
  const [news, setNews] = useState<News[]>(message.data?.news ?? []);
  const [twitter, setTwitter] = useState<Twitter | undefined>(
    message.data?.twitter
  );
  const { updateMessage } = useChatContext();
  useEffect(() => {
    if (!message.data?.info?.address) {
      api.v1
        .get<TokenInfo>("/token/info", {
          tokenAddress: ca,
          chain,
        })
        .then((res) => {
          setTokenInfo(res);
          updateMessage({ ...message, user: nft.name, isLoading: false });
        });
    }
    if (!message.data?.news?.length) {
      api.v1
        .get<News[]>("/token/news", {
          tokenAddress: ca,
          chain,
        })
        .then((res) => {
          setNews(res);
        });
    }
    if (!message.data?.twitter?.id) {
      api.v1
        .get<Twitter>("/token/twitter-info", {
          tokenAddress: ca,
          chain,
        })
        .then((res) => {
          setTwitter(res);
        });
    }
  }, [ca, chain]);
  const [infoType, setInfoType] = useState<"basic" | "twitter" | "news">(
    "basic"
  );

  return (
    <ChatContentContainer message={message} showTimestamp showCopyButton>
      <div className='w-full justify-between flex items-center mb-16'>
        <span className='text-size-20 font-bold'>${tokenInfo?.symbol}</span>
        <RadioButtonGroup
          className='!h-32 !gap-16'
          value={infoType}
          onChange={setInfoType}
          disableAnimation
        >
          <RadioButton className='!px-16 !text-size-12' value='basic'>
            Basic
          </RadioButton>
          {chain === "solana" && (
            <RadioButton className='!px-16 !text-size-12' value='news'>
              X News
            </RadioButton>
          )}
          <RadioButton className='!px-16 !text-size-12' value='twitter'>
            X Profile
          </RadioButton>
        </RadioButtonGroup>
      </div>
      <div
        className={clsx("w-full", {
          hidden: infoType !== "basic",
        })}
      >
        {tokenInfo?.aiSummary ? (
          <>
            <p>{tokenInfo?.aiSummary}</p>
            <br />
          </>
        ) : null}
        
        <TokenInfoDisplay tokenInfo={tokenInfo} chain={chain} ca={ca} />
      </div>
      <div
        className={clsx("w-full", {
          hidden: infoType !== "news",
        })}
      >
        Recommend Tweets({news.length})
        <br />
        <br />
        <div className='w-full flex flex-col gap-16 max-h-[400px] overflow-auto flex-shrink-0'>
          {news.length > 0 ? (
            news.map((item) => (
              <Card
                key={item.id}
                className='w-full p-12 flex flex-col gap-8 flex-shrink-0'
              >
                <div className='w-full flex justify-between gap-12'>
                  <div className='flex items-center gap-8'>
                    <img
                      src={item.user.icon}
                      alt='icon'
                      className='w-40 h-40 rounded-full object-contain'
                    />
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-4'>
                        <span className='font-bold'>{item.user.name}</span>

                        {item.user.verified && (
                          <IconTwitterVerified className='text-size-16' />
                        )}
                      </div>
                      <span className='text-size-12 text-text2'>
                        @{item.user.screen_name}
                      </span>
                    </div>
                  </div>
                  <span className='text-text2'>
                    <AgeCell time={item.created_time * 1000} />
                  </span>
                </div>
                <p>{item.text}</p>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-24'>
                    <div className='min-w-[3.75rem] flex items-center text-size-12'>
                      <IconMessage className='text-size-16' />
                      {toCardNum(item.reply_count)}
                    </div>
                    <div className='min-w-[3.75rem] flex items-center text-size-12'>
                      <IconRetweet className='text-size-16' />
                      {toCardNum(item.retweet_count)}
                    </div>
                    <div className='min-w-[3.75rem] flex items-center text-size-12'>
                      <IconHeart className='text-size-16' />
                      {toCardNum(item.favorite_count)}
                    </div>
                    <div className='min-w-[3.75rem] flex items-center text-size-12'>
                      <IconViewed className='text-size-16' />
                      {toCardNum(item.views)}
                    </div>
                  </div>
                  <TextAnchor
                    href={
                      item.link ||
                      `https://x.com/${item.author}/status/${item.tweet_id}`
                    }
                    withDecoration
                    target='_blank'
                  >
                    View in X
                  </TextAnchor>
                </div>
              </Card>
            ))
          ) : (
            <Empty />
          )}
        </div>
      </div>
      <div
        className={clsx("w-full", {
          hidden: infoType !== "twitter",
        })}
      >
        <XProfileDisplay twitter={twitter} tokenInfo={tokenInfo} />
      </div>
    </ChatContentContainer>
  );
}
