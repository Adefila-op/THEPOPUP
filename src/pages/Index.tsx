import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import ShareButton from "@/components/ShareButton";
import DropCard from "@/components/DropCard";
import CreatorCard from "@/components/CreatorCard";
import Layout from "@/components/Layout";
import { mockDrops, mockCreators } from "@/lib/mockData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[60vh] md:min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="container relative mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div custom={0} variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                Live on Base
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-display text-3xl md:text-7xl lg:text-8xl font-extrabold leading-[0.9] tracking-tight"
            >
              Physical Art.
              <br />
              <span className="gradient-text">Onchain Ownership.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-4 md:mt-6 text-sm md:text-xl text-muted-foreground max-w-lg leading-relaxed"
            >
              Subscribe to your favorite creators. Access exclusive drops. Earn resale rights through campaigns. All tokenized on Base.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Link to="/drops">
                <Button variant="hero" size="xl">
                  Explore Drops <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/creators">
                <Button variant="glass" size="xl">
                  Browse Creators
                </Button>
              </Link>
              <ShareButton
                text="Physical Art. Onchain Ownership. Check out The POP Up on Base 🔥"
                url="https://drop-and-claim.lovable.app"
                label="Share"
                className="text-primary border-primary/20"
              />
            </motion.div>

            <motion.div custom={4} variants={fadeUp} className="mt-12 flex items-center gap-8">
              {[
                { label: "Creators", value: "120+" },
                { label: "Drops Minted", value: "4.2K" },
                { label: "On Base", value: "100%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Drops */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">
                Featured Drops
              </h2>
              <p className="text-muted-foreground mt-2">Limited physical art with onchain proof</p>
            </div>
            <Link to="/drops">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {mockDrops.map((drop, i) => (
              <motion.div
                key={drop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <DropCard drop={drop} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Subscribe",
                desc: "Mint a subscription NFT to unlock early access, discounted pricing, and loyalty rewards.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Collect",
                desc: "Claim physical art drops. Each purchase mints an ownership NFT with IPFS metadata.",
              },
              {
                icon: <Repeat className="w-6 h-6" />,
                title: "Earn & Resell",
                desc: "Join campaigns to earn allocation NFTs. Resell with built-in royalties for creators.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-8 rounded-xl bg-card border border-border/50"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Creators */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold">Top Creators</h2>
              <p className="text-muted-foreground mt-2">Subscribe and get exclusive access</p>
            </div>
            <Link to="/creators">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCreators.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <CreatorCard creator={creator} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-6">
              Ready to <span className="gradient-text">drop</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're a creator launching physical art or a collector hunting grails — Swagclub is your home.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="hero" size="xl">
                Launch as Creator
              </Button>
              <Link to="/drops">
                <Button variant="neon" size="xl">
                  Start Collecting
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
