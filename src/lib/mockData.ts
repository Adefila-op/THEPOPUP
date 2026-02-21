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
  subscriberOnly: boolean;
  endsIn: string;
  hasCampaign: boolean;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  subscribers: number;
  drops: number;
  subscriptionPrice: string;
  isNew?: boolean;
  coverImage?: string;
  socials?: { twitter?: string; discord?: string };
}

export const mockDrops: Drop[] = [
  {
    id: "1",
    title: "Phantom Hoodie 001",
    creator: "KXNS",
    creatorId: "1",
    creatorAvatar: "",
    image: drop1,
    priceSubscriber: "0.02 ETH",
    pricePublic: "0.04 ETH",
    supply: 100,
    claimed: 67,
    subscriberOnly: false,
    endsIn: "2d 14h",
    hasCampaign: true,
  },
  {
    id: "2",
    title: "Sacred Geometry Print",
    creator: "Aetheria",
    creatorId: "2",
    creatorAvatar: "",
    image: drop2,
    priceSubscriber: "0.015 ETH",
    pricePublic: "0.03 ETH",
    supply: 50,
    claimed: 42,
    subscriberOnly: true,
    endsIn: "1d 6h",
    hasCampaign: false,
  },
  {
    id: "3",
    title: "Shadow Figure Vol.2",
    creator: "DarkToys",
    creatorId: "3",
    creatorAvatar: "",
    image: drop3,
    priceSubscriber: "0.05 ETH",
    pricePublic: "0.08 ETH",
    supply: 25,
    claimed: 12,
    subscriberOnly: false,
    endsIn: "5d 2h",
    hasCampaign: true,
  },
  {
    id: "4",
    title: "Chromatic Runners",
    creator: "NXWAVE",
    creatorId: "4",
    creatorAvatar: "",
    image: drop4,
    priceSubscriber: "0.1 ETH",
    pricePublic: "0.15 ETH",
    supply: 200,
    claimed: 148,
    subscriberOnly: false,
    endsIn: "12h",
    hasCampaign: false,
  },
];

export const mockCreators: Creator[] = [
  {
    id: "1",
    name: "KXNS",
    avatar: "",
    bio: "Streetwear meets digital. Tokyo-based physical art drops.",
    subscribers: 1240,
    drops: 12,
    subscriptionPrice: "0.01 ETH/mo",
  },
  {
    id: "2",
    name: "Aetheria",
    avatar: "",
    bio: "Sacred geometry art prints. Limited editions only.",
    subscribers: 890,
    drops: 8,
    subscriptionPrice: "0.008 ETH/mo",
  },
  {
    id: "3",
    name: "DarkToys",
    avatar: "",
    bio: "Designer vinyl figures. Dark aesthetics. Collector grade.",
    subscribers: 2100,
    drops: 24,
    subscriptionPrice: "0.015 ETH/mo",
  },
  {
    id: "4",
    name: "NXWAVE",
    avatar: "",
    bio: "Futuristic footwear drops. Chrome + neon everything.",
    subscribers: 3400,
    drops: 6,
    subscriptionPrice: "0.02 ETH/mo",
  },
  {
    id: "5",
    name: "ZenithCraft",
    avatar: "",
    bio: "Handcrafted ceramic art meets blockchain. Every piece tells a story.",
    subscribers: 42,
    drops: 1,
    subscriptionPrice: "0.005 ETH/mo",
    isNew: true,
  },
];
