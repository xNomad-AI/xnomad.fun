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
interface TokenInfo {
  address: string;
  aiSummary?: string;
  chain: string;
  symbol: string;
  marketCap: number;
  volume24h: number;
  volume24hChange: number;
  price: number;
  liquidity: number;
  holder: number;
  priceChange1h: number;
  logo: string;
  priceChange24h: number;
  holdPercenttop100: number;
  createTime: number; // in seconds
}
interface News {
  id: number;
  token_address: string;
  symbol: string;
  network: string;
  tweet_id: string;
  user_id: string;
  text: string;
  medias: [];
  is_self_send: boolean;
  is_retweet: boolean;
  is_quote: boolean;
  is_reply: boolean;
  is_like: boolean;
  related_tweet_id: string;
  related_user_id: string;
  favorite_count: number;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  author: string;
  user: {
    icon: string;
    name: string;
    id_str: string;
    location: string;
    verified: boolean;
    following: boolean;
    created_at: string;
    description: string;
    media_count: number;
    screen_name: string;
    friends_count: number;
    statuses_count: number;
    followers_count: number;
    favourites_count: number;
    is_blue_verified: boolean;
    profile_image_url_https: string;
  };
  created_at: string;
  updated_at: string;
  created_time: number;
  link: string;
  media_type: string;
  token_image: string;
  related_tweets: string[];
  views: number;
  is_official: false;
  text_zh: string;
  sentiment: string;
  validity: number;
  validity_reason: null | string;
}
interface Twitter {
  followers_count: number;
  influencers_count: number;
  projects_count: number;
  venture_capitals_count: number;
  user_protected: boolean;
  lastUpdatedAt: number;
  id: string;
  name: string;
  screen_name: string;
  description: string;
  friends_count: number;
  register_date: string;
  tweets_count: number;
  banner: string;
  verified: boolean;
  avatar: string;
  can_dm: boolean;
  tokenInfo: {
    logoUrl: string;
    officialWebsite: string;
    socialUrls: {
      twitter: string[];
      chat: string[];
    };
    decimals: string;
    tokenAddress: string;
    chainIndex: string;
    chainName: string;
    symbol: string;
    name: string;
    maxSupply: string;
    totalSupply: string;
    volume24h: string;
    marketCap: string;
  };
}
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
        <p>
          🪙Token: ${tokenInfo?.symbol}
          <br />
          🗺️CA: {tokenInfo?.address}
          <br />
          Chain: {tokenInfo?.chain}
          <br />
          Price: <TokenNumber
            number={tokenInfo?.price ?? ""}
            prefix={"$"}
          />{" "}
          <RateNum
            className='inline-block'
            num={(tokenInfo?.priceChange1h ?? 0) / 100}
          />
          (1H)
          <br />
          {chain === "solana" && (
            <>
              Age: <AgeCell time={(tokenInfo?.createTime ?? 0) * 1000} />
              <br />
            </>
          )}
          Market Cap:{" "}
          <TokenNumber number={tokenInfo?.marketCap ?? ""} prefix={"$"} />
          <br />
          Liq: <TokenNumber
            number={tokenInfo?.liquidity ?? ""}
            prefix={"$"}
          />{" "}
          <br />
          24H Vol:{" "}
          <TokenNumber number={tokenInfo?.volume24h ?? ""} prefix={"$"} />{" "}
          <RateNum
            num={(tokenInfo?.volume24hChange ?? 0) / 100}
            className='inline-block'
          />
          <br />
          Holder: {toThousandNum(tokenInfo?.holder ?? 0)}
          <br />
          {chain === "solana" && (
            <>
              Top 10 holders:{" "}
              {toThousandNum((tokenInfo?.holdPercenttop100 ?? 0) * 100)}%(total
              position of Top 10 holders)
              <br />
            </>
          )}
          <br />
          <div className='w-full h-[338px] overflow-hidden'>
            <iframe
              width='100%'
              id='gmgn-embed'
              title='gmgn Embed'
              src={
                chain === "solana"
                  ? `https://www.gmgn.cc/kline/sol/${
                      ca || tokenInfo?.address
                    }?theme=dark&interval=15`
                  : `https://dexscreener.com/embed/bnb/${
                      ca || tokenInfo?.address
                    }?theme=dark&interval=15`
              }
              frameBorder='0'
              allow='clipboard-write'
              allowFullScreen
              className='mobile:mt-[16px] h-[calc(100%+40px)]'
            ></iframe>
          </div>
        </p>
      </div>
      <div
        className={clsx("w-full", {
          hidden: infoType !== "news",
        })}
      >
        🪙Token: ${tokenInfo?.symbol}
        <br />
        🗺️CA: {tokenInfo?.address}
        <br />
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
        🪙Token: ${tokenInfo?.symbol}
        <br />
        🗺️CA: {tokenInfo?.address}
        <br />
        🔗X Profile:{" "}
        <TextAnchor
          className='inline-flex'
          href={`https://x.com/${twitter?.screen_name}`}
        >
          https://x.com/{twitter?.screen_name}
        </TextAnchor>
        <br />
        Name: @{twitter?.screen_name}
        <br />
        Registered in:{" "}
        {twitter?.register_date
          ? format(twitter?.register_date ?? "", "MMM dd , yyyy")
          : "N/A"}
        <br />
        Followers: {toThousandNum(twitter?.followers_count ?? 0)}
        <br />
        Influencers: {toThousandNum(twitter?.influencers_count ?? 0)}
        <br />
        Projects: {toThousandNum(twitter?.projects_count)} (includes project
        founders, employees, etc.)
        <br />
        VC: {toThousandNum(twitter?.venture_capitals_count)} (includes VC
        founders, employees, etc.)
        <br />
        Tweets: {toThousandNum(twitter?.tweets_count)}
        <br />
        Search on X:{" "}
        <TextAnchor
          withDecoration
          className='inline-flex'
          href={`https://x.com/search?q=${tokenInfo?.symbol}`}
        >
          {tokenInfo?.symbol}
        </TextAnchor>{" "}
        <TextAnchor
          className='inline-flex'
          withDecoration
          href={`https://x.com/search?q=${tokenInfo?.address}`}
        >
          {tokenInfo?.address}
        </TextAnchor>
      </div>
    </ChatContentContainer>
  );
}
