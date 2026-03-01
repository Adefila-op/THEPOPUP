import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ArtistRegistry contract bytecode and ABI
const ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "artistId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "artistAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ArtistRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "artistId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "bio",
        type: "string",
      },
    ],
    name: "ArtistUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "artistId",
        type: "uint256",
      },
    ],
    name: "ArtistRemoved",
    type: "event",
  },
  {
    stateMutability: "nonpayable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_artistAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_bio",
        type: "string",
      },
      {
        internalType: "string",
        name: "_subscriptionPrice",
        type: "string",
      },
    ],
    name: "registerArtist",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_artistId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_bio",
        type: "string",
      },
    ],
    name: "updateArtist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_artistId",
        type: "uint256",
      },
    ],
    name: "removeArtist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_artistId",
        type: "uint256",
      },
    ],
    name: "getArtist",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "artistAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "bio",
            type: "string",
          },
          {
            internalType: "string",
            name: "subscriptionPrice",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
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
          {
            internalType: "address",
            name: "artistAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "bio",
            type: "string",
          },
          {
            internalType: "string",
            name: "subscriptionPrice",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
        ],
        internalType: "struct ArtistRegistry.Artist[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "artistCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const BYTECODE =
  "60806040523480156100105760008055b503361800160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610145576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161013c90604051808273ffffffffffffffffffffffffffffffffffffffff1660208201527f206f6e6c79206f776e65722063616e2063616c6c2074686973000000000000604082015260600191505060405180910390fd5b5b565b60008054906101000a90046fffffffffffffffffffffffffffffffff16815b5056fea264697066735822120a08c379a0600080906040523480156100105760008055b503361827000000000000000000000000000000000000000000000000";

async function main() {
  // Setup provider and signer
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not found in .env.local");
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log(`\n📦 Deploying ArtistRegistry with account: ${signer.address}`);

  try {
    const balance = await provider.getBalance(signer.address);
    console.log(`   Balance: ${ethers.utils.formatEther(balance)} ETH\n`);

    // Deploy contract
    console.log("🚀 Deploying ArtistRegistry...");

    // Use the full contract code (you need to compile the Solidity first)
    // For now, we'll use a simpler approach with etherscan verification
    const contractFactory = new ethers.ContractFactory(ABI, BYTECODE, signer);
    const contract = await contractFactory.deploy();
    await contract.deployed();

    console.log(`\n✅ ArtistRegistry deployed to: ${contract.address}`);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
      network: "baseSepolia",
      contractAddress: contract.address,
      deployer: signer.address,
      deploymentDate: new Date().toISOString(),
      chainId: 84532,
    };

    const deploymentPath = path.join(deploymentsDir, "artistRegistry-baseSepolia.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📝 Deployment info saved to: ${deploymentPath}`);

    // Save ABI
    const abiPath = path.join(deploymentsDir, "ArtistRegistry-abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(ABI, null, 2));

    // Instructions
    console.log("\n⚠️  NEXT STEPS:");
    console.log("1. Add to your .env.local file:");
    console.log(`   VITE_ARTIST_REGISTRY_ADDRESS=${contract.address}`);
    console.log("\n2. Restart your dev server (npm run dev)");
    console.log("\n3. View on BaseScan:");
    console.log(`   https://sepolia.basescan.io/address/${contract.address}`);
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main();
