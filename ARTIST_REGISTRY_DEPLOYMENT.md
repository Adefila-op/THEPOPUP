# Deploy Artist Registry Contract

This guide explains how to deploy the `ArtistRegistry` contract so that all users can see artist data stored on-chain.

## Prerequisites

- Hardhat project setup (already in place with `PopupSubscription`)
- Base Sepolia testnet access with funded wallet
- `.env` file with `PRIVATE_KEY` and `BASE_SEPOLIA_RPC_URL`

## Step 1: Update Hardhat Config

Add the following to your `hardhat.config.js` if not already present:

```javascript
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
  },
};
```

## Step 2: Deploy the Contract

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deployArtistRegistry.js --network baseSepolia
```

## Create `scripts/deployArtistRegistry.js`:

```javascript
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying ArtistRegistry with account: ${deployer.address}`);

  const ArtistRegistry = await hre.ethers.getContractFactory("ArtistRegistry");
  const registry = await ArtistRegistry.deploy();
  await registry.deployed();

  console.log(`✅ ArtistRegistry deployed to: ${registry.address}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: registry.address,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    abi: registry.interface.format("json"),
  };

  const deploymentPath = path.join(
    __dirname,
    `../deployments/artistRegistry-${hre.network.name}.json`
  );
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n📝 Update .env.local with:`);
  console.log(`VITE_ARTIST_REGISTRY_ADDRESS=${registry.address}`);

  // Verify
  if (hre.network.name === "baseSepolia") {
    console.log(`\n🔗 Verify: npx hardhat verify --network baseSepolia ${registry.address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Step 3: Update Environment

Add to `.env.local`:

```
VITE_ARTIST_REGISTRY_ADDRESS=0x<deployed-contract-address>
```

## Step 4: Update Admin Panel

Update `src/pages/AdminPage.tsx` to use the contract:

```typescript
import { writeContractAsync } from "wagmi/actions";

const ARTIST_REGISTRY_ABI = [
  // ... see deployments file for full ABI
];

const handleCreateArtist = async () => {
  if (!newArtistName.trim() || !newArtistAddress.trim()) return;
  
  try {
    // Write to contract
    const hash = await writeContractAsync(wagmiConfig, {
      address: import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS as `0x${string}`,
      abi: ARTIST_REGISTRY_ABI,
      functionName: "registerArtist",
      args: [
        newArtistAddress.toLowerCase(),
        newArtistName,
        newArtistBio,
        "0.0006 ETH",
      ],
    } as any);
    
    toast({ title: "Artist registered on-chain", description: `TX: ${hash}` });
  } catch (error) {
    toast({ title: "Error", description: "Failed to register artist", variant: "destructive" });
  }
};
```

## Step 5: Update Components to Read from Contract

Update `src/pages/CreatorsPage.tsx`:

```typescript
import { useArtistRegistry } from "@/hooks/useArtistRegistry";

const CreatorsPage = () => {
  const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;
  const { artists: blockchainArtists, isLoading } = useArtistRegistry(registryAddress);
  
  const [creators, setCreators] = useState<Creator[]>(blockchainArtists);

  useEffect(() => {
    setCreators(blockchainArtists);
  }, [blockchainArtists]);
  
  // ... rest of component
};
```

## Verification

After deployment, you can verify the contract:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

View on [BaseScan](https://sepolia.basescan.org):
```
https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>
```

## Features

✅ All artists stored on-chain  
✅ Visible to all users globally  
✅ Immutable history via events  
✅ Admin-only artist registration  
✅ Artist metadata available on-chain  

## Troubleshooting

**Compilation Error:**
```bash
npx hardhat compile
```

**Deployment Failed:**
- Check `.env` has `PRIVATE_KEY` and `BASE_SEPOLIA_RPC_URL`
- Check wallet has ETH on Base Sepolia
- Check gas prices: `https://sepolia.basescan.org/gastracker`

**Contract Not Found:**
- Verify address in `.env.local`
- Check on BaseScan Explorer
