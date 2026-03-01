import { useState, useEffect, useCallback } from "react";
import { useAccount, useConfig } from "wagmi";
import { writeContract as wagmiWriteContract, readContract } from "wagmi/actions";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Trash2, Plus, Users, X, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { POPUP_SUBSCRIPTION_ADDRESS, popupSubscriptionAbi, DROP_REGISTRY_ADDRESS, dropRegistryAbi, AVATAR_REGISTRY_ADDRESS, avatarRegistryAbi } from "@/lib/contracts";

import { useToast } from "@/hooks/use-toast";
import { mockCreators, mockDrops, type Creator, type Drop } from "@/lib/mockData";
import { parseEther, formatEther } from "viem";
import ImageUpload from "@/components/ImageUpload";
import { useSubscriptions } from "@/hooks/useSubscriptions";

type AdminStep = "idle" | "add-pending" | "add-success" | "add-error" | "remove-pending" | "remove-success" | "remove-error";

// ArtistRegistry ABI for registering artists to blockchain
const ARTIST_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_artistAddress", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_bio", type: "string" },
      { internalType: "string", name: "_subscriptionPrice", type: "string" },
    ],
    name: "registerArtist",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_artistId", type: "uint256" }],
    name: "removeArtist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
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

const AdminPage = () => {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const { toast } = useToast();

  // Admin config
  const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || "0x0000000000000000000000000000000000000001";

  // Artist whitelist management
  const [artistAddressInput, setArtistAddressInput] = useState("");
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [step, setStep] = useState<AdminStep>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [actionAddress, setActionAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { getSubscribers } = useSubscriptions();
  const [viewSubscribersArtist, setViewSubscribersArtist] = useState<Creator | null>(null);

  // Artist creation
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistAddress, setNewArtistAddress] = useState("");
  const [newArtistBio, setNewArtistBio] = useState("");
  const [newArtistAvatar, setNewArtistAvatar] = useState("");
  const [artists, setArtists] = useState<Creator[]>(() => {
    const saved = localStorage.getItem("popup:artists");
    return saved ? JSON.parse(saved) : mockCreators;
  });

  // Drop creation
  const [newDropTitle, setNewDropTitle] = useState("");
  const [newDropCreatorId, setNewDropCreatorId] = useState("");
  const [newDropPricePublic, setNewDropPricePublic] = useState("0.02");
  const [newDropPriceSubscriber, setNewDropPriceSubscriber] = useState("0.01");
  const [newDropSupply, setNewDropSupply] = useState("100");
  const [newDropDuration, setNewDropDuration] = useState("24");
  const [newDropImage, setNewDropImage] = useState("");
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);

  const [adminBalance, setAdminBalance] = useState("0");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isContractAdmin, setIsContractAdmin] = useState(false);
  const [adminMgmtInput, setAdminMgmtInput] = useState("");

  const isAdmin = (address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) || isContractAdmin;

  useEffect(() => {
    // TODO: Fetch actual whitelisted addresses from contract via `isWhitelisted` batched calls
    // For now, showing mock data
    setWhitelistedAddresses([
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000003",
      "0x0000000000000000000000000000000000000004",
      "0x0000000000000000000000000000000000000005",
    ]);

    const fetchArtists = async () => {
      const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;
      if (registryAddress && registryAddress.startsWith("0x")) {
        try {
          const result = await readContract(config, {
            address: registryAddress as `0x${string}`,
            abi: ARTIST_REGISTRY_ABI,
            functionName: "getAllArtists",
          } as any);

          if (result && Array.isArray(result)) {
            const arr = result.map((artist: any, idx) => ({
              id: String(idx),
              address: artist.artistAddress,
              name: artist.name,
              avatar: "",
              bio: artist.bio,
              subscriptionPrice: artist.subscriptionPrice,
            })).filter(a => a.address !== "0x0000000000000000000000000000000000000000");

            setArtists(arr);
          } else {
            setArtists([]);
          }
        } catch (e) {
          console.warn("Failed to fetch artists from contract", e);
        }
      }
    };
    fetchArtists();
  }, [config]);

  useEffect(() => {
    const fetchAdminBalance = async () => {
      if (address && POPUP_SUBSCRIPTION_ADDRESS && POPUP_SUBSCRIPTION_ADDRESS.startsWith("0x")) {
        try {
          const bal: any = await readContract(config, {
            address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
            abi: popupSubscriptionAbi,
            functionName: "pendingWithdrawals",
            args: [address],
          } as any);
          setAdminBalance(formatEther(bal));

          const adminCheck: any = await readContract(config, {
            address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
            abi: popupSubscriptionAbi,
            functionName: "isAdmin",
            args: [address as `0x${string}`],
          } as any);
          setIsContractAdmin(!!adminCheck);
        } catch (e) {
          console.warn("Could not fetch admin details", e);
        }
      }
    };
    fetchAdminBalance();

    // Poll every 5s to keep balance live
    const interval = setInterval(fetchAdminBalance, 5000);
    return () => clearInterval(interval);
  }, [address, config]);

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
  };

  // ── Artist Whitelist Management ───────────────────────────────────
  const handleAddArtist = async () => {
    if (!validateAddress(artistAddressInput)) {
      toast({ title: "Invalid address", description: "Enter a valid Ethereum address", variant: "destructive" });
      return;
    }

    const trimmedAddr = artistAddressInput.trim().toLowerCase();
    if (whitelistedAddresses.includes(trimmedAddr)) {
      toast({ title: "Already whitelisted", description: "This address is already an approved artist", variant: "destructive" });
      return;
    }

    setActionAddress(trimmedAddr);
    setStep("add-pending");
    setIsLoading(true);

    try {
      const hash = await wagmiWriteContract(config, {
        address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
        abi: popupSubscriptionAbi,
        functionName: "whitelistArtist",
        args: [trimmedAddr as `0x${string}`],
        account: address,
      } as any);

      setTxHash(hash);
      setWhitelistedAddresses((prev) => [...prev, trimmedAddr]);
      setArtistAddressInput("");
      setStep("add-success");
      toast({ title: "Artist whitelisted", description: `${trimmedAddr} can now post drops` });
      setTimeout(() => setStep("idle"), 2000);
    } catch (e: any) {
      setStep("add-error");
      toast({ title: "Failed to whitelist", description: e?.message || "Transaction failed", variant: "destructive" });
      setTimeout(() => setStep("idle"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveArtist = async (addr: string) => {
    setActionAddress(addr);
    setStep("remove-pending");
    setIsLoading(true);

    try {
      const hash = await wagmiWriteContract(config, {
        address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
        abi: popupSubscriptionAbi,
        functionName: "removeArtist",
        args: [addr as `0x${string}`],
        account: address,
      } as any);

      setTxHash(hash);
      setWhitelistedAddresses((prev) => prev.filter((a) => a !== addr));
      setStep("remove-success");
      toast({ title: "Artist removed", description: `${addr} can no longer post drops` });
      setTimeout(() => setStep("idle"), 2000);
    } catch (e: any) {
      setStep("remove-error");
      toast({ title: "Failed to remove", description: e?.message || "Transaction failed", variant: "destructive" });
      setTimeout(() => setStep("idle"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Multi-Admin Management ───────────────────────────────────
  const handleAddAdmin = async () => {
    if (!validateAddress(adminMgmtInput)) {
      toast({ title: "Invalid address", description: "Enter a valid Ethereum address", variant: "destructive" });
      return;
    }

    const trimmedAddr = adminMgmtInput.trim().toLowerCase();
    setActionAddress(trimmedAddr);
    setStep("add-pending");
    setIsLoading(true);

    try {
      const hash = await wagmiWriteContract(config, {
        address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
        abi: popupSubscriptionAbi,
        functionName: "addAdmin",
        args: [trimmedAddr as `0x${string}`],
        account: address,
      } as any);

      setTxHash(hash);
      setAdminMgmtInput("");
      setStep("add-success");
      toast({ title: "Admin added", description: `${trimmedAddr} can now manage the platform` });
      setTimeout(() => setStep("idle"), 2000);
    } catch (e: any) {
      setStep("add-error");
      toast({ title: "Failed to add admin", description: e?.message || "Transaction failed", variant: "destructive" });
      setTimeout(() => setStep("idle"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (addr: string) => {
    setActionAddress(addr);
    setStep("remove-pending");
    setIsLoading(true);

    try {
      const hash = await wagmiWriteContract(config, {
        address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
        abi: popupSubscriptionAbi,
        functionName: "removeAdmin",
        args: [addr as `0x${string}`],
        account: address,
      } as any);

      setTxHash(hash);
      setStep("remove-success");
      toast({ title: "Admin removed", description: `${addr} can no longer manage the platform` });
      setTimeout(() => setStep("idle"), 2000);
    } catch (e: any) {
      setStep("remove-error");
      toast({ title: "Failed to remove admin", description: e?.message || "Transaction failed", variant: "destructive" });
      setTimeout(() => setStep("idle"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Create New Artist (Blockchain + Local) ───────────────────────────────────
  const handleCreateArtist = async () => {
    if (!newArtistName.trim() || !newArtistAddress.trim() || !newArtistBio.trim()) {
      toast({ title: "Missing fields", description: "Fill all artist fields", variant: "destructive" });
      return;
    }
    if (!validateAddress(newArtistAddress)) {
      toast({ title: "Invalid address", description: "Enter a valid Ethereum address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;

    // Try to register on blockchain first
    if (registryAddress && registryAddress.startsWith("0x")) {
      try {
        const hash = await wagmiWriteContract(config, {
          address: registryAddress as `0x${string}`,
          abi: ARTIST_REGISTRY_ABI,
          functionName: "registerArtist",
          args: [newArtistAddress as `0x${string}`, newArtistName, newArtistBio, "0.0006 ETH"],
          account: address,
        } as any);

        console.log("✅ Artist registered on blockchain:", hash);
        toast({ title: "Artist registered on-chain", description: `Transaction: ${hash.slice(0, 8)}...`, });

        // Save avatar if provided
        if (newArtistAvatar && AVATAR_REGISTRY_ADDRESS && AVATAR_REGISTRY_ADDRESS.startsWith("0x")) {
          try {
            const avatarHash = await wagmiWriteContract(config, {
              address: AVATAR_REGISTRY_ADDRESS as `0x${string}`,
              abi: avatarRegistryAbi,
              functionName: "setAvatar",
              args: [newArtistAddress as `0x${string}`, newArtistAvatar],
              account: address,
            } as any);
            console.log("✅ Avatar registered on-chain:", avatarHash);
            toast({ title: "Avatar saved to registry", description: `Transaction: ${avatarHash.slice(0, 8)}...` });
          } catch (avatarErr: any) {
            console.warn("⚠️ Failed to set avatar on-chain", avatarErr);
          }
        }
      } catch (err: any) {
        console.warn("⚠️ Blockchain registration failed, falling back to localStorage:", err);
        toast({ title: "Blockchain not ready", description: "Saved to local storage", variant: "default" });
      }
    } else {
      console.log("ℹ️ VITE_ARTIST_REGISTRY_ADDRESS not configured, saving to localStorage only");
    }

    // Always save to localStorage as backup
    const newArtist: Creator = {
      id: crypto.randomUUID(),
      address: newArtistAddress.toLowerCase(),
      name: newArtistName,
      avatar: newArtistAvatar,
      bio: newArtistBio,
      subscriptionPrice: "0.0006 ETH",
    };

    const updatedArtists = [...artists, newArtist];
    setArtists(updatedArtists);
    localStorage.setItem("popup:artists", JSON.stringify(updatedArtists));

    toast({ title: "Artist created", description: `${newArtistName} added to the platform` });
    setNewArtistName("");
    setNewArtistAddress("");
    setNewArtistBio("");
    setNewArtistAvatar("");
    setIsLoading(false);
  };

  // ── Create New Drop (Blockchain + Local) ───────────────────────────────────
  const handleCreateDrop = async () => {
    if (!newDropTitle.trim() || !newDropCreatorId || !newDropImage) {
      toast({ title: "Missing fields", description: "Fill all drop fields and upload image", variant: "destructive" });
      return;
    }

    const pricePublic = parseEther(newDropPricePublic || "0");
    const priceSubscriber = parseEther(newDropPriceSubscriber || "0");
    const supply = BigInt(newDropSupply || "0");
    const durationHours = BigInt(newDropDuration || "0");

    // The creator in AdminPage dropdown is actually the creator's id (index).
    // We need the artist's address for the contract, since DropRegistry now expects it
    const selectedArtistAddress = artists.find((a) => a.id === newDropCreatorId)?.address || address;

    setIsLoading(true);

    if (DROP_REGISTRY_ADDRESS && DROP_REGISTRY_ADDRESS.startsWith("0x")) {
      try {
        const hash = await wagmiWriteContract(config, {
          address: DROP_REGISTRY_ADDRESS as `0x${string}`,
          abi: dropRegistryAbi,
          functionName: "createDrop",
          args: [newDropTitle, selectedArtistAddress as `0x${string}`, newDropImage, priceSubscriber, pricePublic, supply, durationHours],
          account: address,
        } as any);

        console.log("✅ Drop registered on blockchain:", hash);
        toast({ title: "Drop registered on-chain", description: `Transaction: ${hash.slice(0, 8)}...` });

        // Refresh data from blockchain
        const customEvent = new Event("artist-registry:updated");
        window.dispatchEvent(customEvent);

      } catch (err: any) {
        console.warn("⚠️ Blockchain drop creation failed:", err);
        toast({ title: "Blockchain drop failed", description: err.message || "Failed", variant: "destructive" });
      }
    } else {
      console.log("ℹ️ VITE_DROP_REGISTRY_ADDRESS not configured");
    }

    // Fetch Drops
    if (DROP_REGISTRY_ADDRESS && DROP_REGISTRY_ADDRESS.startsWith("0x")) {
      try {
        const result: any = await readContract(wagmiConfig, {
          address: DROP_REGISTRY_ADDRESS as `0x${string}`,
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
          setDrops(activeDrops);
        }
      } catch (e) {
        console.warn("Failed to fetch drops from contract:", e);
      }
    }

    toast({ title: "Drop created", description: `${newDropTitle} added` });
    setNewDropTitle("");
    setNewDropCreatorId("");
    setNewDropPricePublic("0.02");
    setNewDropPriceSubscriber("0.01");
    setNewDropSupply("100");
    setNewDropDuration("24");
    setNewDropImage("");
    setIsLoading(false);
  };

  // ── Delete Artist (Blockchain + Local) ───────────────────────────────────
  const handleDeleteArtist = async (artistId: string) => {
    setIsLoading(true);
    const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;

    // Try to remove from blockchain first
    if (registryAddress && registryAddress.startsWith("0x")) {
      try {
        const hash = await wagmiWriteContract(config, {
          address: registryAddress as `0x${string}`,
          abi: ARTIST_REGISTRY_ABI,
          functionName: "removeArtist",
          args: [BigInt(artistId)],
          account: address,
        } as any);

        console.log("✅ Artist removed from blockchain:", hash);
        toast({ title: "Artist removed from blockchain", description: `Transaction: ${hash.slice(0, 8)}...` });
      } catch (err: any) {
        console.warn("⚠️ Blockchain removal failed, removing from localStorage:", err);
        toast({ title: "Blockchain not ready", description: "Removed from local storage", variant: "default" });
      }
    }

    // Always remove from localStorage as backup
    const updatedArtists = artists.filter((a) => a.id !== artistId);
    setArtists(updatedArtists);
    localStorage.setItem("popup:artists", JSON.stringify(updatedArtists));

    // Also remove associated drops
    const updatedDrops = drops.filter((d) => d.creatorId !== artistId);
    setDrops(updatedDrops);
    localStorage.setItem("popup:drops", JSON.stringify(updatedDrops));

    toast({ title: "Artist deleted", description: "Artist and associated drops removed" });
    setIsLoading(false);
  };

  // ── Delete Drop (Local) ───────────────────────────────────
  const handleDeleteDrop = (dropId: string) => {
    // Left unimplemented for blockchain data
    toast({ title: "Drop deletion disabled", description: "Currently unsupported on-chain" });
  };

  // ── Withdraw Platform Earnings ───────────────────────────────────
  const handleWithdraw = async () => {
    if (!POPUP_SUBSCRIPTION_ADDRESS) return;
    setIsWithdrawing(true);
    try {
      const hash = await wagmiWriteContract(config, {
        address: POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`,
        abi: popupSubscriptionAbi,
        functionName: "withdraw",
        account: address,
      } as any);
      toast({ title: "Withdrawal Successful", description: `Transaction: ${hash.slice(0, 8)}...` });
      setAdminBalance("0");
    } catch (err: any) {
      console.warn(err);
      toast({ title: "Withdrawal Failed", description: err.message || "Could not withdraw", variant: "destructive" });
    }
    setIsWithdrawing(false);
  };

  if (!isConnected) {
    return (
      <Layout>
        <section className="py-6">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h1 className="font-display text-2xl font-extrabold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground mb-6">Please connect your wallet to access the admin dashboard</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <h1 className="font-display text-2xl font-extrabold mb-2">Access Denied</h1>
              <p className="text-muted-foreground">Only admins can access this page.</p>
              <p className="text-xs text-muted-foreground mt-2">Connected: {address}</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <section className="py-6">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-extrabold mb-2">Admin Panel</h1>
                  <p className="text-muted-foreground">Manage artists, drops, and platform settings</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Admin Account: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </Badge>
                  </div>
                </div>

                {/* Platform Earnings Block */}
                <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col gap-2 min-w-[200px]">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Platform Earnings</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-display font-bold text-primary">{adminBalance} ETH</span>
                  </div>
                  <Button
                    variant="neon"
                    size="sm"
                    className="w-full mt-2 rounded-xl"
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || adminBalance === "0" || adminBalance === "0.0"}
                  >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
                  </Button>
                </div>
              </div>
            </motion.div>

            <Tabs defaultValue="whitelist" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="whitelist">Whitelist Artists</TabsTrigger>
                <TabsTrigger value="create-artist">Create Artist</TabsTrigger>
                <TabsTrigger value="create-drop">Create Drop</TabsTrigger>
                <TabsTrigger value="manage-admins">Manage Admins</TabsTrigger>
              </TabsList>

              {/* ── Whitelist Artists Tab ─────────────── */}
              <TabsContent value="whitelist" className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                  <div className="rounded-2xl bg-card border border-white/5 p-6">
                    <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" /> Add Artist to Whitelist
                    </h2>

                    <div className="flex gap-2">
                      <Input
                        placeholder="0x..."
                        value={artistAddressInput}
                        onChange={(e) => setArtistAddressInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        variant="neon"
                        onClick={handleAddArtist}
                        disabled={isLoading || !artistAddressInput.trim()}
                        className="rounded-xl"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Enter an Ethereum address to give them permission to post drops.
                    </p>

                    {step === "add-success" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <p className="text-xs text-green-500">Artist whitelisted successfully</p>
                      </motion.div>
                    )}

                    {step === "add-error" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-xs text-destructive">Failed to whitelist artist</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="rounded-2xl bg-card border border-white/5 p-6">
                    <h2 className="font-display text-lg font-bold mb-4">Whitelisted Artists ({whitelistedAddresses.length})</h2>

                    {whitelistedAddresses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No artists whitelisted yet. Add one above to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {whitelistedAddresses.map((addr, i) => (
                            <motion.div
                              key={addr}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-white/5 hover:border-white/10 transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-sm font-medium break-all">{addr}</p>
                                <p className="text-xs text-muted-foreground mt-1">Can post drops and create campaigns</p>
                              </div>

                              <button
                                onClick={() => handleRemoveArtist(addr)}
                                disabled={isLoading}
                                className="ml-3 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                                title="Remove from whitelist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>

              {/* ── Manage Admins Tab ─────────────── */}
              <TabsContent value="manage-admins" className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                  <div className="rounded-2xl bg-card border border-white/5 p-6">
                    <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-primary" /> Add Platform Admin
                    </h2>

                    <div className="flex gap-2">
                      <Input
                        placeholder="0x..."
                        value={adminMgmtInput}
                        onChange={(e) => setAdminMgmtInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        variant="neon"
                        onClick={handleAddAdmin}
                        disabled={isLoading || !adminMgmtInput.trim()}
                        className="rounded-xl"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Enter an Ethereum address to give them full Admin access to this dashboard.
                    </p>

                    <h3 className="text-sm font-bold mt-8 border-b border-white/10 pb-2">Admin Tools</h3>
                    <div className="mt-4 flex gap-4">
                      <Input
                        placeholder="Remove 0x Admin Address..."
                        id="removeAdminInput"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleRemoveAdmin((e.target as HTMLInputElement).value);
                        }}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">Press Enter to delete admin access immediately</p>
                  </div>
                </motion.div>
              </TabsContent>

              {/* ── Create Artist Tab ─────────────── */}
              <TabsContent value="create-artist">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-2xl bg-card border border-white/5 p-6 max-w-2xl">
                    <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" /> Create New Artist
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <ImageUpload
                          onUploadSuccess={setNewArtistAvatar}
                          currentHash={newArtistAvatar}
                          label="Profile Picture (Optional)"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Artist Name</label>
                        <Input
                          placeholder="e.g., KXNS"
                          value={newArtistName}
                          onChange={(e) => setNewArtistName(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Wallet Address (0x...)</label>
                        <Input
                          placeholder="0x..."
                          value={newArtistAddress}
                          onChange={(e) => setNewArtistAddress(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Bio</label>
                        <Textarea
                          placeholder="Artist bio and description..."
                          value={newArtistBio}
                          onChange={(e) => setNewArtistBio(e.target.value)}
                          className="rounded-xl min-h-24"
                        />
                      </div>

                      <Button
                        variant="neon"
                        onClick={handleCreateArtist}
                        className="w-full rounded-xl"
                        disabled={!newArtistName.trim() || !newArtistAddress.trim()}
                      >
                        Create Artist
                      </Button>
                    </div>

                    <div className="mt-6 rounded-2xl bg-secondary/30 border border-white/5 p-4">
                      <h3 className="text-sm font-bold mb-2">Active Artists ({artists.length})</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {artists.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No artists created yet</p>
                        ) : (
                          artists.map((artist) => (
                            <div key={artist.id} className="text-xs p-2 rounded-lg bg-secondary/50 flex items-center justify-between group">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold">{artist.name}</div>
                                <div className="text-muted-foreground text-[10px]">{artist.address.slice(0, 6)}...{artist.address.slice(-4)}</div>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => setViewSubscribersArtist(artist)}
                                  className="mr-1 p-1.5 rounded-lg hover:bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="View subscribers"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArtist(artist.id)}
                                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete artist"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              {/* ── Create Drop Tab ─────────────── */}
              <TabsContent value="create-drop">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-2xl bg-card border border-white/5 p-6 max-w-2xl">
                    <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" /> Create New Drop
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Drop Title</label>
                        <Input
                          placeholder="e.g., Phantom Hoodie 001"
                          value={newDropTitle}
                          onChange={(e) => setNewDropTitle(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Creator</label>
                        <select
                          value={newDropCreatorId}
                          onChange={(e) => setNewDropCreatorId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-secondary border border-white/10 text-sm"
                        >
                          <option value="">Select an artist...</option>
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                              {artist.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <ImageUpload
                          onUploadSuccess={setNewDropImage}
                          currentHash={newDropImage}
                          label="Drop Image *(required)*"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Public Price (ETH)</label>
                          <Input
                            placeholder="0.02"
                            type="number"
                            step="0.001"
                            value={newDropPricePublic}
                            onChange={(e) => setNewDropPricePublic(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Subscriber Price (ETH)</label>
                          <Input
                            placeholder="0.01"
                            type="number"
                            step="0.001"
                            value={newDropPriceSubscriber}
                            onChange={(e) => setNewDropPriceSubscriber(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Quantity (Supply)</label>
                          <Input
                            placeholder="100"
                            type="number"
                            min="1"
                            step="1"
                            value={newDropSupply}
                            onChange={(e) => setNewDropSupply(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Duration (hours)</label>
                          <Input
                            placeholder="24"
                            type="number"
                            min="1"
                            step="1"
                            value={newDropDuration}
                            onChange={(e) => setNewDropDuration(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <Button
                        variant="neon"
                        onClick={handleCreateDrop}
                        className="w-full rounded-xl"
                        disabled={!newDropTitle.trim() || !newDropCreatorId}
                      >
                        Create Drop
                      </Button>
                    </div>

                    <div className="mt-6 rounded-2xl bg-secondary/30 border border-white/5 p-4">
                      <h3 className="text-sm font-bold mb-2">Active Drops ({drops.length})</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {drops.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No drops created yet</p>
                        ) : (
                          drops.map((drop) => (
                            <div key={drop.id} className="text-xs p-2 rounded-lg bg-secondary/50 flex items-center justify-between group">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold">{drop.title}</div>
                                <div className="text-muted-foreground text-[10px]">by {drop.creator} • {drop.pricePublic}</div>
                              </div>
                              <button
                                onClick={() => handleDeleteDrop(drop.id)}
                                className="ml-2 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete drop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </Layout>

      {/* View Subscribers Modal */}
      <AnimatePresence>
        {viewSubscribersArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setViewSubscribersArtist(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-secondary/30">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Subscribers to {viewSubscribersArtist.name}
                </h3>
                <button
                  onClick={() => setViewSubscribersArtist(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {(() => {
                  const subs = getSubscribers(viewSubscribersArtist.id);
                  if (subs.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-8 h-8 opacity-20 mx-auto mb-3" />
                        <p>No subscribers yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        {subs.length} Total Subscriber{subs.length === 1 ? '' : 's'}
                      </div>
                      {subs.map((address, idx) => (
                        <div key={idx} className="bg-secondary/40 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                          <code className="text-sm text-primary/90 font-mono">
                            {address}
                          </code>
                          <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary">
                            Member
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPage;
