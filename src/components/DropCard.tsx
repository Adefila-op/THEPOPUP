import { motion } from "framer-motion";
import { Clock, Users, Zap, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Drop } from "@/lib/mockData";
import { useShareUrl } from "@/hooks/useMiniKit";

const DropCard = ({ drop }: { drop: Drop }) => {
  const progress = (drop.claimed / drop.supply) * 100;
  const { shareUrl, isInMiniApp } = useShareUrl();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://the-popup.vercel.app/drops/${drop.id}`;
    const text = `🔥 ${drop.title} by ${drop.creator} — ${drop.priceSubscriber} for subscribers. Only ${drop.supply - drop.claimed} left!`;
    if (isInMiniApp) {
      shareUrl(url, text);
    } else if (navigator.share) {
      navigator.share({ title: drop.title, text, url });
    }
  };

  return (
    <Link to={`/drops/${drop.id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.25 }}
        className="group rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(75_100%_50%/0.1)]"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={drop.image}
            alt={drop.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
            {drop.subscriberOnly && (
              <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider border-none">
                Sub Only
              </Badge>
            )}
            {drop.hasCampaign && (
              <Badge className="bg-warning/20 text-warning text-[10px] uppercase tracking-wider border border-warning/30">
                <Zap className="w-3 h-3" /> Campaign
              </Badge>
            )}
          </div>

          {/* Timer + Share */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {drop.endsIn}
            </div>
            {(isInMiniApp || !!navigator.share) && (
              <button
                onClick={handleShare}
                className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Share2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-display font-bold text-sm text-foreground leading-tight">{drop.title}</h3>
            <p className="text-xs text-muted-foreground">by {drop.creator}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Sub price</span>
            <span className="font-semibold text-primary">{drop.priceSubscriber}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {drop.claimed}/{drop.supply}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default DropCard;
