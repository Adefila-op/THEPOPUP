import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Zap, Users, Clock, Trophy, ArrowRight, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { mockDrops, mockCreators } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { useShareUrl } from "@/hooks/useMiniKit";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Build campaign data from mock drops that have campaigns
const mockCampaigns = mockDrops
  .filter((d) => d.hasCampaign)
  .map((drop) => {
    const creator = mockCreators.find((c) => c.id === drop.creatorId);
    return {
      id: drop.id,
      dropId: drop.id,
      title: `${drop.title} Campaign`,
      description: `Promote this drop and earn an Allocation NFT with discounted resale rights. Submit content featuring ${drop.title} to enter the raffle.`,
      creator: creator?.name || drop.creator,
      creatorId: drop.creatorId,
      image: drop.image,
      reward: "Allocation NFT + POAP",
      entries: Math.floor(Math.random() * 200) + 50,
      maxEntries: 500,
      endsIn: drop.endsIn,
      prize: drop.priceSubscriber,
      type: Math.random() > 0.5 ? "content" : "referral" as "content" | "referral",
    };
  });

type CampaignEntry = {
  id: string;
  entered: boolean;
  content: string;
};

const CampaignsPage = () => {
  const { shareUrl, isInMiniApp } = useShareUrl();
  const [entries, setEntries] = useState<Record<string, CampaignEntry>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const openModal = (id: string) => {
    setActiveModal(id);
    setContent("");
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!activeModal) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setEntries((prev) => ({ ...prev, [activeModal]: { id: activeModal, entered: true, content } }));
    setSubmitting(false);
    setSuccess(true);
  };

  const handleShare = (campaign: typeof mockCampaigns[0]) => {
    const url = `https://the-popup.vercel.app/drops/${campaign.dropId}`;
    const text = `🏆 Entering the ${campaign.title} campaign on The POP Up! Win an Allocation NFT. Join me →`;
    if (isInMiniApp) shareUrl(url, text);
    else if (navigator.share) navigator.share({ title: campaign.title, text, url });
  };

  const activeCampaign = mockCampaigns.find((c) => c.id === activeModal);

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl font-extrabold mb-1">Campaigns</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Promote drops, earn Allocation NFTs through raffle
          </p>

          {/* How it works strip */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {[
              { icon: Share2, label: "Submit Content" },
              { icon: Trophy, label: "Enter Raffle" },
              { icon: CheckCircle2, label: "Win NFT" },
            ].map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/50 text-xs text-muted-foreground"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {i > 0 && <ArrowRight className="w-3 h-3 text-border" />}
                {label}
              </div>
            ))}
          </div>

          {/* Campaign cards */}
          <div className="flex flex-col gap-4">
            {mockCampaigns.map((campaign, i) => {
              const hasEntered = entries[campaign.id]?.entered;
              const progress = (campaign.entries / campaign.maxEntries) * 100;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl bg-card border border-border/50 overflow-hidden"
                >
                  {/* Cover image */}
                  <div className="relative h-36 overflow-hidden">
                    <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-warning/20 text-warning border border-warning/30 text-[10px] uppercase tracking-wider">
                        <Zap className="w-3 h-3" /> Active
                      </Badge>
                      <Badge className="bg-secondary text-muted-foreground border-border/50 text-[10px] uppercase tracking-wider">
                        {campaign.type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-display font-bold text-base leading-tight">{campaign.title}</h3>
                      <p className="text-xs text-muted-foreground">by {campaign.creator}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{campaign.description}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{campaign.entries} entries</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{campaign.endsIn} left</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-primary" />{campaign.reward}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{campaign.entries}/{campaign.maxEntries} spots filled</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {hasEntered ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Entered — Good luck!
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => openModal(campaign.id)}
                        >
                          <Zap className="w-3.5 h-3.5" /> Enter Campaign
                        </Button>
                      )}
                      {(isInMiniApp || !!navigator.share) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 text-xs"
                          onClick={() => handleShare(campaign)}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Link to={`/drops/${campaign.dropId}`}>
                        <Button variant="ghost" size="sm" className="px-3 text-xs">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Entry Modal */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          {!success ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Enter Campaign</DialogTitle>
                <DialogDescription>{activeCampaign?.title}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    {activeCampaign?.type === "content"
                      ? "Your content link or description"
                      : "Your referral or post link"}
                  </Label>
                  <Textarea
                    className="mt-2 bg-background min-h-[90px]"
                    placeholder={
                      activeCampaign?.type === "content"
                        ? "Paste a link to your post, photo, or video featuring this drop..."
                        : "Paste a link to your referral post or share..."
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                  🏆 Winner receives: <span className="text-primary font-semibold">{activeCampaign?.reward}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting}
                  >
                    {submitting ? "Submitting…" : "Submit Entry"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Entry Submitted! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You're in the raffle for <span className="text-foreground font-semibold">{activeCampaign?.title}</span>. Winners are announced when the drop ends.
              </p>
              <Button variant="hero" className="w-full" onClick={() => setActiveModal(null)}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CampaignsPage;
