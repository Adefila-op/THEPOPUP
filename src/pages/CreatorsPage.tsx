import { useState, useMemo, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import CreatorCard from "@/components/CreatorCard";
import FeaturedCreator from "@/components/FeaturedCreator";
import { mockCreators, type Creator } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi";

const ARTIST_REGISTRY_ABI = [
  {
    inputs: [],
    name: "getAllArtists",
    outputs: [
      {
        components: [
          { internalType: "address", name: "artistAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "bio", type: "string" },
          { internalType: "string", name: "subscriptionPrice", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct ArtistRegistry.Artist[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const CreatorsPage = () => {
  const [query, setQuery] = useState("");
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch artists from contract or localStorage
  const fetchArtists = useCallback(async () => {
    try {
      const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;

      // Try to fetch from contract if registry is configured
      if (registryAddress && registryAddress.startsWith("0x")) {
        try {
          const result = await readContract(wagmiConfig, {
            address: registryAddress as `0x${string}`,
            abi: ARTIST_REGISTRY_ABI,
            functionName: "getAllArtists",
          } as any);

          if (result && Array.isArray(result)) {
            const contractArtists: Creator[] = result.map((artist: any, idx) => ({
              id: String(idx),
              address: artist.artistAddress,
              name: artist.name,
              avatar: "",
              bio: artist.bio,
              subscriptionPrice: artist.subscriptionPrice,
            }));
            setCreators(contractArtists);
            return;
          }
        } catch (err) {
          console.log("Contract not ready yet, falling back to localStorage");
        }
      }

      // Fallback: Load from localStorage
      const customArtists = localStorage.getItem("popup:artists");
      if (customArtists) {
        const parsed = JSON.parse(customArtists) as Creator[];
        setCreators(parsed);
      } else {
        setCreators(mockCreators);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load artists on mount and set up polling
  useEffect(() => {
    fetchArtists();

    // Poll for updates every 3 seconds to catch real-time changes
    const interval = setInterval(fetchArtists, 3000);

    return () => clearInterval(interval);
  }, [fetchArtists]);

  const { featured, filtered } = useMemo(() => {
    const newOnes = creators.filter((c) => c.isNew);
    let regular = creators.filter((c) => !c.isNew);

    if (query.trim()) {
      const q = query.toLowerCase();
      const allFiltered = creators.filter(
        (c) => c.name.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q)
      );
      return { featured: [], filtered: allFiltered };
    }

    return { featured: newOnes, filtered: regular };
  }, [query, creators]);

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl font-extrabold mb-1">Creators</h1>
          <p className="text-muted-foreground text-sm mb-4">Subscribe for exclusive drops & early access</p>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search creators..."
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

          {/* Featured new creators */}
          {featured.map((creator) => (
            <FeaturedCreator key={creator.id} creator={creator} />
          ))}

          {/* All creators grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No creators match "{query}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((creator, i) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <CreatorCard creator={creator} />
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mockCreators.length} creators on The POP Up
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default CreatorsPage;
