import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    // Farcaster/Base App connector — used when inside Base App / Warpcast
    farcasterFrame(),
    // Coinbase Wallet fallback — used in regular browser
    coinbaseWallet({
      appName: "The POP Up",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
