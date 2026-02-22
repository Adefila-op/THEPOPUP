// Co-Create Types & Data Layer
export type Role = "physical" | "digital";
export type ProductStyle =
  | "hoodie"
  | "poster"
  | "vinyl_figure"
  | "sneakers"
  | "tshirt"
  | "hoodie_limited"
  | "art_print"
  | "collectible";

export type RoyaltySplit =
  | "creator_lean" // Creator 65%, IP 30%, Platform 5%
  | "balanced" // Creator 60%, IP 35%, Platform 5%
  | "ip_heavy"; // Creator 50%, IP 45%, Platform 5%

export interface RoyaltyBreakdown {
  creator: number;
  ip: number;
  platform: number;
}

export const royaltyPresets: Record<RoyaltySplit, RoyaltyBreakdown> = {
  creator_lean: { creator: 65, ip: 30, platform: 5 },
  balanced: { creator: 60, ip: 35, platform: 5 },
  ip_heavy: { creator: 50, ip: 45, platform: 5 },
};

export type CollabStatus =
  | "pending_artist_review"
  | "pending_sample"
  | "sample_ready"
  | "in_revision"
  | "approved_for_mint"
  | "minted"
  | "declined";

export type MessageType = "artist" | "ip" | "system";

export interface Message {
  id: string;
  sender: "physical_artist" | "digital_artist";
  type: MessageType;
  content: string;
  timestamp: number;
  avatar?: string;
  senderName: string;
}

export interface SampleReview {
  status: "pending" | "approved" | "revision_requested";
  physicalArtistApproval: boolean;
  digitalArtistApproval: boolean;
  revisionNotes?: string;
  revisionCount: number;
}

export interface IPRequest {
  id: string;
  physicalArtistId: string;
  digitalArtistId: string;
  productStyle: ProductStyle;
  creativeBrief: {
    productDescription: string;
    designVision: string;
    targetAudience: string;
    estimatedSupply: number;
  };
  royaltySplit: RoyaltySplit;
  royaltyBreakdown: RoyaltyBreakdown;
  ipFeeEscrow: number; // in USDC or Base token
  status: CollabStatus;
  messages: Message[];
  sampleReview?: SampleReview;
  mintHash?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DigitalArtist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  styleTags: string[];
  portfolio: {
    title: string;
    image: string;
    style: string;
  }[];
  responseTime: string; // "< 24h", "2-3 days", etc.
  ipRate: number; // $ per piece
  subscriberCount: number;
  isOpen: boolean; // accepting new requests
  walletAddress: string;
}

export interface PhysicalArtist {
  id: string;
  name: string;
  avatar: string;
  brand: string;
  description: string;
  walletAddress: string;
}

export interface Collaboration {
  id: string;
  request: IPRequest;
  physicalArtist: PhysicalArtist;
  digitalArtist: DigitalArtist;
  actionNeeded: boolean; // has pending tasks
}

// Mock Data
export const mockDigitalArtists: DigitalArtist[] = [
  {
    id: "da-001",
    name: "Luna Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Glitch art pioneer exploring digital chaos. Pushing NFT aesthetics forward.",
    styleTags: ["glitch", "geometric", "surreal"],
    portfolio: [
      {
        title: "Fractured Dreams",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300",
        style: "glitch",
      },
      {
        title: "Neon Geometry",
        image: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300",
        style: "geometric",
      },
      {
        title: "Digital Surrealism",
        image: "https://images.unsplash.com/photo-1578926314433-62c7e9a32e86?w=300",
        style: "surreal",
      },
    ],
    responseTime: "< 24h",
    ipRate: 500,
    subscriberCount: 3400,
    isOpen: true,
    walletAddress: "0x1234567890123456789012345678901234567890",
  },
  {
    id: "da-002",
    name: "Kai Nakamura",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Color theory architect. Designing the next gen of collaborative drops.",
    styleTags: ["color", "minimalist", "fashion"],
    portfolio: [
      {
        title: "Chromatic Waves",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300",
        style: "color",
      },
      {
        title: "Minimal Grid",
        image: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300",
        style: "minimalist",
      },
      {
        title: "Fashion Forward",
        image: "https://images.unsplash.com/photo-1578926314433-62c7e9a32e86?w=300",
        style: "fashion",
      },
    ],
    responseTime: "2-3 days",
    ipRate: 750,
    subscriberCount: 5200,
    isOpen: true,
    walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  },
  {
    id: "da-003",
    name: "Sophia Rivera",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Textile + digital fusion artist. Making wearable art that talks.",
    styleTags: ["textile", "surreal", "wearable"],
    portfolio: [
      {
        title: "Woven Chaos",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300",
        style: "textile",
      },
      {
        title: "Surreal Fabric",
        image: "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=300",
        style: "surreal",
      },
      {
        title: "Body Art",
        image: "https://images.unsplash.com/photo-1578926314433-62c7e9a32e86?w=300",
        style: "wearable",
      },
    ],
    responseTime: "1-2 days",
    ipRate: 600,
    subscriberCount: 2800,
    isOpen: true,
    walletAddress: "0xfedcbafedcbafedcbafedcbafedcbafedcbafedcb",
  },
];

