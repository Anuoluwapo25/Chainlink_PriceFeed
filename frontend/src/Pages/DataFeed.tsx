import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ethers } from 'ethers';
import axios from 'axios';

// Import ABI with type assertion
import PriceMonitoringActionABI from '../abis/PriceMonitor.json';

// Define interfaces for data structures
interface CoinData {
  symbol: string;
  name: string;
  pair: string;
  lastPrice: string;
  change: number;
  volume: string;
  high24: string;
  low24: string;
  bid: string;
  ask: string;
  positive: boolean;
  contractPrice?: string; // Optional field for contract price data
}

// Interface for our contract price mapping
interface ContractPriceData {
  [key: string]: string;
}

const DashboardPage: React.FC = () => {
  const [activeCurrency, setActiveCurrency] = useState<string>('BTC');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [priceThreshold, setPriceThreshold] = useState<string>('1500.00');
  const [isThresholdActive, setIsThresholdActive] = useState<boolean>(true);
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [topVolume, setTopVolume] = useState<CoinData[]>([]);
  const [biggestIncrease, setBiggestIncrease] = useState<CoinData | null>(null);
  const [biggestDecrease, setBiggestDecrease] = useState<CoinData | null>(null);
  const [contractPrices, setContractPrices] = useState<ContractPriceData>({});
  
  // Contract addresses - replace with your deployed contract addresses
  const contractAddress: string = "0x012466c1a9E5C0165F74203865aC9FE4B7ac317f";
  
  // List of price feed pairs to fetch from contract
  const pricePairs: string[] = [
    "ETH/USD",
    "BTC/USD",
    "LINK/USD",
    "AAVE/USD",
    "UNI/USD",
    // Add more pairs as needed
  ];
  
  useEffect(() => {
    // Load data when component mounts
    loadBlockchainData();
    loadMarketData();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      loadBlockchainData();
      loadMarketData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const loadBlockchainData = async (): Promise<void> => {
    try {
      // Connect to provider and contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, provider);
      
      // Create an object to store all prices from contract
      const priceData: ContractPriceData = {};
      
      // Fetch prices for all pairs in our list
      for (const pair of pricePairs) {
        try {
          const priceRaw = await contract.getDisplayPrice(pair);
          const priceFormatted = (priceRaw / 100).toFixed(2);
          priceData[pair.split('/')[0]] = priceFormatted;
          
          // Set specific state for ETH and BTC
          if (pair === "ETH/USD") {
            setEthPrice(priceFormatted);
          } else if (pair === "BTC/USD") {
            setBtcPrice(priceFormatted);
          }
        } catch (pairError) {
          console.error(`Error fetching price for ${pair}:`, pairError);
          priceData[pair.split('/')[0]] = "0.00";
        }
      }
      
      // Store all contract prices in state
      setContractPrices(priceData);
      
      // Get price threshold status
      const threshold = await contract.ethMintThreshold();
      const thresholdFormatted = ethers.utils.formatUnits(threshold, 8);
      setPriceThreshold(thresholdFormatted);
      
      const thresholdActive = await contract.isThresholdActive();
      setIsThresholdActive(thresholdActive);
      
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };
  
  const loadMarketData = async (): Promise<void> => {
    try {
      // Use CoinGecko API to get market data for coins
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'aud',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        }
      );
      
      // Define interface for API response
      interface CoinGeckoResponse {
        symbol: string;
        name: string;
        current_price: number;
        price_change_percentage_24h: number;
        total_volume: number;
        high_24h: number;
        low_24h: number;
      }
      
      // Format data for the dashboard
      const formattedData: CoinData[] = response.data.map((coin: CoinGeckoResponse) => {
        const symbol = coin.symbol.toUpperCase();
        const contractPrice = contractPrices[symbol];
        
        return {
          symbol,
          name: coin.name,
          pair: `${symbol}/AUD`,
          // Use contract price if available, otherwise use API price
          lastPrice: contractPrice ? `$${contractPrice}` : `$${coin.current_price.toLocaleString()}`,
          change: coin.price_change_percentage_24h.toFixed(2) as unknown as number,
          volume: `$${coin.total_volume.toLocaleString()}`,
          high24: coin.high_24h.toLocaleString(),
          low24: coin.low_24h.toLocaleString(),
          bid: `$${coin.current_price.toLocaleString()}`,
          ask: `$${coin.current_price.toLocaleString()}`,
          positive: coin.price_change_percentage_24h > 0,
          contractPrice: contractPrice ? `$${contractPrice}` : undefined
        };
      });
      
      setMarketData(formattedData);
      
      // Set top volume coins
      const volumeSorted = [...formattedData].sort((a, b) => 
        parseFloat(b.volume.replace(/[$,]/g, '')) - parseFloat(a.volume.replace(/[$,]/g, ''))
      );
      setTopVolume(volumeSorted.slice(0, 2));
      
      // Set biggest increase/decrease
      const increaseSorted = [...formattedData].sort((a, b) => b.change - a.change);
      const decreaseSorted = [...formattedData].sort((a, b) => a.change - b.change);
      
      setBiggestIncrease(increaseSorted[0]);
      setBiggestDecrease(decreaseSorted[0]);
      
    } catch (error) {
      console.error("Error loading market data:", error);
    }
  };
  
  const handleMintNow = async (): Promise<void> => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, PriceMonitoringActionABI.abi, signer);
      
      // Call the mintNow function
      const tx = await contract.mintNow(await signer.getAddress());
      await tx.wait();
      
      alert("Tokens minted successfully!");
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      alert("Failed to mint tokens: " + error.message);
    }
  };
  
  // Calculate if ETH price is above threshold
  const isAboveThreshold: boolean = parseFloat(ethPrice) >= parseFloat(priceThreshold);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Top Volume</h3>
              {topVolume.length > 0 && (
                <div className="flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" /> 
                  {topVolume[0].change}%
                </div>
              )}
            </div>
            <div className="flex items-start justify-between">
              {topVolume.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    <span className="text-xs">{item.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm">{item.symbol}</span>
                      <span className="ml-2 text-xs text-gray-400">{item.name}</span>
                    </div>
                    <div className="text-sm">{item.volume}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Biggest % Increase</h3>
              {biggestIncrease && (
                <div className="flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" /> {biggestIncrease.change}%
                </div>
              )}
            </div>
            {biggestIncrease && (
              <div className="flex items-center">
                <div className="bg-teal-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                  <span className="text-xs">{biggestIncrease.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm">{biggestIncrease.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{biggestIncrease.symbol}</span>
                  </div>
                  <div className="text-sm">{biggestIncrease.volume}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Biggest % Decrease</h3>
              {biggestDecrease && (
                <div className="flex items-center text-red-400 text-sm">
                  <TrendingDown className="w-4 h-4 mr-1" /> {biggestDecrease.change}%
                </div>
              )}
            </div>
            {biggestDecrease && (
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                  <span className="text-xs">{biggestDecrease.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm">{biggestDecrease.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{biggestDecrease.symbol}</span>
                  </div>
                  <div className="text-sm">{biggestDecrease.volume}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-md mb-6">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <div className="flex space-x-4">
            <button className={`px-4 py-2 ${activeCurrency === 'AUD' ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setActiveCurrency('AUD')}>
              AUD Markets
            </button>
            <button className={`px-4 py-2 ${activeCurrency === 'BTC' ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setActiveCurrency('BTC')}>
              BTC Markets
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Pair</th>
                <th className="px-4 py-3">Last Price</th>
                <th className="px-4 py-3">Contract Price</th>
                <th className="px-4 py-3">% Change</th>
                <th className="px-4 py-3">Volume AUD</th>
                <th className="px-4 py-3">24h High</th>
                <th className="px-4 py-3">24h Low</th>
                <th className="px-4 py-3">Bid</th>
                <th className="px-4 py-3">Ask</th>
                <th className="px-4 py-3">24h Chart</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((coin, index) => (
                <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                        coin.symbol === 'BTC' ? 'bg-orange-500' : 
                        coin.symbol === 'LTC' ? 'bg-gray-400' : 
                        coin.symbol === 'ETC' ? 'bg-green-500' : 
                        coin.symbol === 'XRP' ? 'bg-blue-500' : 
                        coin.symbol === 'OMG' ? 'bg-purple-500' : 
                        coin.symbol === 'POWR' ? 'bg-teal-500' : 'bg-yellow-500'
                      }`}>
                        <span className="text-xs">{coin.symbol.charAt(0)}</span>
                      </div>
                      <span>{coin.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{coin.pair}</td>
                  <td className="px-4 py-3">{coin.lastPrice}</td>
                  <td className="px-4 py-3">
                    {contractPrices[coin.symbol] ? `$${contractPrices[coin.symbol]}` : '-'}
                  </td>
                  <td className={`px-4 py-3 ${coin.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.positive ? '+' : ''}{coin.change}%
                  </td>
                  <td className="px-4 py-3">{coin.volume}</td>
                  <td className="px-4 py-3">{coin.high24}</td>
                  <td className="px-4 py-3">{coin.low24}</td>
                  <td className="px-4 py-3">{coin.bid}</td>
                  <td className="px-4 py-3">{coin.ask}</td>
                  <td className="px-4 py-3">
                    <div className="w-24 h-6 bg-gray-700 rounded-sm overflow-hidden">
                      <div className={`h-full ${coin.positive ? 'bg-green-800' : 'bg-red-800'} w-1/2`}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ETH Price Feed Section - Now Updated with Chainlink Data */}
      <div className="bg-gray-800 rounded-md p-6">
        <h2 className="text-2xl font-bold mb-4">ETH Price Feed</h2>
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="bg-gray-700 p-4 rounded-md flex-1">
            <h3 className="text-lg mb-2">Current ETH Price</h3>
            <div className="text-3xl font-bold mb-2">${ethPrice}</div>
            <div className="text-sm text-gray-400 mb-2">
              Source: Smart Contract Price Feed
            </div>
            <div className="text-green-400">
              {marketData.find(coin => coin.symbol === 'ETH')?.change || '0'}% (24h)
            </div>
            
            <div className="mt-6">
              <div className="text-sm text-gray-400 mb-1">Price Threshold: ${priceThreshold}</div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min((parseFloat(ethPrice) / parseFloat(priceThreshold)) * 100, 100)}%` }}
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
            >
              Mint Now
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
      </div>
    </div>
  );
};

export default DashboardPage;