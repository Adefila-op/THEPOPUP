import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ABI = [
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "pendingWithdrawals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
] as const;

const client = createPublicClient({ chain: baseSepolia, transport: http() });

const TARGET = "0xE95DF082Df2A550EE15507E8F3b6F3FACcbb86A4";
console.log("Checking contract...", TARGET);

async function check() {
    try {
        const adminCheck = await client.readContract({
            address: TARGET as `0x${string}`,
            abi: ABI,
            functionName: "isAdmin",
            args: ["0x78787c263A87f3F664C08aEFD867706FFD0A17fc"],
        });
        console.log("isAdmin YES:", adminCheck);
    } catch (e: any) {
        console.log("isAdmin FAILED:", e.shortMessage || e.message);
    }

    try {
        const balCheck = await client.readContract({
            address: TARGET as `0x${string}`,
            abi: ABI,
            functionName: "pendingWithdrawals",
            args: ["0x78787c263A87f3F664C08aEFD867706FFD0A17fc"],
        });
        console.log("pendingWithdrawals YES:", balCheck);
    } catch (e: any) {
        console.log("pendingWithdrawals FAILED:", e.shortMessage || e.message);
    }
}

check();
