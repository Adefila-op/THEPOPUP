import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Package, Users, TrendingUp, Plus, Megaphone, BarChart3, Wallet, Award, Clock, ArrowRight, Copy, CheckCheck } from "lucide-react";
import { mockDrops, mockCreators } from "@/lib/mockData";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount, useBalance } from "wagmi";
import { Link } from "react-router-dom";
import { useState } from "react";

const MY_CREATOR_ID = "1";
const myCreator = mockCreators.find((c) => c.id === MY_CREATOR_ID)!;
const myDrops = mockDrops.filter((d) => d.creatorId === MY_CREATOR_ID);
const mySubscribedCreators = mockCreators.slice(1, 4);
const myCollectedDrops = mockDrops.slice(0, 2);

const totalRevenue = myDrops.reduce((sum, d) => sum + parseFloat(d.priceSubscriber) * d.claimed, 0);

const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const GuestView = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Wallet className="w-8 h-8 text-primary" />
    </div>
    <h2 className="font-display text-xl font-extrabold mb-2">Connect your wallet</h2>
    <p className="text-muted-foreground text-sm mb-2 max-w-xs">
      Connect to see your drops, NFT collection, subscriptions, and creator stats.
    </p>
    <p className="text-xs text-muted-foreground opacity-60">Use the Connect button in the top right →</p>
  </div>
);

const DashboardPage = () => {
  const { context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const farcasterUser = context?.user;
  const displayName = farcasterUser?.displayName || farcasterUser?.username || "Creator";

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) return <Layout><GuestView /></Layout>;

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {farcasterUser?.pfpUrl ? (
                <img src={farcasterUser.pfpUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-primary/20" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <h1 className="font-display text-lg font-extrabold">Hey, {displayName} 👋</h1>
                {address && (
                  <button onClick={copyAddress} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    <span className="font-mono">{short(address)}</span>
                    {copied ? <CheckCheck className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
            <Button variant="hero" size="sm" className="rounded-xl text-[11px]">
              <Plus className="w-3.5 h-3.5" /> New Drop
            </Button>
          </div>

          {/* Wallet balance */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/15 neon-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Balance</p>
                <p className="font-display text-2xl font-extrabold text-primary">
                  {balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Network</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-semibold">Base</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creator stats */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Revenue", value: `${totalRevenue.toFixed(3)} ETH`, icon: TrendingUp, color: "text-primary" },
              { label: "Subscribers", value: myCreator.subscribers.toLocaleString(), icon: Users, color: "text-blue-400" },
              { label: "Active Drops", value: myDrops.length.toString(), icon: Package, color: "text-emerald-400" },
              { label: "Campaigns", value: myDrops.filter((d) => d.hasCampaign).length.toString(), icon: Megaphone, color: "text-warning" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-4 rounded-2xl bg-card border border-white/5"
              >
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <div className="font-display text-xl font-bold">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* My drops */}
          <div className="rounded-2xl bg-card border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-display font-bold text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> My Drops
              </h2>
              <Link to="/drops">
                <Button variant="ghost" size="sm" className="text-[11px] px-2 text-muted-foreground">
                  All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {myDrops.map((drop) => {
                const pct = Math.round((drop.claimed / drop.supply) * 100);
                return (
                  <Link to={`/drops/${drop.id}`} key={drop.id}>
                    <div className="px-4 py-3 flex items-center gap-3 hover:bg-white/3 transition-colors">
                      <img src={drop.image} alt={drop.title} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs truncate">{drop.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">{pct}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {drop.endsIn} · {drop.claimed}/{drop.supply}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-primary">{drop.priceSubscriber}</p>
                        <Badge className={`text-[9px] mt-1 px-1.5 ${drop.subscriberOnly ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-0"}`}>
                          {drop.subscriberOnly ? "Sub" : "Public"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* My collection */}
          <div>
            <h2 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-primary" /> My Collection
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {myCollectedDrops.map((drop) => (
                <Link to={`/drops/${drop.id}`} key={drop.id}>
                  <motion.div whileTap={{ scale: 0.97 }} className="rounded-2xl overflow-hidden bg-card border border-white/5 hover:border-primary/20 transition-all">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={drop.image} alt={drop.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-2">
                        <p className="text-[11px] font-bold truncate">{drop.title}</p>
                        <p className="text-[10px] text-primary font-semibold">Owned ✓</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Subscriptions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Subscribed
              </h2>
              <Link to="/creators">
                <Button variant="ghost" size="sm" className="text-[11px] px-2 text-muted-foreground">
                  Browse <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {mySubscribedCreators.map((creator) => (
                <Link to={`/creators/${creator.id}`} key={creator.id}>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center font-display font-bold text-xs text-primary shrink-0">
                      {creator.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs">{creator.name}</p>
                      <p className="text-[10px] text-muted-foreground">{creator.drops} drops · {creator.subscribers.toLocaleString()} subs</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2">Active</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default DashboardPage;
