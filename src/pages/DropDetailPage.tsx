import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockDrops } from "@/lib/mockData";
import {
  Clock, Users, Zap, Shield, ArrowLeft, Coins, FileText,
  CheckCircle2, Award, Loader2, XCircle, Share2, AlertCircle,
} from "lucide-react";
import ARProductView from "@/components/ARProductView";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useWalletAction } from "@/hooks/useWalletAction";
import ConnectPrompt from "@/components/ConnectPrompt";
import TxSuccess from "@/components/TxSuccess";
import { useShareUrl } from "@/hooks/useMiniKit";

// ─── Types ───────────────────────────────────────────────────
type SubModal = "closed" | "connect" | "verify" | "not-subscribed" | "confirm" | "pending" | "success" | "error";
type PubModal = "closed" | "connect" | "choose" | "form" | "pending" | "success" | "error";

const DropDetailPage = () => {
  const { id } = useParams();
  const drop = mockDrops.find((d) => d.id === id) || mockDrops[0];
  const progress = (drop.claimed / drop.supply) * 100;

  const { isConnected, state, claimAsSubscriber, confirmSubscriberMint, claimPublic, reset } = useWalletAction();
  const { shareUrl, isInMiniApp } = useShareUrl();

  // Sub flow
  const [subModal, setSubModal] = useState<SubModal>("closed");
  const [isSubscriber] = useState(true); // TODO: check on-chain

  // Pub flow
  const [pubModal, setPubModal] = useState<PubModal>("closed");
  const [claimMethod, setClaimMethod] = useState<"funds" | "content">("funds");
  const [bidAmount, setBidAmount] = useState("");
  const [contentText, setContentText] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  // ── Subscriber flow handlers ────────────────────────────────
  const openSubFlow = () => {
    if (!isConnected) { setSubModal("connect"); return; }
    setSubModal("verify");
    setTimeout(() => setSubModal(isSubscriber ? "confirm" : "not-subscribed"), 1400);
  };

  const confirmSubMint = async () => {
    setSubModal("pending");
    const hash = await confirmSubscriberMint(drop.priceSubscriber);
    if (hash) { setTxHash(hash); setSubModal("success"); }
    else setSubModal("error");
  };

  const closeSubModal = () => { setSubModal("closed"); reset(); setTxHash(null); };

  // ── Public flow handlers ────────────────────────────────────
  const openPubFlow = () => {
    if (!isConnected) { setPubModal("connect"); return; }
    setPubModal("choose");
  };

  const submitPub = async () => {
    setPubModal("pending");
    const price = claimMethod === "funds" ? (bidAmount || drop.pricePublic) : "0";
    const hash = await claimPublic(price);
    if (hash) { setTxHash(hash); setPubModal("success"); }
    else setPubModal("error");
  };

  const closePubModal = () => { setPubModal("closed"); reset(); setTxHash(null); setBidAmount(""); setContentText(""); };

  const handleShare = () => {
    const url = `https://the-popup.vercel.app/drops/${drop.id}`;
    const text = `🔥 ${drop.title} by ${drop.creator} — ${drop.priceSubscriber} for subscribers. ${drop.supply - drop.claimed} left!`;
    if (isInMiniApp) shareUrl(url, text);
    else if (navigator.share) navigator.share({ title: drop.title, text, url });
  };

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4">

          {/* Back + share */}
          <div className="flex items-center justify-between mb-5">
            <Link to="/drops" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Drops
            </Link>
            {(isInMiniApp || !!navigator.share) && (
              <button onClick={handleShare} className="p-2 rounded-xl bg-card border border-white/5 text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AR view */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <ARProductView image={drop.image} title={drop.title} />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Badges */}
            <div className="flex gap-2 mb-3">
              {drop.subscriberOnly && (
                <Badge className="bg-primary/90 text-primary-foreground border-none text-[10px] uppercase tracking-widest">Sub Only</Badge>
              )}
              {drop.hasCampaign && (
                <Badge className="bg-warning/20 text-warning border border-warning/30 text-[10px] uppercase tracking-widest">
                  <Zap className="w-3 h-3" /> Campaign
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-extrabold mb-1">{drop.title}</h1>
            <p className="text-sm text-muted-foreground mb-5">
              by <span className="text-foreground font-semibold">{drop.creator}</span>
            </p>

            {/* Price grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-primary/8 border border-primary/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Subscriber</p>
                <p className="text-lg font-display font-extrabold text-primary">{drop.priceSubscriber}</p>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Public</p>
                <p className="text-lg font-display font-extrabold">{drop.pricePublic}</p>
              </div>
            </div>

            {/* Supply bar */}
            <div className="mb-5 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{drop.claimed}/{drop.supply} claimed</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{drop.endsIn} left</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{drop.supply - drop.claimed} remaining</p>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-2 mb-4">
              <Button variant="hero" className="flex-1 rounded-xl" onClick={openSubFlow}>
                <Shield className="w-4 h-4" /> Subscriber Claim
              </Button>
              <Button variant="neon" className="flex-1 rounded-xl" onClick={openPubFlow}>
                Public Claim
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Minting creates an ERC-721 on Base · Metadata on IPFS
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SUBSCRIBER CLAIM DIALOG
      ══════════════════════════════════════════════════════════ */}
      <Dialog open={subModal !== "closed"} onOpenChange={closeSubModal}>
        <DialogContent className="bg-card border-white/8 sm:max-w-sm rounded-3xl">
          <AnimatePresence mode="wait">

            {/* Connect gate */}
            {subModal === "connect" && (
              <motion.div key="sub-connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConnectPrompt action="claim as a subscriber" />
              </motion.div>
            )}

            {/* Verifying */}
            {subModal === "verify" && (
              <motion.div key="sub-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="font-display text-lg font-bold mb-1">Verifying</h3>
                <p className="text-sm text-muted-foreground">Checking your Subscription NFT on Base…</p>
              </motion.div>
            )}

            {/* Not subscribed */}
            {subModal === "not-subscribed" && (
              <motion.div key="sub-nosub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Not Subscribed</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Subscribe to <span className="text-foreground font-semibold">{drop.creator}</span> to unlock the discounted price.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeSubModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" asChild onClick={closeSubModal}>
                    <Link to={`/creators/${drop.creatorId}`}>Subscribe Now</Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Confirm */}
            {subModal === "confirm" && (
              <motion.div key="sub-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-display text-xl">Confirm Mint</DialogTitle>
                  <DialogDescription>Your subscription to {drop.creator} is verified.</DialogDescription>
                </DialogHeader>

                <div className="p-3 rounded-2xl bg-primary/8 border border-primary/20 flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-primary">Subscriber price unlocked</span>
                </div>

                <div className="rounded-2xl bg-secondary/50 border border-white/5 divide-y divide-white/5 mb-5">
                  {[
                    { label: "Drop", value: drop.title },
                    { label: "Price", value: drop.priceSubscriber, highlight: true },
                    { label: "You receive", value: "Ownership NFT + POAP" },
                    { label: "Network", value: "Base" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex justify-between px-4 py-2.5 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-semibold ${highlight ? "text-primary" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeSubModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={confirmSubMint}>
                    <Shield className="w-4 h-4" /> Mint Now
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Pending */}
            {subModal === "pending" && (
              <motion.div key="sub-pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <Shield className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1">Minting…</h3>
                <p className="text-sm text-muted-foreground">Confirm the transaction in your wallet</p>
              </motion.div>
            )}

            {/* Success */}
            {subModal === "success" && (
              <motion.div key="sub-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TxSuccess
                  title="NFT Minted! 🎉"
                  description={`You now own ${drop.title}. Your ownership NFT is live on Base.`}
                  txHash={txHash}
                  onDone={closeSubModal}
                />
              </motion.div>
            )}

            {/* Error */}
            {subModal === "error" && (
              <motion.div key="sub-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Transaction Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">{state.error || "Something went wrong. Please try again."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeSubModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={() => { reset(); setSubModal("confirm"); }}>Retry</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════
          PUBLIC CLAIM DIALOG
      ══════════════════════════════════════════════════════════ */}
      <Dialog open={pubModal !== "closed"} onOpenChange={closePubModal}>
        <DialogContent className="bg-card border-white/8 sm:max-w-sm rounded-3xl">
          <AnimatePresence mode="wait">

            {/* Connect gate */}
            {pubModal === "connect" && (
              <motion.div key="pub-connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConnectPrompt action="claim this drop" />
              </motion.div>
            )}

            {/* Choose method */}
            {pubModal === "choose" && (
              <motion.div key="pub-choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-display text-xl">Public Claim</DialogTitle>
                  <DialogDescription>Choose how you want to claim.</DialogDescription>
                </DialogHeader>

                <RadioGroup value={claimMethod} onValueChange={(v) => setClaimMethod(v as "funds" | "content")} className="gap-3">
                  {[
                    {
                      value: "funds",
                      icon: Coins,
                      title: "Bid with Funds",
                      desc: `Place a bid at ${drop.pricePublic} to claim directly`,
                    },
                    {
                      value: "content",
                      icon: FileText,
                      title: "Submit Content",
                      desc: "Submit promotional content to enter the campaign raffle",
                    },
                  ].map(({ value, icon: Icon, title, desc }) => (
                    <label
                      key={value}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        claimMethod === value ? "border-primary bg-primary/8" : "border-white/8 hover:border-white/15"
                      }`}
                    >
                      <RadioGroupItem value={value} className="mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold mb-0.5">
                          <Icon className="w-3.5 h-3.5 text-primary" /> {title}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                <Button variant="hero" className="w-full mt-4 rounded-xl" onClick={() => setPubModal("form")}>
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Form */}
            {pubModal === "form" && (
              <motion.div key="pub-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-display text-xl">
                    {claimMethod === "funds" ? "Confirm Bid" : "Submit Content"}
                  </DialogTitle>
                  <DialogDescription>
                    {claimMethod === "funds"
                      ? "Review your bid and confirm to mint."
                      : "Submit content to enter the campaign raffle."}
                  </DialogDescription>
                </DialogHeader>

                {claimMethod === "funds" ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Your Bid</Label>
                      <Input
                        className="mt-1.5 bg-background border-white/10 rounded-xl"
                        placeholder={drop.pricePublic}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </div>
                    <div className="rounded-2xl bg-secondary/50 border border-white/5 divide-y divide-white/5">
                      {[
                        { label: "Drop", value: drop.title },
                        { label: "Min Price", value: drop.pricePublic },
                        { label: "You receive", value: "Ownership NFT" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between px-4 py-2.5 text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setPubModal("choose")}>Back</Button>
                      <Button variant="hero" className="flex-1 rounded-xl" onClick={submitPub}>
                        <Coins className="w-4 h-4" /> Confirm & Mint
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Content Link or Description</Label>
                      <Textarea
                        className="mt-1.5 bg-background border-white/10 rounded-xl min-h-[90px]"
                        placeholder="Paste a link to your post, photo, or video featuring this drop…"
                        value={contentText}
                        onChange={(e) => setContentText(e.target.value)}
                      />
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/8 border border-primary/20 text-xs text-muted-foreground">
                      🏆 Winners receive: <span className="text-primary font-semibold">POAP + Allocation NFT</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setPubModal("choose")}>Back</Button>
                      <Button
                        variant="hero"
                        className="flex-1 rounded-xl"
                        onClick={submitPub}
                        disabled={!contentText.trim()}
                      >
                        <FileText className="w-4 h-4" /> Submit Entry
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Pending */}
            {pubModal === "pending" && (
              <motion.div key="pub-pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  {claimMethod === "funds"
                    ? <Coins className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                    : <FileText className="absolute inset-0 m-auto w-6 h-6 text-primary" />}
                </div>
                <h3 className="font-display text-lg font-bold mb-1">
                  {claimMethod === "funds" ? "Processing Bid…" : "Submitting Entry…"}
                </h3>
                <p className="text-sm text-muted-foreground">Confirm the transaction in your wallet</p>
              </motion.div>
            )}

            {/* Success */}
            {pubModal === "success" && (
              <motion.div key="pub-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TxSuccess
                  title={claimMethod === "funds" ? "NFT Minted! 🎉" : "Entry Submitted! 🎉"}
                  description={
                    claimMethod === "funds"
                      ? `You now own ${drop.title}. Your ownership NFT is live on Base.`
                      : `Your content is submitted for ${drop.title}. Winners are picked when the drop ends.`
                  }
                  txHash={txHash}
                  onDone={closePubModal}
                />
              </motion.div>
            )}

            {/* Error */}
            {pubModal === "error" && (
              <motion.div key="pub-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Transaction Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">{state.error || "Something went wrong."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closePubModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={() => { reset(); setPubModal("form"); }}>Retry</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DropDetailPage;
