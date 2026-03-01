import { useState, useMemo, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import DropCard from "@/components/DropCard";
import { mockDrops, mockCreators, type Drop } from "@/lib/mockData";
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
  const [drops, setDrops] = useState<Drop[]>(mockDrops);

  // Fetch drops from blockchain with polling for real-time updates
  const fetchDrops = useCallback(async () => {
    let artistsData = mockCreators;
    const artistRegistryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;
    const dropRegistryAddress = import.meta.env.VITE_DROP_REGISTRY_ADDRESS;

    // First fetch artists to map addresses to names
    if (artistRegistryAddress && artistRegistryAddress.startsWith("0x")) {
      try {
        const { readContract } = await import("wagmi/actions");
        const { wagmiConfig } = await import("@/lib/wagmi");

        const result = await readContract(wagmiConfig, {
          address: artistRegistryAddress as `0x${string}`,
          abi: [
            {
              inputs: [],
              name: "getAllArtists",
              outputs: [
                {
                  components: [
                    { internalType: "address", name: "artistAddress", type: "address" },
                    { internalType: "string", name: "name", type: "string" },
                  ],
                  internalType: "struct ArtistRegistry.Artist[]",
                  name: "",
                  type: "tuple[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "getAllArtists",
        } as any);

        if (result && Array.isArray(result)) {
          artistsData = result.map((a: any, idx) => ({
            id: String(idx),
            address: a.artistAddress,
            name: a.name,
            avatar: "",
            bio: "",
            subscriptionPrice: "",
          }));
        }
      } catch (e) {
        const localArtists = localStorage.getItem("popup:artists");
        if (localArtists) artistsData = JSON.parse(localArtists);
      }
    } else {
      const localArtists = localStorage.getItem("popup:artists");
      if (localArtists) artistsData = JSON.parse(localArtists);
    }

    // Now fetch drops
    if (dropRegistryAddress && dropRegistryAddress.startsWith("0x")) {
      try {
        const { readContract } = await import("wagmi/actions");
        const { wagmiConfig } = await import("@/lib/wagmi");
        const { dropRegistryAbi } = await import("@/lib/contracts");
        const { formatEther } = await import("viem");
        const { getIPFSUrl } = await import("@/lib/pinata");

        const result = await readContract(wagmiConfig, {
          address: dropRegistryAddress as `0x${string}`,
          abi: dropRegistryAbi,
          functionName: "getAllDrops",
        } as any);

        if (result && Array.isArray(result)) {
          const activeDrops = result.filter((d: any) => d.active).map((drop: any) => {
            const foundArtist = artistsData.find(a => a.address.toLowerCase() === drop.artist.toLowerCase());
            return {
              id: String(drop.dropId),
              title: drop.title,
              creator: foundArtist ? foundArtist.name : drop.artist.slice(0, 6) + "...",
              creatorId: foundArtist ? foundArtist.id : drop.artist,
              creatorAvatar: "",
              image: drop.imageHash ? getIPFSUrl(drop.imageHash) : "",
              priceSubscriber: formatEther(drop.priceSubscriber) + " ETH",
              pricePublic: formatEther(drop.pricePublic) + " ETH",
              supply: Number(drop.supply),
              claimed: Number(drop.claimed),
              subscriberOnly: false,
              endsIn: "30d",
              hasCampaign: false,
              endTime: Number(drop.endTime),
            };
          });
          setDrops(activeDrops.length > 0 ? activeDrops : mockDrops);
          return;
        }
      } catch (e) {
        console.warn("Failed to fetch drops from contract, falling back:", e);
      }
    }

    // Fallback
    const customDrops = localStorage.getItem("popup:drops");
    if (customDrops) {
      try {
        setDrops(JSON.parse(customDrops) as Drop[]);
      } catch {
        setDrops(mockDrops);
      }
    } else {
      setDrops(mockDrops);
    }
  }, []);

  // Load drops on mount and set up polling for real-time updates
  useEffect(() => {
    fetchDrops();

    // Poll for updates every 2 seconds to catch real-time changes
    const interval = setInterval(fetchDrops, 2000);

    return () => clearInterval(interval);
  }, [fetchDrops]);

  const filtered = useMemo(() => {
    let dropsData = [...drops];

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      dropsData = dropsData.filter(
        (d) => d.title.toLowerCase().includes(q) || d.creator.toLowerCase().includes(q)
      );
    }

    // Filter
    if (activeFilter === "campaign") dropsData = dropsData.filter((d) => d.hasCampaign);
    if (activeFilter === "ending") dropsData = dropsData.filter((d) => d.endsIn.includes("h") || d.endsIn.startsWith("1d"));

    // Sort
    if (sortBy === "price-asc") {
      dropsData.sort((a, b) => parseFloat(a.priceSubscriber) - parseFloat(b.priceSubscriber));
    } else if (sortBy === "price-desc") {
      dropsData.sort((a, b) => parseFloat(b.priceSubscriber) - parseFloat(a.priceSubscriber));
    } else if (sortBy === "progress") {
      dropsData.sort((a, b) => (b.claimed / b.supply) - (a.claimed / a.supply));
    }

    return dropsData;
  }, [query, activeFilter, sortBy, drops]);

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
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${activeFilter === f.value
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
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${sortBy === s.value ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
