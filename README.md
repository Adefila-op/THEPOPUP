# The POP Up — Physical Art. Onchain Ownership.

A Farcaster miniapp built on Base that empowers creators to launch exclusive physical art drops with tokenized ownership and resale rights.

## Features

- **Creator Marketplace** - Browse and subscribe to creators
- **Exclusive Drops** - Access limited-edition physical art launches
- **Wallet Integration** - Connect via Farcaster or Coinbase Wallet
- **Onchain Campaigns** - Participate in tokenized campaigns for drops
- **Resale Rights** - Earn resale royalties through campaigns on Base
- **Share to Farcaster** - Share drops and campaigns directly to Farcaster casts

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **Wallet**: Wagmi + Coinbase OnchainKit
- **Blockchain**: Base (Optimism L2)
- **Farcaster**: @farcaster/miniapp-sdk + frame-wagmi-connector
- **Routing**: React Router
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd drop-and-claim-baseapp

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Development

```sh
# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## Deployment

### Deploy to Vercel

```sh
npm run build
vercel --prod
```

The app is configured to deploy on Vercel with proper SPA routing.

**Live URL**: https://the-popup.vercel.app

## Smart Contract (draft)

A minimal Solidity contract lives under `contracts/PopupSubscription.sol`.  It exposes

```solidity
function subscribe(address artist) external payable;
function whitelistArtist(address artist) external onlyOwner;
function isWhitelisted(address artist) external view returns (bool);
```

`subscribe` requires exactly 1 ETH and splits the value 25/75 between the platform
and the recipient artist.  The contract is owned by the platform and only the owner
can manage the artist whitelist or change the platform wallet.

_To deploy locally you can add a simple Hardhat/Foundry config and run the usual
`npx hardhat compile && npx hardhat run scripts/deploy.js --network base`._

Once deployed, set `VITE_POPUP_SUBSCRIPTION_ADDRESS` in your `.env.local`.

## Project Structure

```
src/
├── components/        # React components (UI, providers, wallet)
├── pages/            # Page components (Drops, Creators, Dashboard, etc.)
├── hooks/            # Custom hooks (useMiniKit, useWalletAction, etc.)
├── lib/              # Utilities and configs (wagmi, mockData, utils)
├── assets/           # Images and static assets
├── App.tsx           # Main app component
├── main.tsx          # React entry point
└── index.css         # Global styles with Tailwind
```

## Configuration

- **Wagmi Config**: [src/lib/wagmi.ts](src/lib/wagmi.ts) - Wallet connectors and chains
- **Farcaster Manifest**: [public/.well-known/farcaster.json](public/.well-known/farcaster.json)
- **Build Config**: [vite.config.ts](vite.config.ts)
- **Deployment Config**: [vercel.json](vercel.json)

## Environment Variables

Create a `.env.local` file with:

```
VITE_ONCHAINKIT_API_KEY=your_api_key_here
# address of the deployed subscription contract on Base
VITE_POPUP_SUBSCRIPTION_ADDRESS=0xYourContractAddress
```

## License

Proprietary - All rights reserved
