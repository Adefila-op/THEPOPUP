import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`\n📦 Deploying ArtistRegistry with account: ${deployer.address}`);
  console.log(`   Balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);

  // Deploy contract
  console.log("🚀 Deploying ArtistRegistry...");
  const ArtistRegistry = await hre.ethers.getContractFactory("ArtistRegistry");
  const artistRegistry = await ArtistRegistry.deploy();
  await artistRegistry.deployed();

  console.log(`\n✅ ArtistRegistry deployed to: ${artistRegistry.address}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: artistRegistry.address,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  const deploymentPath = path.join(deploymentsDir, `artistRegistry-${hre.network.name}.json`);

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment info saved to: ${deploymentPath}`);

  // Instructions
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Add to your .env.local file:");
  console.log(`   VITE_ARTIST_REGISTRY_ADDRESS=${artistRegistry.address}`);
  console.log("\n2. Verify the contract:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${artistRegistry.address}`);
  console.log("\n3. View on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${artistRegistry.address}`);

  // Get ABI and save it
  const abi = JSON.parse(artistRegistry.interface.format("json"));
  const abiPath = path.join(deploymentsDir, "ArtistRegistry-abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  console.log(`\n✅ ABI saved to: ${abiPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
