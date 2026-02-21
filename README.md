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
```

## License

Proprietary - All rights reserved
