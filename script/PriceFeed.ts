const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment process...");


  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
 
  console.log("Deploying Token contract...");
  const TokenFactory = await ethers.getContractFactory("SimpleToken");
  const token = await TokenFactory.deploy();
  
  
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`Token deployed to: ${tokenAddress}`);
  

  console.log("Deploying PriceMonitoringAction contract...");
  const PriceMonitoringActionFactory = await ethers.getContractFactory("PriceMonitoringAction");
  const priceMonitor = await PriceMonitoringActionFactory.deploy(tokenAddress);
  
 
  await priceMonitor.waitForDeployment();
  const priceMonitorAddress = await priceMonitor.getAddress();
  console.log(`PriceMonitoringAction deployed to: ${priceMonitorAddress}`);
  

  console.log("Setting up initial price feeds...");
  const ethUsdFeed = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"; 
  const btcUsdFeed = "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298";
  const diaUsdFeed = '0xD1092a65338d049DB68D7Be6bD89d17a0929945e';
  const linkUsdFeed = "0xb113F5A928BCfF189C998ab20d753a47F9dE5A61";
  const usdc = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165";
  const USDT = "0x3ec8593F930EA45ea58c968260e6e9FF53FC934f";
  

  console.log("Registering ETH/USD price feed...");
  const tx1 = await priceMonitor.registerFeed("ETH/USD", ethUsdFeed);
  await tx1.wait();
  console.log("Registered ETH/USD price feed");
  
  console.log("Registering BTC/USD price feed...");
  const tx2 = await priceMonitor.registerFeed("BTC/USD", btcUsdFeed);
  await tx2.wait();
  console.log("Registered BTC/USD price feed");

  console.log("Registering DAI/USD price feed...");
  const tx3 = await priceMonitor.registerFeed("DAI/USD", diaUsdFeed);
  await tx3.wait();
  console.log("Registered DAI/USD price feed");

  console.log("Registering LINK/USD price feed...");
  const tx4 = await priceMonitor.registerFeed("LINK/USD", linkUsdFeed);
  await tx4.wait();
  console.log("Registered LINK/USD price feed");

  console.log("Registering USDC/USD price feed...");
  const tx5 = await priceMonitor.registerFeed("USDC/USD", usdc);
  await tx5.wait();
  console.log("Registered USDC/USD price feed");

  console.log("Registering USDT/USD price feed...");
  const tx6 = await priceMonitor.registerFeed("USDT/USD", USDT);
  await tx6.wait();
  console.log("Registered USDT/USD price feed");
  

  console.log("Granting minting permissions to PriceMonitoringAction...");
  try {
    if (typeof token.grantRole === "function") {
      const MINTER_ROLE = await token.MINTER_ROLE();
      const tx3 = await token.grantRole(MINTER_ROLE, priceMonitorAddress);
      await tx3.wait();
      console.log("Minting permissions granted via role");
    } else if (typeof token.setMinter === "function") {
      const tx3 = await token.setMinter(priceMonitorAddress);
      await tx3.wait();
      console.log("Minting permissions granted via setMinter");
    } else {
      console.log("No minting permission function found on token contract");
    }
  } catch (error) {
    console.log("Error setting minting permissions:");
  }
  
  console.log("Deployment completed successfully!");
  
  console.log("\nContract Addresses:");
  console.log("-----------------");
  console.log(`Token: ${tokenAddress}`);
  console.log(`PriceMonitoringAction: ${priceMonitorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });