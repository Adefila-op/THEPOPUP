import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { MiniKitProvider as MiniKitSDKProvider } from "@coinbase/onchainkit/minikit";

const queryClient = new QueryClient();

export const MiniKitProvider = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <MiniKitSDKProvider>
        {children}
      </MiniKitSDKProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
