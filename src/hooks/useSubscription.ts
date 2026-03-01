import { useContractRead, useContractWrite } from "wagmi";
import { popupSubscriptionAbi, POPUP_SUBSCRIPTION_ADDRESS } from "@/lib/contracts";

/**
 * Lightweight wrapper around the on‑chain subscription contract.
 *
 * - front‑end components can call `subscribe` (though for now the
 *   operation lives in `useWalletAction`).
 * - `isWhitelisted` is useful for gating artist features.
 * - administrative functions (whitelist/owner) can be exposed later.
 */
export const useSubscription = () => {
  const isWhitelistedReader = useContractRead({
    address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
    abi: popupSubscriptionAbi,
    functionName: "isWhitelisted",
    args: [], // caller will provide an address when reading
    enabled: false, // we'll call manually
  });

  const whitelistWriter = useContractWrite({
    address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
    abi: popupSubscriptionAbi,
    functionName: "whitelistArtist",
  });

  const removeWriter = useContractWrite({
    address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
    abi: popupSubscriptionAbi,
    functionName: "removeArtist",
  });

  return {
    isWhitelistedReader,
    whitelistWriter,
    removeWriter,
  };
};
