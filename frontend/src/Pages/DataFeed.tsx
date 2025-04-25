import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import BlockchainDataProvider, { ContractPriceData, mintTokens } from '../utilities/LoadBlockchain';
import MarketDataProvider, { CoinData } from '../utilities/Loadmarket';
import ETHfeed from './ETHfeed'

const DashboardPage: React.FC = () => {
  const [activeCurrency, setActiveCurrency] = useState<string>('BTC');
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [topVolume, setTopVolume] = useState<CoinData[]>([]);
  const [biggestIncrease, setBiggestIncrease] = useState<CoinData | null>(null);
  const [biggestDecrease, setBiggestDecrease] = useState<CoinData | null>(null);
  const [contractPrices, setContractPrices] = useState<ContractPriceData>({});
  

  
  const handleMarketDataUpdate = (data: {
    marketData: CoinData[];
    topVolume: CoinData[];
    biggestIncrease: CoinData | null;
    biggestDecrease: CoinData | null;
  }) => {
    setMarketData(data.marketData);
    setTopVolume(data.topVolume);
    setBiggestIncrease(data.biggestIncrease);
    setBiggestDecrease(data.biggestDecrease);
  };

  const handleBlockchainDataLoaded = (data: {
    ethPrice: string;
    priceThreshold: string;
    isThresholdActive: boolean;
    contractPrices: ContractPriceData;
  }) => {
    console.log("Contract prices loaded:", data.contractPrices);
    setContractPrices(data.contractPrices);
  };
  
  
  return (
    <div className="container mx-auto px-4 py-6">
      <BlockchainDataProvider onDataLoaded={handleBlockchainDataLoaded} />
      <MarketDataProvider 
        contractPrices={contractPrices} 
        onDataLoaded={handleMarketDataUpdate} 
      />
      
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
      <ETHfeed />
      
    </div>
  );
};

export default DashboardPage;