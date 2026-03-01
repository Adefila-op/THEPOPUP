import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
});

const ARTIST_ADDRESS = "0xA14EA127AeAc1Cb8783595080e5e6D740aFe1d1B";

async function diagnose() {
    console.log("--- Diagnosing Backend State on Base Sepolia ---");
    const subAddress = process.env.VITE_POPUP_SUBSCRIPTION_ADDRESS;
    const dropAddress = process.env.VITE_DROP_REGISTRY_ADDRESS;
    console.log("Current POPUP_SUBSCRIPTION:", subAddress);
    console.log("Current DROP_REGISTRY:", dropAddress);

    console.log("\n1. Checking the Subscription address: " + subAddress);
    if (subAddress) {
        try {
            const code = await client.getBytecode({ address: subAddress as `0x${string}` });
            if (!code) {
                console.log(`❌ Address ${subAddress} is NOT a contract on Base Sepolia.`);
            } else {
                console.log(`✅ Code exists at ${subAddress}.`);
                const isWhitelisted = await client.readContract({
                    address: subAddress as `0x${string}`,
                    abi: [{ "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }], "name": "isWhitelisted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }],
                    functionName: "isWhitelisted",
                    args: [ARTIST_ADDRESS as `0x${string}`],
                });
                console.log(`Whitelist status for ${ARTIST_ADDRESS} is: ${isWhitelisted}`);
            }
        } catch (e: any) {
            console.log(`Failed to call isWhitelisted on ${subAddress}: `, e.message);
        }
    }

    console.log(`\n2. Testing DropRegistry at ${dropAddress}`);
    if (dropAddress) {
        try {
            // Old ABI without endTime
            const oldDropAbi = [{ "inputs": [], "name": "getAllDrops", "outputs": [{ "components": [{ "internalType": "uint256", "name": "dropId", "type": "uint256" }, { "internalType": "address", "name": "artist", "type": "address" }, { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "imageHash", "type": "string" }, { "internalType": "uint256", "name": "priceSubscriber", "type": "uint256" }, { "internalType": "uint256", "name": "pricePublic", "type": "uint256" }, { "internalType": "uint256", "name": "supply", "type": "uint256" }, { "internalType": "uint256", "name": "claimed", "type": "uint256" }, { "internalType": "uint256", "name": "createdAt", "type": "uint256" }, { "internalType": "bool", "name": "active", "type": "bool" }], "internalType": "struct DropRegistry.Drop[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }] as const;

            const drops = await client.readContract({
                address: dropAddress as `0x${string}`,
                abi: oldDropAbi,
                functionName: "getAllDrops"
            });
            console.log(`✅ Successfully queried getAllDrops using the OLD ABI!`);
            console.log(drops);
        } catch (e: any) {
            console.log("Failed with old ABI. Trying new ABI...", e.shortMessage || e.message);
        }

        try {
            // New ABI with endTime
            const newDropAbi = [
                {
                    "inputs": [],
                    "name": "getAllDrops",
                    "outputs": [
                        {
                            "components": [
                                { "internalType": "uint256", "name": "dropId", "type": "uint256" },
                                { "internalType": "address", "name": "artist", "type": "address" },
                                { "internalType": "string", "name": "title", "type": "string" },
                                { "internalType": "string", "name": "imageHash", "type": "string" },
                                { "internalType": "uint256", "name": "priceSubscriber", "type": "uint256" },
                                { "internalType": "uint256", "name": "pricePublic", "type": "uint256" },
                                { "internalType": "uint256", "name": "supply", "type": "uint256" },
                                { "internalType": "uint256", "name": "claimed", "type": "uint256" },
                                { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
                                { "internalType": "uint256", "name": "endTime", "type": "uint256" },
                                { "internalType": "bool", "name": "active", "type": "bool" }
                            ],
                            "internalType": "struct DropRegistry.Drop[]",
                            "name": "",
                            "type": "tuple[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];

            const drops = await client.readContract({
                address: dropAddress as `0x${string}`,
                abi: newDropAbi,
                functionName: "getAllDrops"
            });
            console.log(`✅ Successfully queried getAllDrops using the NEW ABI!`);
            console.log(drops);
        } catch (e: any) {
            console.log("Failed with new ABI...", e.shortMessage || e.message);
        }
    }
}

diagnose();
