/**
 * ConnectPrompt — reusable gate shown inside dialogs when wallet isn't connected.
 * Accepts an onConnect callback so the dialog can proceed after connection.
 */
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConnect } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";

interface ConnectPromptProps {
  action?: string; // e.g. "subscribe" | "claim" | "mint"
}

const ConnectPrompt = ({ action = "continue" }: ConnectPromptProps) => {
  const { connect, isPending } = useConnect();

  return (
    <div className="text-center py-6 px-2">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
        <Wallet className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-display text-lg font-bold mb-1">Connect your wallet</h3>
      <p className="text-sm text-muted-foreground mb-6">
        You need a connected wallet to {action}.
      </p>
      <Button
        variant="hero"
        className="w-full"
        disabled={isPending}
        onClick={() =>
          connect({
            connector: coinbaseWallet({
              appName: "The POP Up",
              preference: "smartWalletOnly",
            }),
          })
        }
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
        ) : (
          <><Wallet className="w-4 h-4" /> Connect Wallet</>
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground mt-3">
        Powered by Coinbase Smart Wallet · Base network
      </p>
    </div>
  );
};

export default ConnectPrompt;
