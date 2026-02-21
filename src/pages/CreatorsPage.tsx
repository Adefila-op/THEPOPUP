import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import CreatorCard from "@/components/CreatorCard";
import FeaturedCreator from "@/components/FeaturedCreator";
import { mockCreators } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const CreatorsPage = () => {
  const [query, setQuery] = useState("");

  const { featured, filtered } = useMemo(() => {
    const newOnes = mockCreators.filter((c) => c.isNew);
    let regular = mockCreators.filter((c) => !c.isNew);

    if (query.trim()) {
      const q = query.toLowerCase();
      const allFiltered = mockCreators.filter(
        (c) => c.name.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q)
      );
      return { featured: [], filtered: allFiltered };
    }

    return { featured: newOnes, filtered: regular };
  }, [query]);

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
