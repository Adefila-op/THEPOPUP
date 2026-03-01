/**
 * useWalletAction
 * 
 * Central hook for all wallet-gated actions in The POP Up.
 * Handles: connect prompt, transaction simulation, and state management.
 */
import { useState, useCallback, useRef } from "react";
import { useAccount, useConnect, useBalance, useWriteContract } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { parseEther } from "viem";
import { POPUP_SUBSCRIPTION_ADDRESS, popupSubscriptionAbi, DROP_REGISTRY_ADDRESS, dropRegistryAbi } from "@/lib/contracts";

export type TxStatus = "idle" | "connect" | "confirm" | "pending" | "success" | "error";

export interface WalletActionState {
  status: TxStatus;
  txHash: string | null;
  error: string | null;
}

export const useWalletAction = () => {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { data: balance } = useBalance({ address });
  const { writeContractAsync } = useWriteContract();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef<{
    onSuccess?: (hash: string) => void;
    onError?: (error: any) => void;
  }>({});

  const [state, setState] = useState<WalletActionState>({
    status: "idle",
    txHash: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({ status: "idle", txHash: null, error: null });
  }, []);

  const ensureConnected = useCallback((): boolean => {
    if (!isConnected) {
      connect({
        connector: coinbaseWallet({
          appName: "The POP Up",
          preference: "smartWalletOnly",
        }),
      });
      setState((s) => ({ ...s, status: "connect" }));
      return false;
    }
    return true;
  }, [isConnected, connect]);

  /**
   * Fallback simulator for generic transactions
   */
  const sendTx = useCallback(async (priceEth: string): Promise<string | null> => {
    setState({ status: "pending", txHash: null, error: null });
    try {
      await new Promise((r) => {
        timeoutRef.current = setTimeout(r, 2200);
      });
      const mockHash = "0x" + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setState({ status: "success", txHash: mockHash, error: null });
      return mockHash;
    } catch (e: any) {
      setState({ status: "error", txHash: null, error: e?.message || "Transaction failed" });
      return null;
    }
  }, []);

  /**
   * Claim a drop as subscriber
   */
  const claimAsSubscriber = useCallback(async (priceEth: string): Promise<string | null> => {
    if (!ensureConnected()) return null;
    setState({ status: "confirm", txHash: null, error: null });
    return null;
  }, [ensureConnected]);

  /**
   * Confirm subscriber mint
   */
  const confirmSubscriberMint = useCallback(async (priceEth: string, dropId: string) => {
    if (!ensureConnected() || !address) return null;
    setState({ status: "pending", txHash: null, error: null });

    try {
      const hash = await writeContractAsync({
        address: DROP_REGISTRY_ADDRESS as `0x${string}`,
        abi: dropRegistryAbi,
        functionName: "claimDrop",
        args: [BigInt(dropId)],
        value: parseEther(priceEth.replace(" ETH", "")),
        account: address,
      } as any);

      setState({ status: "success", txHash: hash, error: null });
      return hash;
    } catch (e: any) {
      const errorMsg = e?.message || e?.shortMessage || "Claim failed";
      setState({ status: "error", txHash: null, error: errorMsg });
      return null;
    }
  }, [ensureConnected, address, writeContractAsync]);

  /**
   * Claim a drop as public
   */
  const claimPublic = useCallback(async (priceEth: string, dropId: string) => {
    if (!ensureConnected() || !address) return null;
    setState({ status: "pending", txHash: null, error: null });

    try {
      const hash = await writeContractAsync({
        address: DROP_REGISTRY_ADDRESS as `0x${string}`,
        abi: dropRegistryAbi,
        functionName: "claimDrop",
        args: [BigInt(dropId)],
        value: parseEther(priceEth.replace(" ETH", "")),
        account: address,
      } as any);

      setState({ status: "success", txHash: hash, error: null });
      return hash;
    } catch (e: any) {
      const errorMsg = e?.message || e?.shortMessage || "Claim failed";
      setState({ status: "error", txHash: null, error: errorMsg });
      return null;
    }
  }, [ensureConnected, address, writeContractAsync]);

  /**
   * Subscribe to a creator via on-chain contract
   * Price: 0.0006 ETH (≈ $1 USD)
   */
  const subscribe = useCallback(
    async (artistAddress: string, priceEth: string): Promise<string | null> => {
      if (!ensureConnected() || !address) return null;

      setState({ status: "pending", txHash: null, error: null });

      try {
        const hash = await writeContractAsync({
          address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
          abi: popupSubscriptionAbi,
          functionName: "subscribe",
          args: [artistAddress as `0x${string}`],
          value: parseEther("0.0006"), // ≈ $1 USD
          account: address,
        } as any);

        setState({ status: "success", txHash: hash, error: null });
        return hash;
      } catch (e: any) {
        const errorMsg = e?.message || e?.shortMessage || "Subscribe failed";
        setState({ status: "error", txHash: null, error: errorMsg });
        return null;
      }
    },
    [ensureConnected, address, writeContractAsync]
  );

  return {
    address,
    isConnected,
    isConnecting,
    balance,
    state,
    reset,
    claimAsSubscriber,
    confirmSubscriberMint,
    claimPublic,
    subscribe,
  };
};
