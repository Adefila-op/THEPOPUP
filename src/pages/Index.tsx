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
                url="https://the-popup.vercel.app"
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



      {/* Co-Create Banner */}
      <section className="py-20 border-t border-border/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" />
              Collaborate & Earn
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4">
              Co-Create Limited Drops
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Physical artists + Digital creators = Limited-edition magic. Collaborate on exclusive drops, lock royalties forever, and mint co-signed NFTs on Base.
            </p>
            <Link to="/cocreate">
              <Button variant="hero" size="xl">
                Start a Collaboration <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <span className="text-muted-foreground">Physical Artists</span>
              </div>
              <div className="text-muted-foreground">+</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💻</span>
                <span className="text-muted-foreground">Digital Creators</span>
              </div>
              <div className="text-muted-foreground">=</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌟</span>
                <span className="text-muted-foreground">Co-Signed Drops</span>
              </div>
            </div>
          </motion.div>
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
