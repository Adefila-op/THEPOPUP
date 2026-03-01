# Artist Registry - On-Chain Implementation Guide

This solution stores artist data on the blockchain so **all users globally can see the same artist list**.

## 📋 What's Changed

### Problem
- Artists created by admin only showed in localStorage
- Other users couldn't see the artists (different browser/device)

### Solution

**New Smart Contract:** `ArtistRegistry.sol`
- Stores artist names, bios, addresses, and prices **on-chain**
- Only admin can register/update/remove artists
- All users can read through the same globally-available contract

---

## 🚀 Quick Start

### Option 1: Use Existing Smart Contract (If Deployed)

If you already have the `ArtistRegistry` contract deployed:

```bash
# Add deployment address to .env.local
echo "VITE_ARTIST_REGISTRY_ADDRESS=0x<YOUR_ADDRESS>" >> .env.local
```

Then update components to read from it.

### Option 2: Deploy From Scratch

#### 1. **Compile the Contract**

```bash
npx hardhat compile
```

#### 2. **Deploy to Base Sepolia**

```bash
npx hardhat run scripts/deployArtistRegistry.js --network baseSepolia
```

You'll get output:
```
✅ ArtistRegistry deployed to: 0x1234567890123456789012345678901234567890
📝 Add to .env.local: VITE_ARTIST_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
```

#### 3. **Update Your `.env.local`**

```env
VITE_ARTIST_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
```

#### 4. **Restart Dev Server**

```bash
npm run dev
```

---

## 📝 Update Your Components

### Step 1: Update AdminPage.tsx

The admin panel will now write artist data **to the contract** instead of localStorage:

```typescript
import { useWriteContractAsync } from "wagmi";

const ARTIST_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_artistAddress", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_bio", type: "string" },
      { internalType: "string", name: "_subscriptionPrice", type: "string" },
    ],
    name: "registerArtist",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ... other functions
];

const handleCreateArtist = async () => {
  if (!newArtistName.trim() || !newArtistAddress.trim()) return;

  try {
    const hash = await writeContractAsync({
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
  } catch (error: any) {
    toast({ 
      title: "Error", 
      description: error?.message || "Failed to register artist", 
      variant: "destructive" 
    });
  }
};
```

### Step 2: Update CreatorsPage.tsx 

Components now fetch artists from the contract using `useArtistRegistry`:

```typescript
import { useArtistRegistry } from "@/hooks/useArtistRegistry";
import { mockCreators, type Creator } from "@/lib/mockData";

const CreatorsPage = () => {
  const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;
  const { artists: blockchainArtists, isLoading } = useArtistRegistry(registryAddress);
  const [query, setQuery] = useState("");

  // Use blockchain artists if registry is deployed, otherwise use mock
  const [creators, setCreators] = useState<Creator[]>(mockCreators);

  useEffect(() => {
    if (blockchainArtists.length > 0) {
      setCreators(blockchainArtists);
    } else if (registryAddress) {
      // Contract exists but empty - show loading state
      // Otherwise fall back to what's in localStorage
      const localArtists = localStorage.getItem("popup:artists");
      if (localArtists) {
        setCreators(JSON.parse(localArtists));
      }
    }
  }, [blockchainArtists, registryAddress]);

  return (
    <Layout>
      {isLoading && <div>Loading artists from blockchain...</div>}
      {/* ... rest of component */}
    </Layout>
  );
};
```

### Step 3: Update DropsPage.tsx

Similarly, drops can reference artists loaded from the blockchain.

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│  Admin Creates Artist via /admin Page   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  writeContractAsync to ArtistRegistry │
│  functionName: "registerArtist"       │
└──────────────┬───────────────────────┘
               │
               ▼ (transaction mined)
┌──────────────────────────────────────┐
│   Artist Data Stored On-Chain         │
│   (Base Sepolia Blockchain)           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  All Users Query Contract via         │
│  useArtistRegistry hook               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  readContract returns Artist Array    │
│  Same data for all users globally     │
└──────────────────────────────────────┘
```

---

## ✅ Verification

### View on BaseScan

After deployment, verify everything worked:

```
https://sepolia.basescan.org/address/<VITE_ARTIST_REGISTRY_ADDRESS>
```

Check:
- ✅ Contract code is verified
- ✅ Can call `getAllArtists()` and see data
- ✅ Artist creation events show up

### Test Register Artist

In admin panel:
1. Fill in artist name: "Test Artist"
2. Wallet address: `0x...`
3. Bio: "Test bio"
4. Click "Create Artist"
5. Approve transaction in wallet
6. Wait for transaction to confirm

Then:
1. Go to `/creators`
2. Refresh page
3. New artist should appear (loaded from contract, not localStorage)
4. Open incognito window or different browser
5. Artist should still be visible!

---

## 🛠️ Contract Functions

### For Admin

**Register Artist**
```solidity
function registerArtist(
  address _artistAddress,
  string memory _name,
  string memory _bio,
  string memory _subscriptionPrice
) public onlyOwner returns (uint256)
```

**Update Artist**
```solidity
function updateArtist(
  uint256 _artistId,
  string memory _name,
  string memory _bio
) public onlyOwner
```

**Remove Artist**
```solidity
function removeArtist(uint256 _artistId) public onlyOwner
```

### For Everyone (Read-Only)

**Get All Artists**
```solidity
function getAllArtists() public view returns (Artist[] memory)
```

**Get Single Artist**
```solidity
function getArtist(uint256 _artistId) public view returns (Artist memory)
```

---

## 🐛 Troubleshooting

### "Contract address not set"
Make sure `VITE_ARTIST_REGISTRY_ADDRESS` is in `.env.local`

### "Artist not appearing for other users"
- Check contract is deployed to **Base Sepolia** (not mainnet)
- Verify transaction was mined: check BaseScan explorer
- Wait 2-3 blocks for confirmation
- Hard refresh browser (Ctrl+Shift+R)

### "Can't register artist - only owner"
Make sure you're using the wallet that deployed the contract!
Check in `.env.local`: the deployer address must be in `VITE_ADMIN_ADDRESS`

### Transaction keeps failing
- Check gas price on [BaseScan Gas Tracker](https://sepolia.basescan.org/gastracker)
- Ensure wallet has enough ETH (at least 0.01 ETH)
- Check you're on Base Sepolia network

---

## 📦 Files Created

- **`contracts/ArtistRegistry.sol`** - Smart contract
- **`scripts/deployArtistRegistry.js`** - Deployment script
- **`src/hooks/useArtistRegistry.ts`** - React hook to read from contract
- **`ARTIST_REGISTRY_DEPLOYMENT.md`** - Detailed deployment guide

---

## 🎯 Next Steps

1. ✅ Deploy contract to Base Sepolia
2. ✅ Update `.env.local` with contract address
3. ✅ Update AdminPage to register artists on-chain
4. ✅ Update CreatorsPage to read from contract
5. ✅ Test: Create artist → See on different browser

---

## 💡 Why On-Chain?

✅ **Global visibility** - All users see same data  
✅ **Immutable** - History stored forever  
✅ **Decentralized** - No central database needed  
✅ **Trustless** - No server can manipulate data  
✅ **Events** - Off-chain services can index artists  

---

Need help? Check [Hardhat docs](https://hardhat.org/docs) or [Wagmi docs](https://wagmi.sh)
