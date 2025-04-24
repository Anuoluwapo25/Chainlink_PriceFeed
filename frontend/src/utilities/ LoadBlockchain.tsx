import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import PriceMonitoringActionABI from '../abis/PriceMonitor.json';

export interface ContractPriceData {
  [key: string]: string;
}

// Props for the component
interface BlockchainDataProviderProps {
  onDataLoaded: (data: {
    ethPrice: string;
    btcPrice: string;
    priceThreshold: string;
    isThresholdActive: boolean;
    contractPrices: ContractPriceData;
  }) => void;
}

// List of price feed pairs to fetch from contract
const pricePairs: string[] = [
  "ETH/USD",
  "BTC/USD",
  "LINK/USD",
  "AAVE/USD",
  "UNI/USD",
  // Add more pairs as needed
];

// Contract address - replace with your deployed contract address
const contractAddress: string = "0x012466c1a9E5C0165F74203865aC9FE4B7ac317f";

const BlockchainDataProvider: React.FC<BlockchainDataProviderProps> = ({ onDataLoaded }) => {
  useEffect(() => {
    // Load data when component mounts
    loadBlockchainData();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      loadBlockchainData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [onDataLoaded]);
  
  const loadBlockchainData = async (): Promise<void> => {
    try {
      // Connect to provider and contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, provider);
      
      // Create an object to store all prices from contract
      const priceData: ContractPriceData = {};
      let ethPrice = "0";
      let btcPrice = "0";
      
      // Fetch prices for all pairs in our list
      for (const pair of pricePairs) {
        try {
          const priceRaw = await contract.getDisplayPrice(pair);
          const priceFormatted = (priceRaw / 100).toFixed(2);
          priceData[pair.split('/')[0]] = priceFormatted;
          
          // Set specific state for ETH and BTC
          if (pair === "ETH/USD") {
            ethPrice = priceFormatted;
          } else if (pair === "BTC/USD") {
            btcPrice = priceFormatted;
          }
        } catch (pairError) {
          console.error(`Error fetching price for ${pair}:`, pairError);
          priceData[pair.split('/')[0]] = "0.00";
        }
      }
      
      // Get price threshold status
      const threshold = await contract.ethMintThreshold();
      const thresholdFormatted = ethers.utils.formatUnits(threshold, 8);
      
      const thresholdActive = await contract.isThresholdActive();
      
      // Pass data back to parent component
      onDataLoaded({
        ethPrice,
        btcPrice,
        priceThreshold: thresholdFormatted,
        isThresholdActive: thresholdActive,
        contractPrices: priceData
      });
      
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };
  
  // This component doesn't render anything
  return null;
};

export const mintTokens = async (): Promise<boolean> => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, signer);
    
    // Call the mintNow function
    const tx = await contract.mintNow(await signer.getAddress());
    await tx.wait();
    
    return true;
  } catch (error: any) {
    console.error("Error minting tokens:", error);
    return false;
  }
};

export default BlockchainDataProvider;