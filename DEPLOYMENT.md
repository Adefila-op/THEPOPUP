# Smart Contract Deployment Guide

## Overview

The **PopupSubscription** contract manages artist subscriptions on Base. It:
- Accepts 1 ETH per subscription
- Splits funds 25% (platform) / 75% (artist)
- Maintains an artist whitelist
- Only the owner can manage the whitelist

## Prerequisites

1. **Node.js** 16+ and npm/yarn
2. **Private key** with funds on Base (mainnet or Sepolia testnet)
3. **Base RPC endpoint** (Alchemy, Infura, or public endpoint)

## Setup

### 1. Install Hardhat Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomiclabs/hardhat-ethers ethers dotenv
```

### 2. Create `.env` file in project root

```bash
# Your wallet private key (DO NOT commit this!)
PRIVATE_KEY=0x...your_private_key_here...

# Platform wallet address (where 25% of fees go)
# This can be your own address or a treasury/DAO address
PLATFORM_WALLET=0x...your_platform_wallet_address...

# RPC endpoints (optional - Hardhat has defaults)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# For verifying on BaseScan
BASESCAN_API_KEY=...your_api_key_from_basescan.org...
```

### 3. Get Test ETH (Base Sepolia)

- Go to [base.org/faucet](https://base.org/faucet) or use the Coinbase faucet
- Get ~0.5 ETH for gas costs

## Deploying to Base Sepolia (Testnet)

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Expected output:**
```
Deploying contract with account: 0x...
Account balance: 0.25 ETH

Deploying PopupSubscription...
✅ PopupSubscription deployed to: 0x...ABC123...

📝 Deployment info saved to: deployments/baseSepolia.json

⚠️ NEXT STEPS:
1. Copy the contract address
2. Add to your .env.local file:
   VITE_POPUP_SUBSCRIPTION_ADDRESS=0x...ABC123...
```

## Deploying to Base Mainnet (Production)

**⚠️ WARNING: This costs real ETH. Verify everything first.**

```bash
npx hardhat run scripts/deploy.js --network base
```

## Getting the Contract Address

After deployment, the contract address is printed to console. You can also find it in:
```
deployments/baseSepolia.json  (or deployments/base.json for mainnet)
```

**Example output:**
```json
{
  "network": "baseSepolia",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "platformWallet": "0x9876543210987654321098765432109876543210",
  "deployer": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  "deploymentDate": "2026-02-23T...",
  "deploymentBlock": 12345678
}
```

## Setting the Contract Address in Your App

### 1. Update `.env.local`

```bash
VITE_ONCHAINKIT_API_KEY=your_api_key_here
VITE_POPUP_SUBSCRIPTION_ADDRESS=0x1234567890123456789012345678901234567890
```

### 2. Verify it loads

The app will now use the real contract. Test by:
- Go to Creators page
- Click "Subscribe" on a creator
- Confirm the transaction hits your deployed contract on Base

## Verifying on BaseScan

To make the contract publicly viewable on BaseScan:

```bash
npx hardhat verify --network baseSepolia 0x...CONTRACT_ADDRESS... "0x...PLATFORM_WALLET_ADDRESS..."
```

Example:
```bash
npx hardhat verify --network baseSepolia 0x1234567890123456789012345678901234567890 "0x9876543210987654321098765432109876543210"
```

Visit: `https://sepolia.basescan.org/address/0x...CONTRACT_ADDRESS...`

For mainnet:
```bash
npx hardhat verify --network base 0x...CONTRACT_ADDRESS... "0x...PLATFORM_WALLET_ADDRESS..."
```

Visit: `https://basescan.org/address/0x...CONTRACT_ADDRESS...`

## Local Testing (Hardhat)

Before deploying, test locally:

```bash
npx hardhat test
```

This runs any tests in the `test/` folder against a local Hardhat network.

## Common Issues

**"Insufficient funds for gas"**
- Ensure your wallet has enough ETH for gas costs (~0.01 ETH per deployment on Sepolia, higher on mainnet)

**"Invalid private key"**
- Check `.env` PRIVATE_KEY is a valid hex string starting with `0x`
- Ensure the private key is from an account with funds

**"Network not found"**
- Verify `hardhat.config.js` has the network defined
- Try `--network baseSepolia` explicitly

**"BaseScan verification failed"**
- Check `BASESCAN_API_KEY` is correct
- Ensure constructor args match exactly

## Architecture

The contract is deployed once and reused across:
- **Frontend**: Calls `subscribe(artistAddress)` payable function
- **Admin Page**: Calls `whitelistArtist(address)` and `removeArtist(address)` (owner only)
- **Checks**: Reads `isWhitelisted(address)` to gate creator features

## Next Steps

1. ✅ Deploy contract and get CA
2. ✅ Add CA to `.env.local`
3. → Build Admin Page with whitelist management
4. → Gate creator features based on `isWhitelisted`
5. → Replace mock data with on-chain state
