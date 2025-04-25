import React, { useState } from 'react';
import BlockchainDataProvider, { ContractPriceData, mintTokens } from '../utilities/LoadBlockchain';

const ETHfeed: React.FC = () => {
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [priceThreshold, setPriceThreshold] = useState<string>('1500.00');
  const [isThresholdActive, setIsThresholdActive] = useState<boolean>(false);
  const [contractPrices, setContractPrices] = useState<ContractPriceData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const handleBlockchainDataUpdate = (data: {
    ethPrice: string;
    priceThreshold: string;
    isThresholdActive: boolean;
    contractPrices: ContractPriceData;
  }) => {
    setEthPrice(data.ethPrice);
    setPriceThreshold(data.priceThreshold);
    setIsThresholdActive(data.isThresholdActive);
    setContractPrices(data.contractPrices);
    setIsLoading(false);
  };
  
  const handleMintNow = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const success = await mintTokens();
      if (success) {
        alert("Tokens minted successfully!");
      } else {
        alert("Failed to mint tokens. Check console for details.");
      }
    } catch (error) {
      console.error("Error in mint process:", error);
      alert("An error occurred during minting.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAboveThreshold: boolean = parseFloat(ethPrice) >= parseFloat(priceThreshold);
  
  const thresholdPercentage = Math.min((parseFloat(ethPrice) / parseFloat(priceThreshold)) * 100, 100);
  
  return (
    <div>
      <BlockchainDataProvider onDataLoaded={handleBlockchainDataUpdate} />
      
      <div className="bg-gray-800 rounded-md p-6">
        <h2 className="text-2xl font-bold mb-4">ETH Price Feed</h2>
        {isLoading ? (
          <div className="text-center py-4">Loading price data from blockchain...</div>
        ) : (
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="bg-gray-700 p-4 rounded-md flex-1">
              <h3 className="text-lg mb-2">Current ETH Price</h3>
              <div className="text-3xl font-bold mb-2">${ethPrice}</div>
              <div className="text-sm text-gray-400 mb-2">
                Source: Smart Contract Price Feed
              </div>
              
              <div className="mt-6">
                <div className="text-sm text-gray-400 mb-1">Price Threshold: ${priceThreshold}</div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${thresholdPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-md flex-1">
              <h3 className="text-lg mb-4">Mint Status</h3>
              {isThresholdActive ? (
                isAboveThreshold ? (
                  <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded-md mb-4">
                    ETH price is above threshold - Minting available!
                  </div>
                ) : (
                  <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-md mb-4">
                    ETH price is below threshold - Minting unavailable
                  </div>
                )
              ) : (
                <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-400 p-3 rounded-md mb-4">
                  Minting is currently disabled
                </div>
              )}
              
              <button 
                className={`w-full py-3 rounded-md font-medium ${
                  isThresholdActive && isAboveThreshold 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                onClick={isThresholdActive && isAboveThreshold ? handleMintNow : undefined}
                disabled={!(isThresholdActive && isAboveThreshold) || isLoading}
              >
                {isLoading ? "Processing..." : "Mint Now"}
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-md flex-1">
              <h3 className="text-lg mb-4">Price History</h3>
              <div className="h-36 bg-gray-800 rounded-md flex items-end justify-between px-2">
                <div className="h-1/3 w-6 bg-blue-500 rounded-t-sm"></div>
                <div className="h-1/2 w-6 bg-blue-500 rounded-t-sm"></div>
                <div className="h-2/3 w-6 bg-blue-500 rounded-t-sm"></div>
                <div className="h-1/2 w-6 bg-blue-500 rounded-t-sm"></div>
                <div className="h-3/4 w-6 bg-blue-500 rounded-t-sm"></div>
                <div className="h-4/5 w-6 bg-blue-500 rounded-t-sm"></div>
                <div className="h-full w-6 bg-green-500 rounded-t-sm"></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>1D</span>
                <span>1W</span>
                <span>1M</span>
                <span>3M</span>
                <span>6M</span>
                <span>1Y</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ETHfeed;