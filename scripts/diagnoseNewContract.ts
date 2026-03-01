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
const NEW_CONTRACT = "0x5edBb39BA27DEDC70d951C12887794D0c8001103";

async function diagnose() {
    console.log(`--- Diagnosing New Contract ${NEW_CONTRACT} ---`);

    try {
        const isWhitelisted = await client.readContract({
            address: NEW_CONTRACT as `0x${string}`,
            abi: [{ "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }], "name": "isWhitelisted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }],
            functionName: "isWhitelisted",
            args: [ARTIST_ADDRESS as `0x${string}`],
        });
        console.log(`Whitelist status for ${ARTIST_ADDRESS} is: ${isWhitelisted}`);
        if (!isWhitelisted) {
            console.log(`❌ The artist is NOT whitelisted on this new contract. That is why the subscribe function is reverting!`);
        }

        const owner = await client.readContract({
            address: NEW_CONTRACT as `0x${string}`,
            abi: [{ "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }],
            functionName: "owner"
        });
        console.log(`Contract Owner: ${owner}`);
    } catch (e: any) {
        console.log("Failed to query contract...", e.shortMessage || e.message);
    }
}

diagnose();
