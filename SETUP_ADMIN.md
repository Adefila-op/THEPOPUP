# Complete Setup & Deployment Workflow

## 📦 What's Been Created

1. **Smart Contract** (`contracts/PopupSubscription.sol`)
   - Handles subscriptions (1 ETH per artist)
   - Splits revenue 25% platform / 75% artist
   - Maintains artist whitelist
   - Owner-gated whitelist management

2. **Hardhat Project** (`hardhat.config.js`, `scripts/deploy.js`)
   - Configure Base RPC, networks, and keys
   - Deploy to Base mainnet or testnet (Sepolia)
   - Verify on BaseScan

3. **Admin Page** (`src/pages/AdminPage.tsx`)
   - Whitelist/remove artists from the platform
   - Protected by admin wallet check
   - On-chain whitelist management via contract calls

4. **Frontend Integration**
   - Contract address and ABI in `src/lib/contracts.ts`
   - Environment variables in `.env.local`
   - Routes wired up: `/admin` → AdminPage

---

## 🚀 Quick Start (5 steps)

### Step 1: Install Hardhat Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomiclabs/hardhat-ethers ethers dotenv
```

### Step 2: Create `.env` file (for deployments)

In the project root, create a file named `.env` (NOT `.env.local`):

```bash
# Your wallet private key (KEEP THIS SECRET!)
PRIVATE_KEY=0x...your_private_key_here...

# Platform wallet (where 25% of subscription fees go)
# This can be your address or a treasury/DAO
PLATFORM_WALLET=0x...your_platform_wallet_address...

# (Optional) RPC endpoints - Hardhat has built-in defaults
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# (Optional) For BaseScan verification
BASESCAN_API_KEY=...get_this_from_basescan.org...
```

**⚠️ Security:** Never commit `.env` to git. Add it to `.gitignore`:
```
.env
.env.local
node_modules/
artifacts/
cache/
```

### Step 3: Deploy to Base Sepolia (Testnet)

Get some test ETH first:
- Visit [base.org/faucet](https://base.org/faucet)
- Get ~0.5 ETH for gas

Then deploy:
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Output will look like:**
```
Deploying contract with account: 0xabcd...
✅ PopupSubscription deployed to: 0x1234567890123456789012345678901234567890

⚠️ NEXT STEPS:
1. Copy the contract address
2. Add to your .env.local file:
   VITE_POPUP_SUBSCRIPTION_ADDRESS=0x1234567890123456789012345678901234567890
```

### Step 4: Update `.env.local`

Update the frontend environment file with:

```bash
# .env.local

VITE_PROJECT_ID=62b7b18115e2cf405a22952b2ae49e3b
VITE_ONCHAINKIT_API_KEY=your_api_key_here
VITE_POPUP_SUBSCRIPTION_ADDRESS=0x1234567890123456789012345678901234567890  # <- From step 3
VITE_ADMIN_ADDRESS=0xYourAdminWalletAddress  # <- The wallet that can whitelist artists
```

### Step 5: Start the App

```bash
npm run dev
```

Visit `http://localhost:5173` → App should now use your real contract!

---

## 👨‍💼 Using the Admin Page

### Accessing Admin Panel

1. Go to `http://localhost:5173/admin`
2. Connect your wallet
3. If your wallet matches `VITE_ADMIN_ADDRESS`, you'll see the admin dashboard
4. If not, you'll get an "Access Denied" message

### Whitelisting an Artist

1. Get the artist's Ethereum address (e.g., `0xabcd...`)
2. In the admin page, paste it into the input field
3. Click "Add"
4. Confirm the transaction in your wallet
5. Artist is now whitelisted and can:
   - Create drops
   - Manage campaigns
   - Receive subscription revenue (75%)

### Removing an Artist

1. Find their address in the "Whitelisted Artists" list
2. Click the trash icon
3. Confirm the transaction
4. Artist can no longer create/manage drops

---

## 🔀 What Happens When...

### User Subscribes to an Artist

```
User clicks "Subscribe" on CreatorCard
  → Wallet opens (Coinbase Wallet / Farcaster)
  → User confirms 1 ETH transaction
  → Contract.subscribe(artistAddress) executes
  → Fees split: 0.25 ETH → platform, 0.75 ETH → artist
  → "Subscribed" state updates
```

