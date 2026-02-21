/**
 * useWalletAction
 * 
 * Central hook for all wallet-gated actions in The POP Up.
 * Handles: connect prompt, transaction simulation, and state management.
 * Replace the simulated sendTransaction calls with real contract calls when ready.
 */
import { useState, useCallback } from "react";
import { useAccount, useConnect, useBalance } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { parseEther } from "viem";

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
   * Simulate a mint transaction.
   * Replace body with: const hash = await writeContract({ ... })
   */
  const sendTx = useCallback(async (priceEth: string): Promise<string | null> => {
    setState({ status: "pending", txHash: null, error: null });
    try {
      // ── Simulate network delay + tx ──────────────────────────
      await new Promise((r) => setTimeout(r, 2200));
      // In production:
      // const { hash } = await sendTransaction({
      //   to: CONTRACT_ADDRESS,
      //   value: parseEther(priceEth.replace(" ETH","")),
      // });
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
    return null; // caller moves to confirm step
  }, [ensureConnected]);

  /**
   * Confirm subscriber mint (called after user reviews)
   */
  const confirmSubscriberMint = useCallback(async (priceEth: string) => {
    return sendTx(priceEth);
  }, [sendTx]);

  /**
   * Claim a drop as public (bid with funds)
   */
  const claimPublic = useCallback(async (priceEth: string) => {
    if (!ensureConnected()) return null;
    return sendTx(priceEth);
  }, [ensureConnected, sendTx]);

  /**
   * Subscribe to a creator
   */
  const subscribe = useCallback(async (priceEth: string) => {
    if (!ensureConnected()) return null;
    return sendTx(priceEth.replace("/mo", "").replace("ETH", "").trim());
  }, [ensureConnected, sendTx]);

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
