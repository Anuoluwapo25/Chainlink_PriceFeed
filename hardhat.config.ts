import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_URL || "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 84532
    },
    avalanche: {
      url: process.env.AVALANCHE_RPC,
      accounts: [process.env.PRIVATE_KEY!],
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [process.env.PRIVATE_KEY!],
    }
    
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
