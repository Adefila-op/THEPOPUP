import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Store } from "lucide-react";

const MarketplacePage = () => (
  <Layout>
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-2">Marketplace</h1>
        <p className="text-muted-foreground mb-10">Buy and sell ownership NFTs with built-in royalties</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-2xl bg-card border border-border/50 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Marketplace Launching Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            List and trade ownership NFTs. Royalties are automatically distributed to creators and the platform.
          </p>
        </motion.div>
      </div>
    </section>
  </Layout>
);

export default MarketplacePage;
