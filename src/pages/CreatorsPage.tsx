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

          {/* Co-Create CTA */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg mb-2">💡 Want to collaborate?</h3>
                <p className="text-sm text-muted-foreground">Physical artists can partner with digital creators to make limited-edition drops</p>
              </div>
              <a href="/cocreate" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap ml-4">
                Co-Create
              </a>
            </div>
          </div>

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
