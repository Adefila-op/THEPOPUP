import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const POPUP_SUBSCRIPTION_ADDRESS = process.env.VITE_POPUP_SUBSCRIPTION_ADDRESS as `0x${string}`;

const popupSubscriptionAbi = [
    {
        "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }],
        "name": "isWhitelisted",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

async function checkWhitelist() {
    const client = createPublicClient({
        chain: base,
        transport: http('https://mainnet.base.org'),
    });

    const artistAddress = "0xA14EA127AeAc1Cb8783595080e5e6D740aFe1d1B";

    console.log(`Checking if Artist ${artistAddress} is whitelisted on contract ${POPUP_SUBSCRIPTION_ADDRESS}...`);

    try {
        const isWhitelisted = await client.readContract({
            address: POPUP_SUBSCRIPTION_ADDRESS,
            abi: popupSubscriptionAbi,
            functionName: "isWhitelisted",
            args: [artistAddress as `0x${string}`],
        });

        console.log(`Whitelist status: ${isWhitelisted}`);

        if (!isWhitelisted) {
            console.log("❌ The artist is NOT whitelisted. This is why the subscribe function is failing!");
        } else {
            console.log("✅ The artist IS whitelisted.");
        }
    } catch (error) {
        console.error("Error reading contract:", error);
    }
}

checkWhitelist();
