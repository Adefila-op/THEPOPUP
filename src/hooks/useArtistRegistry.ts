import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi";
import { type Creator } from "@/lib/mockData";

const ARTIST_REGISTRY_ABI = [
  {
    inputs: [],
    name: "artistCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_artistId", type: "uint256" }],
    name: "getArtist",
    outputs: [
      {
        components: [
          { internalType: "address", name: "artistAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "bio", type: "string" },
          { internalType: "string", name: "subscriptionPrice", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct ArtistRegistry.Artist",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
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

export const useArtistRegistry = (registryAddress?: string) => {
  const [artists, setArtists] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registryAddress) {
      setIsLoading(false);
      return;
    }

    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const result = await readContract(wagmiConfig, {
          address: registryAddress as `0x${string}`,
          abi: ARTIST_REGISTRY_ABI,
          functionName: "getAllArtists",
        } as any);

        if (result && Array.isArray(result)) {
          const convertedArtists: Creator[] = result.map((artist: any, idx) => ({
            id: String(idx),
            address: artist.artistAddress,
            name: artist.name,
            avatar: "",
            bio: artist.bio,
            subscriptionPrice: artist.subscriptionPrice,
          }));
          setArtists(convertedArtists);
        }
      } catch (err: any) {
        console.error("Failed to fetch artists from registry:", err);
        setError(err?.message || "Failed to fetch artists");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, [registryAddress]);

  return { artists, isLoading, error };
};
