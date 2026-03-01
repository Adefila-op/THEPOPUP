import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
});

const NEW_CONTRACT = "0x5edBb39BA27DEDC70d951C12887794D0c8001103";

async function diagnose() {
    console.log(`--- Diagnosing Platform Wallet on ${NEW_CONTRACT} ---`);

    try {
        const platformWallet = await client.readContract({
            address: NEW_CONTRACT as `0x${string}`,
            abi: [{ "inputs": [], "name": "platformWallet", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
            functionName: "platformWallet",
        });
        console.log(`Platform Wallet: ${platformWallet}`);

        const adminBal = await client.readContract({
            address: NEW_CONTRACT as `0x${string}`,
            abi: [{ "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "pendingWithdrawals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }],
            functionName: "pendingWithdrawals",
            args: [platformWallet as `0x${string}`],
        });
        console.log(`pendingWithdrawals[platformWallet]: ${adminBal}`);
    } catch (e: any) {
        console.log("Failed to query contract...", e.shortMessage || e.message);
    }
}

diagnose();
