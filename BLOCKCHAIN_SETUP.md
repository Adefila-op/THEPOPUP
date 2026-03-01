# 🚀 Blockchain Artist Registration Setup

## Current Status

✅ **AdminPage is now blockchain-ready!**

When you create or delete an artist in the admin panel, the system will:
1. **Try to sign the artist to the blockchain** via the ArtistRegistry contract
2. **Fall back to localStorage** if the contract isn't deployed yet
3. All other pages will **automatically detect changes** via real-time polling

## What You Need to Do

### Option 1: Deploy via Hardhat (Recommended)
If you have Hardhat set up properly:

```bash
npx hardhat run scripts/deployArtistRegistry.js --network baseSepolia
```

### Option 2: Use a Simple Ethers Deployment Script
If Hardhat has dependency issues:

```bash
node deploySimple.mjs
```

### Option 3: Use Remix (No Installation Required)
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `ArtistRegistry.sol`
3. Copy the contract code from [contracts/ArtistRegistry.sol](contracts/ArtistRegistry.sol)
4. Compile and deploy to Base Sepolia manually
5. Copy the deployed address and add to `.env.local`

## After Deployment

Once you get the contract address (looks like: `0x1234567890...`):

### 1. Update .env.local
```
VITE_ARTIST_REGISTRY_ADDRESS=0x<your-deployed-address>
```

### 2. Restart dev server
```bash
npm run dev
```

### 3. Test it!
1. Go to `/admin` 
2. Create a new artist
3. Approve the wallet transaction
4. The artist will now be signed to the blockchain ✅
5. Open another browser/incognito window
6. Navigate to `/creators`
7. The artist should appear (proving blockchain visibility) 🎉

## Architecture

```
Admin Panel
    ↓
[Register Artist to Blockchain]
    ├─ Success → Blockchain (source of truth)
    │           └─ Other users can see it
    └─ Error   → localStorage (local fallback)
                └─ Only visible locally until contract deployed

All Pages
    ↓
[Polling Every 2-3 Seconds]
    ├─ CreatorsPage: Checks blockchain contract (falls back to localStorage)
    ├─ DropsPage: Checks localStorage for drops
    └─ CreatorProfilePage: Checks localStorage for latest updates
```

## Contract Functions

**registerArtist**(address, string name, string bio, string price)
- Registers a new artist on-chain
- Only callable by contract owner (admin)
- Returns artist ID

**removeArtist**(uint256 artistId)
- Removes an artist from blockchain
- Only callable by owner
- Associated drops still accessible (blockchain doesn't store drops)

**getAllArtists()** (Read-only)
- Returns all artists registered on-chain
- Called by CreatorsPage for real-time visibility
- No gas cost

## Fallback Strategy

The system gracefully handles each scenario:

| Scenario | Create Artist | View Artists | Sync Other Users |
|----------|---------------|--------------|-----------------|
| Contract deployed ✅ | Blockchain only | Blockchain (global) | ✅ Real-time |
| Contract not deployed | localStorage | localStorage + polling | ❌ Local only |
| Network error | localStorage fallback | localStorage (2s polling) | ⏳ Eventual consistency |

## Current Features

✅ Real-time polling (3s CreatorsPage, 2s DropsPage, 3s ProfilePage)
✅ Blockchain ABI configured
✅ Admin panel ready for contract calls
✅ Error handling with intelligent fallbacks
❌ Contract not yet deployed

## Next Immediate Steps

1. **Deploy contract** (30 seconds with Remix)
2. **Add VITE_ARTIST_REGISTRY_ADDRESS to .env.local**
3. **Restart dev server**
4. **Test creating an artist** - you should see wallet prompt!

---

**Questions?** Check the admin panel - it now shows "Artist registered on-chain" when successful and "Blockchain not ready" when falling back to storage.
