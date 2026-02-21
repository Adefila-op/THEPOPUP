import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { Wallet, User, ChevronDown, Copy, ExternalLink, LogOut, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const WalletConnect = () => {
  const { context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const farcasterUser = context?.user;

  const handleConnect = () => {
    connect({
      connector: coinbaseWallet({
        appName: "The POP Up",
        preference: "smartWalletOnly",
      }),
    });
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Connected state ──────────────────────────────────────────
  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          {farcasterUser?.pfpUrl ? (
            <img src={farcasterUser.pfpUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <span className="text-[11px] font-bold text-primary">
            {farcasterUser?.displayName || farcasterUser?.username || short(address)}
          </span>
          <ChevronDown className={`w-3 h-3 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-card border border-white/8 shadow-2xl overflow-hidden"
              >
                {/* Identity header */}
                <div className="p-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    {farcasterUser?.pfpUrl ? (
                      <img src={farcasterUser.pfpUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      {farcasterUser?.displayName && (
                        <p className="text-xs font-bold truncate">{farcasterUser.displayName}</p>
                      )}
                      <p className="text-[11px] font-mono text-muted-foreground">{short(address)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-secondary transition-colors text-left w-full text-muted-foreground hover:text-foreground"
                  >
                    {copied
                      ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                      : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy address"}
                  </button>

                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on Basescan
                  </a>

                  <button
                    onClick={() => { disconnect(); setOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-destructive/10 text-destructive transition-colors w-full text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Disconnected state ───────────────────────────────────────
  return (
    <Button
      variant="neon"
      size="sm"
      className="h-8 px-3 text-[11px] rounded-xl"
      onClick={handleConnect}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Wallet className="w-3.5 h-3.5" />
      )}
      {isPending ? "Connecting…" : "Connect"}
    </Button>
  );
};

export default WalletConnect;
