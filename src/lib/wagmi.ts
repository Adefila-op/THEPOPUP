import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    // MetaMask & other browser-injected wallets
    injected(),
    // Farcaster/Base App connector — used when inside Base App / Warpcast
    farcasterFrame(),
    // Coinbase Wallet fallback — used in regular browser
    coinbaseWallet({
      appName: "The POP Up",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export const getConfig = () => wagmiConfig;
