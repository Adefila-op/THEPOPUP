// on‑chain contract configuration and minimal ABI
export const POPUP_SUBSCRIPTION_ADDRESS = import.meta.env.VITE_POPUP_SUBSCRIPTION_ADDRESS || "";

export const popupSubscriptionAbi = [
  {
    "inputs": [{ "internalType": "address payable", "name": "_platformWallet", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "subscriber", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "artist", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Subscribed",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }],
    "name": "isWhitelisted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "pendingWithdrawals",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }],
    "name": "whitelistArtist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }],
    "name": "addAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }],
    "name": "removeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "isAdmin",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }],
    "name": "removeArtist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }],
    "name": "getSubscribersCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "subscriber", "type": "address" },
      { "internalType": "address", "name": "artist", "type": "address" }
    ],
    "name": "isUserSubscribed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ARTIST_REGISTRY_ADDRESS = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS || "";

export const artistRegistryAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_artistAddress", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_bio", "type": "string" },
      { "internalType": "string", "name": "_subscriptionPrice", "type": "string" }
    ],
    "name": "registerArtist",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_artistId", "type": "uint256" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_bio", "type": "string" }
    ],
    "name": "updateArtist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_artistId", "type": "uint256" }],
    "name": "removeArtist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_artistId", "type": "uint256" }],
    "name": "getArtist",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "artistAddress", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "bio", "type": "string" },
          { "internalType": "string", "name": "subscriptionPrice", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct ArtistRegistry.Artist",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllArtists",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "artistAddress", "type": "address" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "bio", "type": "string" },
          { "internalType": "string", "name": "subscriptionPrice", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct ArtistRegistry.Artist[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "artistCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const DROP_REGISTRY_ADDRESS = import.meta.env.VITE_DROP_REGISTRY_ADDRESS || "";

export const dropRegistryAbi = [
  {
    "inputs": [{ "internalType": "address", "name": "_artistRegistryAddress", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_popupSubscriptionAddress", "type": "address" }],
    "name": "setPopupSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "dropId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "artist", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "supply", "type": "uint256" }
    ],
    "name": "DropCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "dropId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "claimer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "DropClaimed",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "address", "name": "_artistAddress", "type": "address" },
      { "internalType": "string", "name": "_imageHash", "type": "string" },
      { "internalType": "uint256", "name": "_priceSubscriber", "type": "uint256" },
      { "internalType": "uint256", "name": "_pricePublic", "type": "uint256" },
      { "internalType": "uint256", "name": "_supply", "type": "uint256" },
      { "internalType": "uint256", "name": "_durationHours", "type": "uint256" }
    ],
    "name": "createDrop",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_dropId", "type": "uint256" }],
    "name": "claimDrop",
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_dropId", "type": "uint256" }],
    "name": "getDrop",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "dropId", "type": "uint256" },
          { "internalType": "address", "name": "artist", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "imageHash", "type": "string" },
          { "internalType": "uint256", "name": "priceSubscriber", "type": "uint256" },
          { "internalType": "uint256", "name": "pricePublic", "type": "uint256" },
          { "internalType": "uint256", "name": "supply", "type": "uint256" },
          { "internalType": "uint256", "name": "claimed", "type": "uint256" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "endTime", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct DropRegistry.Drop",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllDrops",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "dropId", "type": "uint256" },
          { "internalType": "address", "name": "artist", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "imageHash", "type": "string" },
          { "internalType": "uint256", "name": "priceSubscriber", "type": "uint256" },
          { "internalType": "uint256", "name": "pricePublic", "type": "uint256" },
          { "internalType": "uint256", "name": "supply", "type": "uint256" },
          { "internalType": "uint256", "name": "claimed", "type": "uint256" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "endTime", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct DropRegistry.Drop[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_artist", "type": "address" }],
    "name": "getDropsByArtist",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "dropId", "type": "uint256" },
          { "internalType": "address", "name": "artist", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "imageHash", "type": "string" },
          { "internalType": "uint256", "name": "priceSubscriber", "type": "uint256" },
          { "internalType": "uint256", "name": "pricePublic", "type": "uint256" },
          { "internalType": "uint256", "name": "supply", "type": "uint256" },
          { "internalType": "uint256", "name": "claimed", "type": "uint256" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "endTime", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" }
        ],
        "internalType": "struct DropRegistry.Drop[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_subscriber", "type": "address" },
      { "internalType": "address", "name": "_artist", "type": "address" }
    ],
    "name": "isSubscribed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const AVATAR_REGISTRY_ADDRESS = import.meta.env.VITE_AVATAR_REGISTRY_ADDRESS || "";

export const avatarRegistryAbi = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "artist", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "imageHash", "type": "string" }
    ],
    "name": "AvatarUpdated",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_artist", "type": "address" }],
    "name": "getAvatar",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_artist", "type": "address" },
      { "internalType": "string", "name": "_imageHash", "type": "string" }
    ],
    "name": "setAvatar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
