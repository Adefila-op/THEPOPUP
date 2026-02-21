import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/Layout";
import DropCard from "@/components/DropCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCreators, mockDrops } from "@/lib/mockData";
import { Users, Package, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

type SubModal = "closed" | "connect" | "confirm" | "pending" | "success" | "error";

const CreatorProfilePage = () => {
  const { id } = useParams();
  const creator = mockCreators.find((c) => c.id === id) || mockCreators[0];
  const creatorDrops = mockDrops.filter((d) => d.creatorId === creator.id);
  const initials = creator.name.slice(0, 2).toUpperCase();
  const colorIdx = parseInt(creator.id || "0") % AVATAR_COLORS.length;

  const { isConnected, state, subscribe, reset } = useWalletAction();
  const [modal, setModal] = useState<SubModal>("closed");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const openSubscribe = () => {
    if (!isConnected) { setModal("connect"); return; }
    setModal("confirm");
  };

  const confirmSubscribe = async () => {
    setModal("pending");
    const hash = await subscribe(creator.subscriptionPrice);
    if (hash) {
      setTxHash(hash);
      setSubscribed(true);
      setModal("success");
    } else {
      setModal("error");
    }
  };

  const closeModal = () => { setModal("closed"); reset(); setTxHash(null); };

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4">

          <Link to="/creators" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="w-4 h-4" /> Creators
          </Link>

          {/* Creator hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden bg-card border border-white/5 mb-6 p-5"
          >
            {/* Gradient backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} opacity-20`} />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="relative flex items-start gap-4">
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center font-display font-bold text-xl text-foreground shrink-0 border border-white/10`}>
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-display text-xl font-extrabold">{creator.name}</h1>
                  {creator.isNew && (
                    <Badge className="bg-primary text-primary-foreground border-none text-[9px] uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" /> New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{creator.bio}</p>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{creator.subscribers.toLocaleString()} subs</span>
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{creator.drops} drops</span>
                </div>

                {subscribed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Subscribed
                  </div>
                ) : (
                  <Button variant="neon" size="sm" className="rounded-xl text-xs" onClick={openSubscribe}>
                    Subscribe · {creator.subscriptionPrice}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Drops */}
          <h2 className="font-display text-base font-extrabold mb-3">
            {creatorDrops.length > 0 ? "Available Drops" : "No Drops Yet"}
          </h2>

          {creatorDrops.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {creatorDrops.map((drop, i) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <DropCard drop={drop} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 rounded-2xl bg-card border border-white/5">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No drops yet. Subscribe to get notified!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Subscribe Dialog ─────────────────────────────────── */}
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
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-display text-xl">Subscribe to {creator.name}</DialogTitle>
                  <DialogDescription>Mint a subscription NFT to get exclusive access and discounted drops.</DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl bg-secondary/50 border border-white/5 divide-y divide-white/5 mb-5">
                  {[
                    { label: "Creator", value: creator.name },
                    { label: "Price", value: creator.subscriptionPrice, highlight: true },
                    { label: "You receive", value: "Subscription NFT" },
                    { label: "Benefit", value: `${Math.round((1 - 0.02 / 0.04) * 100)}% off drops` },
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
                  <Button variant="hero" className="flex-1 rounded-xl" onClick={confirmSubscribe}>
                    Subscribe Now
                  </Button>
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
                  title={`Subscribed to ${creator.name}! 🎉`}
                  description="Your Subscription NFT is live on Base. You now get exclusive drop access and discounted prices."
                  txHash={txHash}
                  onDone={closeModal}
                  doneLabel="Start Exploring Drops"
                />
              </motion.div>
            )}

            {modal === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Transaction Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">{state.error || "Something went wrong. Please try again."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={() => { reset(); setModal("confirm"); }}>Retry</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CreatorProfilePage;
