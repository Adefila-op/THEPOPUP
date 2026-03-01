import drop1 from "@/assets/drop-1.jpg";
import drop2 from "@/assets/drop-2.jpg";
import drop3 from "@/assets/drop-3.jpg";
import drop4 from "@/assets/drop-4.jpg";

export interface Drop {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  creatorAvatar: string;
  image: string;
  priceSubscriber: string;
  pricePublic: string;
  supply: number;
  claimed: number;
  endsIn: string;
  hasCampaign: boolean;
  endTime?: number;
}

export interface Creator {
  id: string;
  /** on‑chain address used for subscriptions */
  address: string;
  name: string;
  avatar: string;
  bio: string;
  subscriptionPrice: string;
  isNew?: boolean;
  coverImage?: string;
  socials?: { twitter?: string; discord?: string };
}

export const mockDrops: Drop[] = [];

export const mockCreators: Creator[] = [];