export const mockPhysicalArtists: PhysicalArtist[] = [
  {
    id: "pa-001",
    name: "Marcus Thompson",
    avatar: "https://i.pravatar.cc/150?img=10",
    brand: "ThreadVerse",
    description:
      "Premium streetwear manufacturer. Based in LA. 10+ years in limited drops.",
    walletAddress: "0x9876543210987654321098765432109876543210",
  },
  {
    id: "pa-002",
    name: "Elena Rossi",
    avatar: "https://i.pravatar.cc/150?img=11",
    brand: "Artisan Goods Co",
    description:
      "Handcrafted collectibles. Boutique production. Quality over quantity.",
    walletAddress: "0x1111111111111111111111111111111111111111",
  },
];

// Sample Collaborations with pending requests
export const mockCollaborations: Collaboration[] = [
  {
    id: "collab-001",
    request: {
      id: "req-001",
      physicalArtistId: "pa-001",
      digitalArtistId: "da-001",
      productStyle: "hoodie",
      creativeBrief: {
        productDescription: "Premium comfort hoodie, 100% organic cotton",
        designVision:
          "Glitch art takes center stage. Fractured reality meets street fashion.",
        targetAudience: "Gen Z digital natives, 18-30, crypto-forward",
        estimatedSupply: 500,
      },
      royaltySplit: "balanced",
      royaltyBreakdown: royaltyPresets.balanced,
      ipFeeEscrow: 200,
      status: "pending_sample",
      messages: [
        {
          id: "msg-001",
          sender: "physical_artist",
          type: "artist",
          content: "Love the glitch concept! Ready to produce. Samples go out tomorrow.",
          timestamp: Date.now() - 86400000,
          senderName: "Marcus Thompson",
          avatar: "https://i.pravatar.cc/150?img=10",
        },
        {
          id: "msg-002",
          sender: "digital_artist",
          type: "ip",
          content: "Awesome! Excited to see how the design translates to fabric.",
          timestamp: Date.now() - 43200000,
          senderName: "Luna Chen",
          avatar: "https://i.pravatar.cc/150?img=1",
        },
      ],
      sampleReview: {
        status: "pending",
        physicalArtistApproval: false,
        digitalArtistApproval: false,
        revisionCount: 0,
      },
      createdAt: Date.now() - 604800000,
      updatedAt: Date.now() - 86400000,
    },
    physicalArtist: mockPhysicalArtists[0],
    digitalArtist: mockDigitalArtists[0],
    actionNeeded: true,
  },
  {
    id: "collab-002",
    request: {
      id: "req-002",
      physicalArtistId: "pa-002",
      digitalArtistId: "da-002",
      productStyle: "art_print",
      creativeBrief: {
        productDescription: "Limited edition fine art print, museum-quality paper",
        designVision: "Chromatic waves exploring color theory intersections",
        targetAudience: "Collectors, architects, design enthusiasts",
        estimatedSupply: 100,
      },
      royaltySplit: "creator_lean",
      royaltyBreakdown: royaltyPresets.creator_lean,
      ipFeeEscrow: 150,
      status: "approved_for_mint",
      messages: [
        {
          id: "msg-003",
          sender: "physical_artist",
          type: "artist",
          content: "Both sides approved! Ready to mint.",
          timestamp: Date.now() - 172800000,
          senderName: "Elena Rossi",
          avatar: "https://i.pravatar.cc/150?img=11",
        },
      ],
      sampleReview: {
        status: "approved",
        physicalArtistApproval: true,
        digitalArtistApproval: true,
        revisionCount: 1,
      },
      createdAt: Date.now() - 1209600000,
      updatedAt: Date.now() - 172800000,
    },
    physicalArtist: mockPhysicalArtists[1],
    digitalArtist: mockDigitalArtists[1],
    actionNeeded: false,
  },
];

export const getDigitalArtistById = (id: string): DigitalArtist | undefined => {
  return mockDigitalArtists.find((artist) => artist.id === id);
};

export const getCollaborationById = (id: string): Collaboration | undefined => {
  return mockCollaborations.find((collab) => collab.id === id);
};

export const getPhysicalArtistById = (id: string): PhysicalArtist | undefined => {
  return mockPhysicalArtists.find((artist) => artist.id === id);
};
