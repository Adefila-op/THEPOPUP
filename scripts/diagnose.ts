import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const client = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org'),
});

const ARTIST_ADDRESS = "0xA14EA127AeAc1Cb8783595080e5e6D740aFe1d1B";

async function diagnose() {
    console.log("--- Diagnosing Backend State ---");
    const subAddress = process.env.VITE_POPUP_SUBSCRIPTION_ADDRESS;
    const dropAddress = process.env.VITE_DROP_REGISTRY_ADDRESS;
    console.log("Current POPUP_SUBSCRIPTION:", subAddress);
    console.log("Current DROP_REGISTRY:", dropAddress);

    // 1. Check if the frontend `subscribe` target address is actually the one in env
    // The user log said: "Contract Call: address: 0x496F03276190FfD9c0f0A99365B2Fcb2fDCe842C"
    console.log("\n1. Checking the weird Subscription address from the logs: 0x496F03276190FfD9c0f0A99365B2Fcb2fDCe842C");
    try {
        const code = await client.getBytecode({ address: "0x496F03276190FfD9c0f0A99365B2Fcb2fDCe842C" });
        if (!code) {
            console.log("❌ Address 0x496F03276190FfD9c0f0A99365B2Fcb2fDCe842C is NOT a contract (no bytecode found). The user probably pasted their own wallet address or a bad string.");
        } else {
            console.log("✅ Code exists at 0x496F... Is it whitelisted?");
            const isWhitelisted = await client.readContract({
                address: "0x496F03276190FfD9c0f0A99365B2Fcb2fDCe842C",
                abi: [{ "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }], "name": "isWhitelisted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }],
                functionName: "isWhitelisted",
                args: [ARTIST_ADDRESS as `0x${string}`],
            });
            console.log(`Whitelist status for ${ARTIST_ADDRESS} is: ${isWhitelisted}`);
        }
    } catch (e: any) {
        console.log("Failed to call isWhitelisted on 0x496F...: ", e.message);
    }

    // 2. Test DropRegistry ABI mismatch
    console.log(`\n2. Testing DropRegistry at ${dropAddress}`);
    try {
        // Old ABI without endTime
        const oldDropAbi = [{ "inputs": [], "name": "getAllDrops", "outputs": [{ "components": [{ "internalType": "uint256", "name": "dropId", "type": "uint256" }, { "internalType": "address", "name": "artist", "type": "address" }, { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "imageHash", "type": "string" }, { "internalType": "uint256", "name": "priceSubscriber", "type": "uint256" }, { "internalType": "uint256", "name": "pricePublic", "type": "uint256" }, { "internalType": "uint256", "name": "supply", "type": "uint256" }, { "internalType": "uint256", "name": "claimed", "type": "uint256" }, { "internalType": "uint256", "name": "createdAt", "type": "uint256" }, { "internalType": "bool", "name": "active", "type": "bool" }], "internalType": "struct DropRegistry.Drop[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }] as const;

        const drops = await client.readContract({
            address: dropAddress as `0x${string}`,
            abi: oldDropAbi,
            functionName: "getAllDrops"
        });
        console.log("✅ Successfully queried getAllDrops using the OLD ABI! This means the user NEVER redeployed DropRegistry, causing the boolean decoding crash on the new frontend ABI.");
    } catch (e: any) {
        console.log("Failed with old ABI. Trying new ABI...", e.shortMessage || e.message);
    }
}

diagnose();
