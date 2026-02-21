import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import DropCard from "@/components/DropCard";
import { mockDrops } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Filter = "all" | "subscriber" | "campaign" | "ending";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Sub Only", value: "subscriber" },
  { label: "Campaign", value: "campaign" },
  { label: "Ending Soon", value: "ending" },
];

type SortOption = "default" | "price-asc" | "price-desc" | "progress";

const DropsPage = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let drops = [...mockDrops];

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      drops = drops.filter(
        (d) => d.title.toLowerCase().includes(q) || d.creator.toLowerCase().includes(q)
      );
    }

    // Filter
    if (activeFilter === "subscriber") drops = drops.filter((d) => d.subscriberOnly);
    if (activeFilter === "campaign") drops = drops.filter((d) => d.hasCampaign);
    if (activeFilter === "ending") drops = drops.filter((d) => d.endsIn.includes("h") || d.endsIn.startsWith("1d"));

    // Sort
    if (sortBy === "price-asc") {
      drops.sort((a, b) => parseFloat(a.priceSubscriber) - parseFloat(b.priceSubscriber));
    } else if (sortBy === "price-desc") {
      drops.sort((a, b) => parseFloat(b.priceSubscriber) - parseFloat(a.priceSubscriber));
    } else if (sortBy === "progress") {
      drops.sort((a, b) => (b.claimed / b.supply) - (a.claimed / a.supply));
    }

    return drops;
  }, [query, activeFilter, sortBy]);

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl font-extrabold mb-1">Drops</h1>
          <p className="text-muted-foreground text-sm mb-4">Limited physical art with onchain proof</p>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drops or creators..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter chips + sort */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex gap-1.5 flex-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeFilter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSort(!showSort)}
                className="p-2 rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-10 z-50 w-44 rounded-xl bg-card border border-border/50 shadow-xl overflow-hidden">
                    {[
                      { label: "Default", value: "default" },
                      { label: "Price: Low → High", value: "price-asc" },
                      { label: "Price: High → Low", value: "price-desc" },
                      { label: "Most Claimed", value: "progress" },
                    ].map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setSortBy(s.value as SortOption); setShowSort(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          sortBy === s.value ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">No drops match your search.</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setQuery(""); setActiveFilter("all"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((drop, i) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DropCard drop={drop} />
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            {filtered.length} drop{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default DropsPage;
