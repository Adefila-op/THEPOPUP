# The POP Up — Base Mini App Setup Guide

## What Was Changed

This project has been updated with all the necessary code to run as a **Base Mini App** (Farcaster Mini App in the Coinbase Base ecosystem). Here's a summary of every change made:

### New Files
- `public/.well-known/farcaster.json` — The Mini App manifest (needs your signed credentials)
- `src/hooks/useMiniKit.ts` — Hook that initializes the Farcaster Mini App SDK, reads user context
- `src/components/MiniKitProvider.tsx` — React context provider wrapping the whole app
- `src/components/ShareButton.tsx` — Share button that triggers Warpcast/Base App cast composer

### Modified Files
- `index.html` — Added `fc:miniapp` meta embed tag (enables share previews in Base App feed)
- `src/main.tsx` — Wrapped app in `<MiniKitProvider>`
- `src/components/Navbar.tsx` — Shows Farcaster user profile (avatar + name) when inside Base App instead of "Connect" button
- `src/components/InstallGate.tsx` — Removed PWA install gate (not needed inside Base App)
- `src/pages/Index.tsx` — Added Share button to hero section
- `package.json` — Added `@farcaster/miniapp-sdk` dependency

---

## Steps to Publish

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Deploy to Production
Push to your repo and deploy (Vercel recommended). Make sure **Vercel Authentication / Deployment Protection is OFF** so the manifest is publicly accessible.

```bash
# Verify the manifest is accessible:
curl https://drop-and-claim.lovable.app/.well-known/farcaster.json
```

### Step 3: Sign Your Manifest (Critical!)
The `accountAssociation` block in `public/.well-known/farcaster.json` must be signed by your Farcaster account.

1. Go to **https://www.base.dev/preview?tab=account**
2. Paste your domain: `drop-and-claim.lovable.app`
3. Click **Submit**, then **Verify**
4. Sign the message with your Farcaster wallet
5. Copy the generated `accountAssociation` JSON

Then update `public/.well-known/farcaster.json`:
```json
{
  "accountAssociation": {
    "header": "YOUR_ACTUAL_SIGNED_HEADER",
    "payload": "YOUR_ACTUAL_SIGNED_PAYLOAD",
    "signature": "YOUR_ACTUAL_SIGNATURE"
  },
  ...
}
```

### Step 4: Add OG Images
The manifest references these image URLs — add them to your `/public` folder:
- `/public/og-image.png` — 1200×630px hero image (shown in feed previews)
- `/public/splash.png` — 200×200px splash/loading image
- `/public/screenshot-1.png` — App screenshot (portrait, ~390×844px)

### Step 5: Validate
Go to **https://base.dev/preview**, enter your URL, and check:
- ✅ Embeds tab shows your og-image and button
- ✅ Account association tab shows your Farcaster account
- ✅ Metadata tab shows all miniapp fields

### Step 6: Publish
To make the app discoverable in the Base App, create a post in the Base App with your app URL:
```
https://drop-and-claim.lovable.app
```

---

## How the SDK Works in Your App

The `useMiniKitContext()` hook gives every component access to:

```ts
const {
  isInMiniApp,     // true when running inside Base App
  user,            // { fid, username, displayName, pfpUrl } — Farcaster user
  isLoading,       // true during SDK initialization
  openUrl,         // opens external URLs properly inside Base App
  close,           // closes the mini app
  shareUrl,        // triggers Warpcast cast composer with URL embed
} = useMiniKitContext();
```

### Example usage in any component:
```tsx
import { useMiniKitContext } from "@/components/MiniKitProvider";

const MyComponent = () => {
  const { isInMiniApp, user, shareUrl } = useMiniKitContext();

  return (
    <div>
      {isInMiniApp && user && <p>Welcome, {user.displayName}!</p>}
      <button onClick={() => shareUrl("https://drop-and-claim.lovable.app/drops/1", "Check out this drop!")}>
        Share Drop
      </button>
    </div>
  );
};
```

---

## Next Steps (Optional Enhancements)

- **Wallet transactions**: Use `@coinbase/onchainkit` with wagmi to trigger actual onchain minting from within the Base App
- **Notifications**: Implement the webhook at `/api/webhook` to send push notifications to subscribers
- **Authentication**: Use `sdk.actions.signIn()` for SIWF (Sign In With Farcaster) to verify user identity server-side
