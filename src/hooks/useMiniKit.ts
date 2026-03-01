import { useCallback, useState, useEffect } from "react";

// Mock implementation replacing @coinbase/onchainkit/minikit
export const useMiniKit = () => {
  const [isFrameReady, setIsFrameReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, we would listen to Farcaster SDK ready event
    setIsFrameReady(true);
  }, []);

  return {
    isFrameReady,
    context,
    setFrameReady: () => setIsFrameReady(true),
  };
};

export const useShareUrl = () => {
  const { context } = useMiniKit();
  const isInMiniApp = !!context;

  const shareUrl = useCallback(
    async (url: string, text?: string) => {
      if (isInMiniApp) {
        try {
          // Use the SDK's composeCast action
          const mod = await import("@farcaster/miniapp-sdk");
          if (mod?.sdk?.actions?.composeCast) {
            await mod.sdk.actions.composeCast({
              text: text || "Check out The POP Up — Physical Art. Onchain Ownership.",
              embeds: [url],
            });
          }
        } catch {
          window.open(
            `https://warpcast.com/~/compose?text=${encodeURIComponent(text || "")}&embeds[]=${encodeURIComponent(url)}`,
            "_blank"
          );
        }
      } else if (navigator.share) {
        navigator.share({ url, title: text }).catch(() => {});
      } else {
        window.open(
          `https://warpcast.com/~/compose?text=${encodeURIComponent(text || "")}&embeds[]=${encodeURIComponent(url)}`,
          "_blank"
        );
      }
    },
    [isInMiniApp]
  );

  return { shareUrl, isInMiniApp };
};
