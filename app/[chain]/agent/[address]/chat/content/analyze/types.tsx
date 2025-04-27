export interface TokenInfo {
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

export interface News {
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

export interface Twitter {
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