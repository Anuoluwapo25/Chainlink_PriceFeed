import { ethers } from 'ethers';
import PriceMonitoringActionABI from '../abis/PriceMonitor2.json';

const contractAddress: string = "0xa176cC9450730Ae5D8C2b426291C86f84468aD55";

const PRICE_PAIRS = {
  "ETH/USD": "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  "BTC/USD": "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298",
  "DIA/USD": "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
  "LINK/USD": "0xb113F5A928BCfF189C998ab20d753a47F9dE5A61",
  "USDC/USD": "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
  "USDT/USD": "0x3ec8593F930EA45ea58c968260e6e9FF53FC934f"
};

const setupPriceFeeds = async (): Promise<boolean> => {
  console.log("Starting price feed setup process...");
  
  if (typeof window.ethereum === 'undefined') {
    console.error("Ethereum provider not found. Please install MetaMask.");
    return false;
  }
  
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "chainId:", network.chainId);
    
    const bytecode = await provider.getCode(contractAddress);
    if (bytecode === '0x') {
      console.error("No contract deployed at address:", contractAddress);
      return false;
    }
    
    const signer = provider.getSigner();
    console.log("Connected with account:", await signer.getAddress());
    
    const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, signer);
    
    try {
      const admin = await contract.admin();
      console.log("Contract admin:", admin);
    } catch (adminError) {
      console.error("Error calling admin() - contract may be incorrectly deployed:", adminError);
      return false;
    }

    const results = await Promise.all(
      Object.entries(PRICE_PAIRS).map(async ([pricePair, feedAddress]) => {
        try {
          const registeredFeed = await contract.registeredFeeds(pricePair);
          console.log("Current registered feed for", pricePair, ":", registeredFeed);
          
          if (registeredFeed === ethers.constants.AddressZero) {
            console.log("Registering price feed for", pricePair);
            try {
              const tx = await contract.setPriceFeed(pricePair, feedAddress);
              console.log(`Transaction sent to register ${pricePair}:`, tx.hash);
              
              await tx.wait();
              console.log(`Price feed successfully registered for ${pricePair}!`);
              return true;
            } catch (registerError) {
              console.error(`Error registering price feed for ${pricePair}:`, registerError);
              
              try {
                console.log(`Trying alternative method registerFeed for ${pricePair}...`);
                const tx2 = await contract.registerFeed(pricePair, feedAddress);
                console.log(`Alternative transaction sent for ${pricePair}:`, tx2.hash);
                
                await tx2.wait();
                console.log(`Price feed registered via alternative method for ${pricePair}!`);
                return true;
              } catch (altError) {
                console.error(`Alternative method also failed for ${pricePair}:`, altError);
                return false;
              }
            }
          } else {
            console.log(`Price feed for ${pricePair} already registered:`, registeredFeed);
            
            try {
              if (contract.debugPriceFeed) {
                const feedInfo = await contract.debugPriceFeed(pricePair);
                console.log(`Feed debug info for ${pricePair}:`, feedInfo);
              }
            } catch (debugError) {
              console.log(`Debug function not available for ${pricePair}:`, debugError);
            }
            return true;
          }
        } catch (error) {
          console.error(`Error setting up feed for ${pricePair}:`, error);
          return false;
        }
      })
    );
    
    const allSuccessful = results.every(result => result === true);
    return allSuccessful;
    
  } catch (error) {
    console.error("Setup process failed:", error);
    return false;
  }
};

export default setupPriceFeeds;