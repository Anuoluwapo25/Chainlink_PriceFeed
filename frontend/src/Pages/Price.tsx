import React, { useState } from "react";
import { ethers } from "ethers";
import PriceMonitoringActionABI from '../abis/PriceMonitor2.json';

const contractAddress = "0x5369A06C051dBc83BeCC348B248d9d2D0c7269ED";

const PriceFeed: React.FC = () => {
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string>("");

  const getPrice = async () => {
    setError("");
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const network = await provider.getNetwork();
        if (network.chainId !== 84532) {
          setError("Please switch your MetaMask network to Base Sepolia.");
          return;
        }

        const signer = provider.getSigner();
        const priceFeedContract = new ethers.Contract(
          contractAddress,
          PriceMonitoringActionABI.abi,
          signer
        );

        const result: ethers.BigNumber = await priceFeedContract.getLatestPrice();
        const formattedPrice = ethers.utils.formatUnits(result, 8); 
        console.log("Price:", formattedPrice);
        setPrice(formattedPrice);
      } catch (err) {
        console.error("Error fetching price:", err);
        setError("Failed to fetch price. Check console for details.");
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  return (
    <div>
      <h2>ETH/USD Price</h2>
      <button
        className="mr-10 bg-purple-300 py-4 px-4 items-center"
        onClick={getPrice}
      >
        Fetch Price
      </button>
      {price && <p>Latest Price: ${price}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default PriceFeed;
