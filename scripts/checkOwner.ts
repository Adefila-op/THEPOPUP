import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
});

const subAddress = process.env.VITE_POPUP_SUBSCRIPTION_ADDRESS;

async function checkOwner() {
    console.log(`Checking owner of PopupSubscription at ${subAddress} on Base Sepolia...`);

    try {
        const owner = await client.readContract({
            address: subAddress as `0x${string}`,
            abi: [{ "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
            functionName: "owner"
        });

        console.log(`Contract Owner: ${owner}`);
        console.log(`User's .env Admin Address: ${process.env.VITE_ADMIN_ADDRESS}`);
        console.log(`User's .env Platform Wallet: ${process.env.PLATFORM_WALLET}`);

        if (owner?.toString().toLowerCase() !== process.env.VITE_ADMIN_ADDRESS?.toLowerCase()) {
            console.log("❌ The owner is DIFFERENT from the VITE_ADMIN_ADDRESS! This is why whitelisting is failing. They must switch to the Owner wallet or redeploy.");
        } else {
            console.log("✅ The VITE_ADMIN_ADDRESS matches the Contract Owner.");
        }
    } catch (e: any) {
        console.log(`Failed to fetch owner: `, e.message);
    }
}

checkOwner();
