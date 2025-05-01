import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import PriceMonitoringActionABI from '../abis/PriceMonitor2.json';
import setupPriceFeeds from '../utilities/SetPrice';

export interface ContractPriceData {
  [key: string]: string;
}

interface BlockchainDataProviderProps {
  onDataLoaded: (data: {
    ethPrice: string;
    priceThreshold: string;
    isThresholdActive: boolean;
    contractPrices: ContractPriceData;
  }) => void;
}

const PRICE_PAIRS = [
  "ETH/USD",
  "BTC/USD",
  "DIA/USD",
  "LINK/USD",
  "USDC/USD",
  "USDT/USD"
];

const contractAddress: string = "0xa176cC9450730Ae5D8C2b426291C86f84468aD55";

const BlockchainDataProvider: React.FC<BlockchainDataProviderProps> = ({ onDataLoaded }) => {
  const testContract = async (): Promise<string> => {
    try {
      if (typeof window.ethereum === 'undefined') return "No Ethereum provider";
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.name, "chainId:", network.chainId);
      
      // Check if contract exists
      const bytecode = await provider.getCode(contractAddress);
      if (bytecode === '0x') {
        return "No contract at address";
      }
      
      const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, provider);
      
      try {
        const admin = await contract.admin();
        console.log("Contract admin:", admin);
        return "Contract connection successful";
      } catch (adminError) {
        console.error("Admin call failed:", adminError);
        return "Contract function error";
      }
    } catch (error) {
      console.error("Test failed:", error);
      return "Test failure";
    }
  };
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const testResult = await testContract();
        console.log("Contract test result:", testResult);
        
        if (testResult !== "Contract connection successful") {
          console.error("Contract test failed. Check deployment and ABI.");
          onDataLoaded({
            ethPrice: "0.00",
            priceThreshold: "1500.00",
            isThresholdActive: false,
            contractPrices: { 'ETH': "0.00" }
          });
          return;
        }
        
        console.log("Setting up price feeds...");
        const setupSuccess = await setupPriceFeeds();
        console.log("Price feed setup result:", setupSuccess);
        
        await loadBlockchainData();
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    
    initialize();
    
    const interval = setInterval(() => {
      loadBlockchainData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadBlockchainData = async (): Promise<void> => {
    try {
      console.log("Loading blockchain data...");
      
      if (typeof window.ethereum === 'undefined') {
        console.error("Ethereum provider not found.");
        
        onDataLoaded({
          ethPrice: "0.00",
          priceThreshold: "1500.00", 
          isThresholdActive: false,
          contractPrices: { 'ETH': "0.00" }
        });
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, provider);
      
      const priceData: ContractPriceData = {};
      let ethPrice = "0.00";
      let thresholdFormatted = "1500.00";
      let thresholdActive = false;
      
      const pricePromises = PRICE_PAIRS.map(async (pricePair) => {
        try {
          console.log(`Fetching price for ${pricePair}...`);
          const priceRaw = await contract.getPriceInUSD(pricePair);
          console.log(`Raw price for ${pricePair}:`, priceRaw.toString());
          
          const symbol = pricePair.split('/')[0];
          
          const formattedPrice = (Number(priceRaw) / 10**8).toFixed(2);
          
          priceData[symbol] = formattedPrice;
          console.log(`${symbol} price: $${formattedPrice}`);
          
          if (pricePair === "ETH/USD") {
            ethPrice = formattedPrice;
          }
          
          return { symbol, price: formattedPrice };
        } catch (priceError) {
          console.error(`Price fetch error for ${pricePair}:`, priceError);
          return null;
        }
      });
      
      await Promise.all(pricePromises);
      
      try {
        console.log("Fetching threshold...");
        const threshold = await contract.ethMintThreshold();
        console.log("Raw threshold:", threshold.toString());
        thresholdFormatted = (Number(threshold) / 10**8).toFixed(2);
        console.log(`Threshold: $${thresholdFormatted}`);
      } catch (thresholdError) {
        console.error("Threshold fetch error:", thresholdError);
      }
      
      try {
        console.log("Fetching active status...");
        thresholdActive = await contract.isThresholdActive();
        console.log(`Active status:`, thresholdActive);
      } catch (activeError) {
        console.error("Active status error:", activeError);
      }

      console.log("Final contract price data:", priceData);
      
      onDataLoaded({
        ethPrice,
        priceThreshold: thresholdFormatted,
        isThresholdActive: thresholdActive,
        contractPrices: priceData
      });
      
    } catch (error) {
      console.error("Data loading error:", error);
      
      onDataLoaded({
        ethPrice: "0.00",
        priceThreshold: "1500.00",
        isThresholdActive: false,
        contractPrices: { 'ETH': "0.00" }
      });
    }
  };
  
  return null;
};

export const mintTokens = async (): Promise<boolean> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      console.error("Ethereum provider not found.");
      return false;
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    console.log("Connected account:", await signer.getAddress());
    
    const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, signer);
    
    console.log("Attempting to mint tokens...");
    const tx = await contract.mintNow(await signer.getAddress());
    console.log("Transaction submitted:", tx.hash);
    
    await tx.wait();
    console.log("Transaction confirmed!");
    
    return true;
  } catch (error: any) {
    console.error("Mint error:", error);
    return false;
  }
};

export default BlockchainDataProvider;