### Admin Adds Artist to Whitelist

```
Admin enters artist address on /admin
  → Clicks "Add"
  → Wallet opens
  → Admin confirms transaction
  → Contract.whitelistArtist(address) executes
  → Artist now appears in "Whitelisted Artists" list
  → Artist can now create drops (once we implement the gate)
```

---

## 📋 Environment Variables Explained

### `.env` (for deployment only, never commit)
| Variable | Purpose | Example |
|----------|---------|---------|
| `PRIVATE_KEY` | Deploy transactions | `0x1234...` |
| `PLATFORM_WALLET` | Receives 25% fees | `0xabcd...` |
| `BASE_SEPOLIA_RPC_URL` | Testnet RPC | `https://sepolia.base.org` |
| `BASESCAN_API_KEY` | Contract verification | From basescan.org |

### `.env.local` (frontend, safe to commit)
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_PROJECT_ID` | Reown SDK | `62b7b18...` |
| `VITE_ONCHAINKIT_API_KEY` | Coinbase SDK | `from cloud.coinbase...` |
| `VITE_POPUP_SUBSCRIPTION_ADDRESS` | Contract address | `0x1234...` |
| `VITE_ADMIN_ADDRESS` | Admin wallet | `0xabcd...` |

---

## 🔍 Viewing Your Contract on Block Explorers

### Base Sepolia (Testnet)
```
https://sepolia.basescan.org/address/0x1234567890123456789012345678901234567890
```

### Base Mainnet (Production)
```
https://basescan.org/address/0x1234567890123456789012345678901234567890
```

Replace `0x1234...` with your actual contract address.

---

## 🧪 Testing Locally (Without Real Eth)

```bash
# Start a local Hardhat network
npx hardhat node

# In another terminal, deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Use the local contract address in your app
VITE_POPUP_SUBSCRIPTION_ADDRESS=0x5FbDB2315678afccb333f8a9c45b65d30f2FcCf4
```

---

## ✅ Checklist

- [ ] Installed Hardhat and dependencies (`npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`)
- [ ] Created `.env` with `PRIVATE_KEY` and `PLATFORM_WALLET`
- [ ] Got test ETH on Base Sepolia
- [ ] Deployed contract: `npx hardhat run scripts/deploy.js --network baseSepolia`
- [ ] Copied contract address from output
- [ ] Updated `.env.local` with `VITE_POPUP_SUBSCRIPTION_ADDRESS` and `VITE_ADMIN_ADDRESS`
- [ ] Started dev server: `npm run dev`
- [ ] Visited `/admin` and whitelisted a test artist
- [ ] Tested subscribe flow on a creator card

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Ensure your `.env` wallet has enough Base Sepolia ETH
- Get more from the faucet

### "Invalid private key"
- Check `.env` `PRIVATE_KEY` is valid hex with `0x` prefix
- Don't include quotes

### "Admin access denied"
- Verify `VITE_ADMIN_ADDRESS` in `.env.local` matches your connected wallet
- Disconnect/reconnect wallet to refresh

### "Contract address not found"
- Check `VITE_POPUP_SUBSCRIPTION_ADDRESS` is set in `.env.local`
- Verify it's a valid address (42 characters)

### "Gas estimation failed"
- Ensure artist address is valid (starts with `0x`, 42 chars)
- Try paying more gas (unlikely on Base)

---

## 🎯 Next Steps After Setup

1. **Gate creator features** based on `isWhitelisted(address)`
   - Hide "Create Drop" button for non-whitelisted users
   - Show message: "Only approved artists can create drops"

2. **Replace mock data** with on-chain or backend queries
   - Fetch whitelisted artists
   - Cache subscription state

3. **Add more admin features**
   - Set platform wallet address
   - View transaction history
   - Manage fee percentages

4. **Deploy to mainnet**
   - Change `--network base` in deploy script
   - Use real ETH
   - Verify contract on BaseScan

---

## 📞 Quick Reference

**Deploy to testnet:**
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Deploy to mainnet:**
```bash
npx hardhat run scripts/deploy.js --network base
```

**View deployments:**
```bash
cat deployments/baseSepolia.json  // or deployments/base.json
```

**Access admin page:**
```
http://localhost:5173/admin
```
