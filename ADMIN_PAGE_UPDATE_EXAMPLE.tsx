// Example updates for AdminPage.tsx to use ArtistRegistry contract
// This shows the key changes needed

import { useWriteContractAsync } from "wagmi";
import { useState } from "react";

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
    inputs: [
      { internalType: "uint256", name: "_artistId", type: "uint256" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_bio", type: "string" },
    ],
    name: "updateArtist",
    outputs: [],
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
] as const;

// In your AdminPage component:

const AdminPage = () => {
  // ... existing state ...
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistAddress, setNewArtistAddress] = useState("");
  const [newArtistBio, setNewArtistBio] = useState("");
  const [registryIsLoading, setRegistryIsLoading] = useState(false);

  // Get the contract address from env
  const registryAddress = import.meta.env.VITE_ARTIST_REGISTRY_ADDRESS;

  // NEW: Handle registering artist on-chain
  const handleCreateArtistOnChain = async () => {
    if (!registryAddress) {
      toast({
        title: "Registry not configured",
        description: "ArtistRegistry contract address not set in .env.local",
        variant: "destructive",
      });
      return;
    }

    if (!newArtistName.trim() || !newArtistAddress.trim() || !newArtistBio.trim()) {
      toast({
        title: "Missing fields",
        description: "Fill all artist fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateAddress(newArtistAddress)) {
      toast({
        title: "Invalid address",
        description: "Enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }

    setRegistryIsLoading(true);

    try {
      // Call registerArtist on the contract
      const hash = await writeContractAsync({
        address: registryAddress as `0x${string}`,
        abi: ARTIST_REGISTRY_ABI,
        functionName: "registerArtist",
        args: [
          newArtistAddress.toLowerCase() as `0x${string}`,
          newArtistName,
          newArtistBio,
          "0.0006 ETH",
        ],
      } as any);

      // Also save to localStorage as backup
      const localArtists = localStorage.getItem("popup:artists") || "[]";
      const artists = JSON.parse(localArtists);
      artists.push({
        id: String(artists.length + 1),
        address: newArtistAddress.toLowerCase(),
        name: newArtistName,
        avatar: "",
        bio: newArtistBio,
        subscriptionPrice: "0.0006 ETH",
      });
      localStorage.setItem("popup:artists", JSON.stringify(artists));

      toast({
        title: "Artist registered!",
        description: `Registered on-chain. Transaction: ${hash}`,
      });

      // Clear form
      setNewArtistName("");
      setNewArtistAddress("");
      setNewArtistBio("");
    } catch (error: any) {
      console.error("Error registering artist:", error);
      toast({
        title: "Registration failed",
        description: error?.message || "Failed to register artist on-chain",
        variant: "destructive",
      });
    } finally {
      setRegistryIsLoading(false);
    }
  };

  // NEW: Handle deleting artist from on-chain registry
  const handleDeleteArtistFromRegistry = async (artistId: string) => {
    if (!registryAddress) return;

    setRegistryIsLoading(true);
    try {
      const hash = await writeContractAsync({
        address: registryAddress as `0x${string}`,
        abi: ARTIST_REGISTRY_ABI,
        functionName: "removeArtist",
        args: [BigInt(artistId)],
      } as any);

      // Also remove from localStorage
      const localArtists = localStorage.getItem("popup:artists") || "[]";
      const artists = JSON.parse(localArtists);
      const filtered = artists.filter((a: any) => a.id !== artistId);
      localStorage.setItem("popup:artists", JSON.stringify(filtered));

      toast({
        title: "Artist removed",
        description: `Removed from on-chain registry. Transaction: ${hash}`,
      });
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error?.message,
        variant: "destructive",
      });
    } finally {
      setRegistryIsLoading(false);
    }
  };

  // Use the new handler instead of handleCreateArtist
  // Replace this in the Create Artist tab button:
  return (
    <Button
      variant="neon"
      onClick={handleCreateArtistOnChain}
      className="w-full rounded-xl"
      disabled={!newArtistName.trim() || !newArtistAddress.trim() || registryIsLoading}
    >
      {registryIsLoading ? "Registering..." : "Create Artist"}
    </Button>
  );
};

export default AdminPage;

/*
INSTRUCTIONS:

1. Add ARTIST_REGISTRY_ABI constant above (copy the full ABI from deployments/ArtistRegistry-abi.json)

2. Update your handleCreateArtist function to use the contract:

   OLD:
   const handleCreateArtist = () => {
     // ... save to localStorage only
   }

   NEW:
   const handleCreateArtistOnChain = async () => {
     // ... call contract, then save to localStorage as backup
   }

3. Update the button in Create Artist tab:

   OLD:
   <Button onClick={handleCreateArtist} ...>

   NEW:
   <Button onClick={handleCreateArtistOnChain} ...>

4. Update the delete button for artists:

   OLD:
   onClick={() => handleDeleteArtist(artist.id)}

   NEW:
   onClick={() => handleDeleteArtistFromRegistry(artist.id)}

5. Make sure you have:
   - import { useWriteContractAsync } from "wagmi";
   - import { useState } from "react";

6. Test:
   - Fill in artist form
   - Click "Create Artist"
   - Approve transaction in wallet
   - Check BaseScan explorer
   - Artist should appear on /creators page for all users
*/
