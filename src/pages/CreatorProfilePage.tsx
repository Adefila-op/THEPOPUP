import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import DropCard from "@/components/DropCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCreators, mockDrops, type Creator, type Drop } from "@/lib/mockData";
import { Users, Package, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Loader2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWalletAction } from "@/hooks/useWalletAction";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import ConnectPrompt from "@/components/ConnectPrompt";
import TxSuccess from "@/components/TxSuccess";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi";
import { AVATAR_REGISTRY_ADDRESS, avatarRegistryAbi, POPUP_SUBSCRIPTION_ADDRESS, popupSubscriptionAbi } from "@/lib/contracts";
import { getIPFSUrl } from "@/lib/pinata";

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

const AVATAR_COLORS = [
  "from-primary/30 to-emerald-500/20",
  "from-blue-500/30 to-primary/20",
  "from-purple-500/30 to-pink-500/20",
  "from-orange-500/30 to-red-500/20",
  "from-cyan-500/30 to-blue-500/20",
];

import { useConfig } from "wagmi";

type SubModal = "closed" | "connect" | "confirm" | "pending" | "success" | "error";

const CreatorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorDrops, setCreatorDrops] = useState<Drop[]>([]);

  const config = useConfig();
  const { isConnected, state, subscribe, reset, address } = useWalletAction();
  const [modal, setModal] = useState<SubModal>("closed");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    if (!creator || !creator.address) return;
    let isMounted = true;
    const fetchSubData = async () => {
      if (!POPUP_SUBSCRIPTION_ADDRESS) return;
      try {
        const count = await readContract(config, {
          address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
          abi: popupSubscriptionAbi,
          functionName: "getSubscribersCount",
          args: [creator.address as `0x${string}`],
        } as any);
        if (isMounted && count !== undefined) {
          setSubscriberCount(Number(count));
        }

        if (address) {
          const isSub = await readContract(config, {
            address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
            abi: popupSubscriptionAbi,
            functionName: "isUserSubscribed",
            args: [address as `0x${string}`, creator.address as `0x${string}`],
          } as any);
          if (isMounted && isSub) setSubscribed(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSubData();
    return () => { isMounted = false; };
  }, [creator, address]);

  // Withdrawals
  const [artistBalance, setArtistBalance] = useState("0");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (creator) {
      setAvatarUrl(creator.avatar || "");
      setIsFollowing(localStorage.getItem(`following:${creator.id}`) === "true");
    }
  }, [creator]);

  // Fetch from AvatarRegistry if avialable on-chain
  useEffect(() => {
    if (!creator) return;
    if (avatarUrl) return; // already have one
    if (!AVATAR_REGISTRY_ADDRESS || !AVATAR_REGISTRY_ADDRESS.startsWith("0x")) return;

    let isMounted = true;
    const fetchAvatar = async () => {
      try {
        const hash = await readContract(config, {
          address: AVATAR_REGISTRY_ADDRESS as `0x${string}`,
          abi: avatarRegistryAbi,
          functionName: "getAvatar",
          args: [creator.address as `0x${string}`]
        } as any);

        if (hash && typeof hash === "string" && hash.length > 0 && isMounted) {
          setAvatarUrl(getIPFSUrl(hash));
        }
      } catch (e) {
        // ignore
      }
    };
    fetchAvatar();
    return () => { isMounted = false; }
  }, [creator, avatarUrl]);

  // Fetch Artist Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (address && creator && creator.address.toLowerCase() === address.toLowerCase() && POPUP_SUBSCRIPTION_ADDRESS) {
        try {
          const { formatEther } = await import("viem");
          const bal = await readContract(wagmiConfig, {
            address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
            abi: popupSubscriptionAbi,
            functionName: "pendingWithdrawals",
            args: [address as `0x${string}`],
          } as any);
          if (bal !== undefined) {
            setArtistBalance(formatEther(bal as bigint));
          }
        } catch (e) {
          console.warn("Failed to fetch artist balance", e);
        }
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, [address, creator]);

  // Load creator and drops data from blockchain first, then localStorage
  const loadCreatorData = useCallback(async () => {
    let artistsData = mockCreators;

    // Try blockchain first
    const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;
    if (registryAddress && registryAddress.startsWith("0x")) {
      try {
        const result = await readContract(wagmiConfig, {
          address: registryAddress as `0x${string}`,
          abi: ARTIST_REGISTRY_ABI,
          functionName: "getAllArtists",
        } as any);

        if (result && Array.isArray(result) && result.length > 0) {
          artistsData = result.map((artist: any, idx) => ({
            id: String(idx),
            address: artist.artistAddress,
            name: artist.name,
            avatar: "",
            bio: artist.bio,
            subscriptionPrice: artist.subscriptionPrice,
          }));
        } else {
          const customArtists = localStorage.getItem("popup:artists");
          if (customArtists) artistsData = JSON.parse(customArtists);
        }
      } catch {
        const customArtists = localStorage.getItem("popup:artists");
        if (customArtists) artistsData = JSON.parse(customArtists);
      }
    } else {
      const customArtists = localStorage.getItem("popup:artists");
      if (customArtists) artistsData = JSON.parse(customArtists);
    }

    const foundCreator = artistsData.find((c: Creator) => c.id === id);
    if (foundCreator) {
      setCreator(foundCreator);

      let finalDrops: Drop[] = [];
      const dropRegistryAddress = import.meta.env.VITE_DROP_REGISTRY_ADDRESS;
      if (dropRegistryAddress && dropRegistryAddress.startsWith("0x")) {
        try {
          const { dropRegistryAbi } = await import("@/lib/contracts");
          const { formatEther } = await import("viem");
          const { getIPFSUrl } = await import("@/lib/pinata");

          const result: any = await readContract(wagmiConfig, {
            address: dropRegistryAddress as `0x${string}`,
            abi: dropRegistryAbi,
            functionName: "getDropsByArtist",
            args: [foundCreator.address as `0x${string}`],
          } as any);

          if (result && Array.isArray(result)) {
            finalDrops = result.filter((d: any) => d.active).map((drop: any) => ({
              id: String(drop.dropId),
              title: drop.title,
              creator: foundCreator.name,
              creatorId: foundCreator.id,
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
            }));
          }
        } catch (e) {
          console.warn("Failed to fetch drops for artist:", e);
        }
      }

      // Fetch Artist Pending Balance if connected wallet is this artist
      if (address && address.toLowerCase() === foundCreator.address.toLowerCase() && POPUP_SUBSCRIPTION_ADDRESS) {
        try {
          const bal: any = await readContract(wagmiConfig, {
            address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
            abi: POPUP_SUBSCRIPTION_ABI,
            functionName: "pendingWithdrawals",
            args: [foundCreator.address as `0x${string}`]
          } as any);
          setArtistBalance(formatEther(bal));
        } catch (e) {
          // ignore
        }
      }

      if (finalDrops.length === 0) {
        const customDrops = localStorage.getItem("popup:drops");
        const localDropsData = customDrops ? JSON.parse(customDrops) : mockDrops;
        finalDrops = localDropsData.filter((d: Drop) => d.creatorId === foundCreator.id);
      }

      setCreatorDrops(finalDrops.length > 0 ? finalDrops : []);
    } else {
      // Creator not found, redirect to creators page after a brief delay
      setTimeout(() => {
        if (!foundCreator) {
          navigate("/creators");
        }
      }, 1000);
    }
  }, [id, navigate, address]); // Added address to dependencies

  // Setup polling for real-time creator updates
  useEffect(() => {
    loadCreatorData();
    const interval = setInterval(loadCreatorData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [loadCreatorData]);

  // Show loading state while creator data is being loaded
  if (!creator) {
    return (
      <Layout>
        <section className="py-6">
          <div className="container mx-auto px-4 text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        </section>
      </Layout>
    );
  }

  const initials = creator.name.slice(0, 2).toUpperCase();
  const colorIdx = parseInt(creator.id || "0") % AVATAR_COLORS.length;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    localStorage.setItem(`following:${creator.id}`, (!isFollowing).toString());
  };

  const openSubscribe = () => {
    if (!isConnected) { setModal("connect"); return; }
    setModal("confirm");
  };

  const confirmSubscribe = async () => {
    setModal("pending");
    const hash = await subscribe(creator.address, creator.subscriptionPrice);
    if (hash) {
      // Record subscription
      setSubscriberCount(prev => prev + 1);
      setTxHash(hash);
      setSubscribed(true);
      setModal("success");
    } else {
      setModal("error");
    }
  };

  const closeModal = () => { setModal("closed"); reset(); setTxHash(null); };

  const handleWithdraw = async () => {
    if (!POPUP_SUBSCRIPTION_ADDRESS) return;
    setIsWithdrawing(true);
    try {
      const { writeContract } = await import("wagmi/actions");
      const hash = await writeContract(config, {
        address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
        abi: popupSubscriptionAbi,
        functionName: "withdraw",
        account: address,
      } as any);
      setArtistBalance("0");
    } catch (err: any) {
      console.warn(err);
    }
    setIsWithdrawing(false);
  };

  return (
    <Layout>
      <section className="py-6">
        <div className="container mx-auto px-4">

          <Link to="/creators" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="w-4 h-4" /> Creators
          </Link>

          {/* Creator hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden bg-card border border-white/5 mb-6 p-5"
          >
            {/* Gradient backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} opacity-20`} />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="relative flex items-start gap-4">
              {/* Avatar */}
              {avatarUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative z-10">
                  <img src={avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center font-display font-bold text-xl text-foreground shrink-0 border border-white/10 relative z-10`}>
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="font-display text-xl font-extrabold">{creator.name}</h1>
                  {creator.isNew && (
                    <Badge className="bg-primary text-primary-foreground border-none text-[9px] uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" /> New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{creator.bio}</p>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{subscriberCount} subs</span>
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{creatorDrops.length} drops</span>
                </div>

                {subscribed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Subscribed
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-xl text-xs ${isFollowing ? 'bg-primary/20 border-primary/40' : ''}`}
                      onClick={handleFollow}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="neon" size="sm" className="rounded-xl text-xs" onClick={openSubscribe}>
                      Subscribe · {creator.subscriptionPrice}
                    </Button>
                  </div>
                )}

                {address && address.toLowerCase() === creator.address.toLowerCase() && (
                  <div className="mt-4 p-3 bg-secondary/40 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Your Earnings</p>
                      <p className="font-display font-bold text-lg text-primary">{artistBalance} ETH</p>
                    </div>
                    <Button
                      variant="neon"
                      size="sm"
                      className="rounded-xl h-8 text-xs px-4"
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || artistBalance === "0" || artistBalance === "0.0"}
                    >
                      {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Drops */}
          <h2 className="font-display text-base font-extrabold mb-3">
            {creatorDrops.length > 0 ? "Available Drops" : "No Drops Yet"}
          </h2>

          {creatorDrops.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {creatorDrops.map((drop, i) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <DropCard drop={drop} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 rounded-2xl bg-card border border-white/5">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No drops yet. Subscribe to get notified!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Subscribe Dialog ─────────────────────────────────── */}
      <Dialog open={modal !== "closed"} onOpenChange={closeModal}>
        <DialogContent className="bg-card border-white/8 sm:max-w-sm rounded-3xl">
          <AnimatePresence mode="wait">

            {modal === "connect" && (
              <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConnectPrompt action={`subscribe to ${creator.name}`} />
              </motion.div>
            )}

            {modal === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader className="mb-4">
                  <DialogTitle className="font-display text-xl">Subscribe to {creator.name}</DialogTitle>
                  <DialogDescription>Mint a subscription NFT to get exclusive access and discounted drops.</DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl bg-secondary/50 border border-white/5 divide-y divide-white/5 mb-5">
                  {[
                    { label: "Creator", value: creator.name },
                    { label: "Price", value: "0.0003 ETH (~$1)", highlight: true },
                    { label: "You receive", value: "Subscription NFT" },
                    { label: "Benefit", value: `${Math.round((1 - 0.02 / 0.04) * 100)}% off drops` },
                    { label: "Network", value: "Base" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex justify-between px-4 py-2.5 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={`font-semibold ${highlight ? "text-primary" : ""}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1 rounded-xl" onClick={confirmSubscribe}>
                    Subscribe Now
                  </Button>
                </div>
              </motion.div>
            )}

            {modal === "pending" && (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <Users className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-1">Subscribing…</h3>
                <p className="text-sm text-muted-foreground">Confirm in your wallet</p>
              </motion.div>
            )}

            {modal === "success" && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TxSuccess
                  title={`Subscribed to ${creator.name}! 🎉`}
                  description="Your Subscription NFT is live on Base. You now get exclusive drop access and discounted prices."
                  txHash={txHash}
                  onDone={closeModal}
                  doneLabel="Start Exploring Drops"
                />
              </motion.div>
            )}

            {modal === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Transaction Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">{state.error || "Something went wrong. Please try again."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button variant="hero" className="flex-1" onClick={() => { reset(); setModal("confirm"); }}>Retry</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CreatorProfilePage;
