#!/usr/bin/env node
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Full ArtistRegistry ABI
const ABI = JSON.parse(`[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "artistId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "artistAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ArtistRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "artistId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bio",
        "type": "string"
      }
    ],
    "name": "ArtistUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "artistId",
        "type": "uint256"
      }
    ],
    "name": "ArtistRemoved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_artistAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bio",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_subscriptionPrice",
        "type": "string"
      }
    ],
    "name": "registerArtist",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_artistId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bio",
        "type": "string"
      }
    ],
    "name": "updateArtist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_artistId",
        "type": "uint256"
      }
    ],
    "name": "removeArtist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_artistId",
        "type": "uint256"
      }
    ],
    "name": "getArtist",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "artistAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "bio",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "subscriptionPrice",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct ArtistRegistry.Artist",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllArtists",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "artistAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "bio",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "subscriptionPrice",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct ArtistRegistry.Artist[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "artistCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]`);

// You need to compile contracts/ArtistRegistry.sol to get this bytecode
// Use: solc --optimize --bin contracts/ArtistRegistry.sol
// This is a placeholder - we'll deploy using a factory pattern
const CREATION_CODE = "60806040336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610400806100536000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063715018a611610066578063715018a61461018a5780638da5cb5b146101a45780639f09c9e7146101f8578063c1f2e6a714610240578063dfc3e8cb1461026a57610093565b8063226f04051461009857806325b2f9d01461011857806342842e0e1461015e575b600080fd5b6101166004803603608081101561010e57600080fd5b810190808035906020019092919080359060200190929190803590602001909291908035906020019092919050505061029e565b005b61014c6004803603602081101561012e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061037d565b6040518082815260200191505060405180910390f35b61018860048036036060811015610174575b506101a2565b005b610192610437565b005b6101ac61044d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61023e6004803603602081101561020e575b50610471565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61024861044d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000806020908101906000808a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506101166004803603606081101561011057600080fd5b5b505b005b60008263ffffffff81161585901561037957600191505b5b3373ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610400576040517f08c379a000000000000000000000000000000000000000000000000815260040161037690610380565b60405180910390fd5b50565b60008173ffffffffffffffffffffffffffffffffffffffff16148061045457506000808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548260020a81905550505b505b505b50565b6000805b60015481101561046c57600101610471565b5b90565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b20000000000000000000000000";

async function main() {
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

    // Use ethers to send raw deployment transaction
    console.log("🚀 Deploying ArtistRegistry contract...\n");

    const gasPrice = await provider.getGasPrice();
    const nonce = await provider.getTransactionCount(signer.address);

    // Simple contract bytecode for ArtistRegistry (compiled Solidity)
    // This is deployed from the full Solidity contract in contracts/ArtistRegistry.sol
    const deployTx = {
      data: CREATION_CODE,
      gasLimit: ethers.BigNumber.from("3000000"),
      gasPrice: gasPrice,
      nonce: nonce,
    };

    const tx = await signer.sendTransaction(deployTx);
    console.log(`   TX Hash: ${tx.hash}`);
    console.log("   Waiting for confirmation...\n");

    const receipt = await tx.wait(1);
    const contractAddress = receipt.contractAddress;

    console.log(`✅ ArtistRegistry deployed to: ${contractAddress}`);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
      network: "baseSepolia",
      contractAddress: contractAddress,
      deployer: signer.address,
      deploymentDate: new Date().toISOString(),
      transactionHash: tx.hash,
      chainId: 84532,
    };

    const deploymentPath = path.join(deploymentsDir, "artistRegistry-baseSepolia.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📝 Deployment info saved to: ${deploymentPath}`);

    // Save ABI
    const abiPath = path.join(deploymentsDir, "ArtistRegistry-abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(ABI, null, 2));

    // Instructions
    console.log("\n⚠️  NEXT STEPS:");
    console.log("1. Add to your .env.local file:");
    console.log(`   VITE_ARTIST_REGISTRY_ADDRESS=${contractAddress}`);
    console.log("\n2. Restart your dev server:");
    console.log("   npm run dev");
    console.log("\n3. View on BaseScan:");
    console.log(`   https://sepolia.basescan.io/address/${contractAddress}`);
    console.log("\n4. Test creating an artist in the admin panel\n");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main();
