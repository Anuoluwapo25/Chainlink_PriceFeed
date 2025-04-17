import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SimpleToken...");
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy();
  await simpleToken.waitForDeployment();
  const tokenAddress = await simpleToken.getAddress();
  console.log("SimpleToken deployed to:", tokenAddress);

  console.log("Deploying PriceFeedConsumer...");
  const PriceFeedConsumer = await ethers.getContractFactory("PriceFeedConsumer");
  const priceFeedConsumer = await PriceFeedConsumer.deploy(tokenAddress);
  await priceFeedConsumer.waitForDeployment();
  console.log("PriceFeedConsumer deployed to:", await priceFeedConsumer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
