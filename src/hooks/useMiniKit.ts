// Re-export OnchainKit's useMiniKit as the canonical hook.
// This replaces our manual @farcaster/miniapp-sdk implementation.
export { useMiniKit } from "@coinbase/onchainkit/minikit";

// Helper for share/cast — wraps OnchainKit's useOpenUrl and useComposeCast
import { useCallback } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export const useShareUrl = () => {
  const { context } = useMiniKit();
  const isInMiniApp = !!context;

  const shareUrl = useCallback(
    async (url: string, text?: string) => {
      if (isInMiniApp) {
        try {
          // Use the SDK's composeCast action
          const { sdk } = await import("@farcaster/miniapp-sdk");
          await sdk.actions.composeCast({
            text: text || "Check out The POP Up — Physical Art. Onchain Ownership.",
            embeds: [url],
          });
        } catch {
          window.open(
            `https://warpcast.com/~/compose?text=${encodeURIComponent(text || "")}&embeds[]=${encodeURIComponent(url)}`,
            "_blank"
          );
        }
      } else if (navigator.share) {
        navigator.share({ url, title: text });
      }
    },
    [isInMiniApp]
  );

  return { shareUrl, isInMiniApp };
};
