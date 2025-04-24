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
  const ethUsdFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; 
  const btcUsdFeed = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; 
  

  console.log("Registering ETH/USD price feed...");
  const tx1 = await priceMonitor.registerFeed("ETH/USD", ethUsdFeed);
  await tx1.wait();
  console.log("Registered ETH/USD price feed");
  
  console.log("Registering BTC/USD price feed...");
  const tx2 = await priceMonitor.registerFeed("BTC/USD", btcUsdFeed);
  await tx2.wait();
  console.log("Registered BTC/USD price feed");
  

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