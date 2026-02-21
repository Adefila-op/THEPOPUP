import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Creator } from "@/lib/mockData";
import { useWalletAction } from "@/hooks/useWalletAction";
import ConnectPrompt from "@/components/ConnectPrompt";
import TxSuccess from "@/components/TxSuccess";

const AVATAR_COLORS = [
  "from-primary/30 to-emerald-500/20",
  "from-blue-500/30 to-primary/20",
  "from-purple-500/30 to-pink-500/20",
  "from-orange-500/30 to-red-500/20",
  "from-cyan-500/30 to-blue-500/20",
];

type ModalStep = "closed" | "connect" | "confirm" | "pending" | "success" | "error";

const CreatorCard = ({ creator }: { creator: Creator }) => {
  const initials = creator.name.slice(0, 2).toUpperCase();
  const colorIdx = parseInt(creator.id) % AVATAR_COLORS.length;
  const { isConnected, state, subscribe, reset } = useWalletAction();
  const [modal, setModal] = useState<ModalStep>("closed");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const openSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(isConnected ? "confirm" : "connect");
  };

  const confirmSubscribe = async () => {
    setModal("pending");
    const hash = await subscribe(creator.subscriptionPrice);
    if (hash) { setTxHash(hash); setSubscribed(true); setModal("success"); }
    else setModal("error");
  };

  const closeModal = () => { setModal("closed"); reset(); setTxHash(null); };

  return (
    <>
      <Link to={`/creators/${creator.id}`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-all duration-300"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center font-display font-bold text-sm shrink-0 border border-white/10`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm">{creator.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{creator.bio}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="w-3 h-3" />{creator.subscribers.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Package className="w-3 h-3" />{creator.drops} drops
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {subscribed ? (
              <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                <CheckCircle2 className="w-3 h-3" /> Subscribed
              </span>
            ) : (
              <button
                onClick={openSubscribe}
                className="text-[10px] font-bold text-primary border border-primary/30 rounded-lg px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {creator.subscriptionPrice}
              </button>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </motion.div>
      </Link>

      <Dialog open={modal !== "closed"} onOpenChange={closeModal}>
        <DialogContent className="bg-card border-white/8 sm:max-w-sm rounded-3xl">
          <AnimatePresence mode="wait">

            {modal === "connect" && (
              <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConnectPrompt action={`subscribe to ${creator.name}`} />
              </motion.div>
            )}

            {modal === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="font-display text-lg font-bold mb-1">Subscribe to {creator.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Mint a Subscription NFT for exclusive drop access.</p>
                <div className="rounded-2xl bg-secondary/50 border border-white/5 divide-y divide-white/5 mb-4">
                  {[
                    { label: "Creator", value: creator.name },
                    { label: "Price", value: creator.subscriptionPrice, highlight: true },
                    { label: "You receive", value: "Subscription NFT" },
                    { label: "Network", value: "Base" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex justify-between px-4 py-2.5 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-semibold ${highlight ? "text-primary" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1 rounded-xl" onClick={confirmSubscribe}>Subscribe</Button>
                </div>
              </motion.div>
            )}

            {modal === "pending" && (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <Users className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1">Subscribing…</h3>
                <p className="text-sm text-muted-foreground">Confirm in your wallet</p>
              </motion.div>
            )}

            {modal === "success" && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TxSuccess
                  title={`Subscribed! 🎉`}
                  description={`You're now subscribed to ${creator.name} and get exclusive drop access.`}
                  txHash={txHash}
                  onDone={closeModal}
                />
              </motion.div>
            )}

            {modal === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">{state.error || "Something went wrong."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={() => { reset(); setModal("confirm"); }}>Retry</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatorCard;
