import { motion } from "framer-motion";
import { Sparkles, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Creator } from "@/lib/mockData";

const FeaturedCreator = ({ creator }: { creator: Creator }) => {
  const initials = creator.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Link to={`/creators/${creator.id}`}>
        <div className="relative p-6 rounded-2xl overflow-hidden neon-border bg-gradient-to-r from-primary/5 via-card to-primary/5">
          {/* Glow background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(75_100%_50%/0.08),transparent_60%)]" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-xl text-primary shrink-0 border-2 border-primary/30">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary text-primary-foreground border-none text-[10px] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> New Creator
                </Badge>
              </div>
              <h3 className="font-display font-bold text-xl">{creator.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{creator.bio}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {creator.subscribers} subscribers
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {creator.drops} drops
                </span>
              </div>
            </div>

            <Button variant="neon" size="sm" className="shrink-0 text-xs">
              Subscribe · {creator.subscriptionPrice}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeaturedCreator;
