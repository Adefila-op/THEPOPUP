const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  // Platform wallet (where 25% of fees go)
  // IMPORTANT: Change this to your actual platform wallet address
  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  console.log(`Platform wallet: ${platformWallet}`);

  // Deploy contract
  console.log("\nDeploying PopupSubscription...");
  const PopupSubscription = await hre.ethers.getContractFactory("PopupSubscription");
  const popup = await PopupSubscription.deploy(platformWallet);
  await popup.deployed();

  console.log(`✅ PopupSubscription deployed to: ${popup.address}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: popup.address,
    platformWallet: platformWallet,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentPath = path.join(__dirname, `../deployments/${hre.network.name}.json`);
  const deploymentsDir = path.dirname(deploymentPath);

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment info saved to: ${deploymentPath}`);

  // Also save to .env.local
  console.log("\n⚠️  NEXT STEPS:");
  console.log("1. Copy the contract address above");
  console.log('2. Add to your .env.local file:');
  console.log(`   VITE_POPUP_SUBSCRIPTION_ADDRESS=${popup.address}`);
  console.log("\n   Example .env.local:");
  console.log("   VITE_ONCHAINKIT_API_KEY=your_api_key");
  console.log(`   VITE_POPUP_SUBSCRIPTION_ADDRESS=${popup.address}`);

  // Verify on BaseScan (if applicable)
  if (hre.network.name === "base" || hre.network.name === "baseSepolia") {
    console.log("\n🔗 To verify on BaseScan, run:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${popup.address} "${platformWallet}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
