import { ethers } from "hardhat";
import fs from "fs";

const PRICE_FEEDS_MAINNET: Record<string, string> = {
  "ETH/USD":  "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                
  "BTC/USD":  "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  "LINK/USD": "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
  "DAI/USD":  "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
  "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  "SOL/USD":  "0x4ffC43a60e009B551865A93d232E33Fce9f01507"
};


async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name || "sepolia";

  console.log(`Deploying to ${networkName}...`);

  const SimpleTokenFactory = await ethers.getContractFactory("SimpleToken");
  const token = await SimpleTokenFactory.deploy();
  await token.waitForDeployment(); // <- ✅ Recommended in newer versions
  const tokenAddress = await token.getAddress(); // <- ✅ Use getAddress()
  console.log(`SimpleToken deployed to: ${tokenAddress}`);

  const PriceMonitoringFactory = await ethers.getContractFactory("PriceMonitoringAction");
  const priceMonitor = await PriceMonitoringFactory.deploy(tokenAddress);
  await priceMonitor.waitForDeployment();
  const priceMonitorAddress = await priceMonitor.getAddress();
  console.log(`PriceMonitoringAction deployed to: ${priceMonitorAddress}`);

  const symbols = Object.keys(PRICE_FEEDS_MAINNET);
  const addresses = Object.values(PRICE_FEEDS_MAINNET);

  const tx = await priceMonitor.batchSetPriceFeeds(symbols, addresses);
  await tx.wait();
  console.log(`Successfully set ${symbols.length} price feeds`);

  const initialThreshold = ethers.parseUnits("1500", 8); // Make sure `ethers` is v6
  const thresholdTx = await priceMonitor.updateThreshold(initialThreshold, true);
  await thresholdTx.wait();

 

  // Save deployment data
  const deploymentData = {
    networkName,
    token: {
      address: tokenAddress,
    },
    priceMonitor: {
      address: priceMonitorAddress,
    }
  };

  const dir = "./deployments";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(`${dir}/${networkName}-deployment.json`, JSON.stringify(deploymentData, null, 2));

  console.log("Deployment successful ✅");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
