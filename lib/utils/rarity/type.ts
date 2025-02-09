export interface RarityInfo {
  raritySniper?: {
    ranking: number;
  };
  openRarity?: {
    ranking: number;
  };
}

export type RarityDisplay = {
  name: string;
  className: string;
  percent: "50%" | "40%" | "30%" | "20%" | "10%" | "5%" | "1%";
  original: boolean;
  isBottom: boolean;
  link?: string;
};

export type RarityItemProps = {
  rank: number;
  total: number;
};
