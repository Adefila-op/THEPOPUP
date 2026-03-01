import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { injected } from 'wagmi/connectors';

// 1. Setup QueryClient
const queryClient = new QueryClient();

// 2. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID || 'YOUR_PROJECT_ID';

// 3. Create Wagmi Adapter with MetaMask (injected) support
const wagmiAdapter = new WagmiAdapter({
  networks: [baseSepolia],
  projectId,
  ssr: false,
  connectors: [injected()],
});

// 4. Create Modal with MetaMask featured
createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseSepolia],
  projectId,
  features: {
    analytics: true
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  ],
  themeVariables: {
    '--w3m-font-family': '"Space Grotesk", sans-serif',
    '--w3m-accent': '#BFFF00',
    '--w3m-color-mix': '#0a0a0a',
    '--w3m-color-mix-strength': '40',
  },
});

// Try to notify Farcaster frame that the miniapp is ready.
// This is a fallback in case index.html inline script is not preserved by the build.
; (async () => {
  try {
    const mod = await import('@farcaster/miniapp-sdk');
    if (mod?.sdk?.actions?.ready) {
      await mod.sdk.actions.ready();
    }
  } catch (e) {
    // not running inside Farcaster miniapp or module not available — ignore
  }
})();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);
