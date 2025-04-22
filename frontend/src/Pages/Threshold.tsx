import React, { useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const HomePage: React.FC = () => {
  // Crypto price data with targets for releasing/selling
  const [cryptoData, setCryptoData] = useState({
    ethereum: { price: 2897.05, change: 3.11, target: 3000, threshold: 3000, symbol: 'ETH' },
    solana: { price: 1560.60, change: 2.45, target: 1800, threshold: 1800, symbol: 'SOL' },
    bitcoin: { price: 76866.15, change: 1.72, target: 80000, threshold: 80000, symbol: 'BTC' }
  });

  // Function to check if price has reached the threshold
  const checkThreshold = (current: number, target: number) => {
    return current >= target;
  };

  // Update threshold for a specific crypto
  const updateThreshold = (crypto: string, value: number) => {
    setCryptoData(prev => ({
      ...prev,
      [crypto]: {
        ...prev[crypto as keyof typeof prev],
        threshold: value
      }
    }));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gray-800 rounded-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Buy Crypto Token With Stable Rate</h1>
          <p className="mb-6 text-gray-300">
            Keep your business account and all your finance needs safely organized under one roof. Manage
            money quickly, easily & efficiently. Whether you're alone or leading a team.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md flex items-center font-medium">
            Try For Free
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        {/* Alert Banner (shown when any crypto reaches threshold) */}
        {(checkThreshold(cryptoData.ethereum.price, cryptoData.ethereum.threshold) ||
          checkThreshold(cryptoData.bitcoin.price, cryptoData.bitcoin.threshold) ||
          checkThreshold(cryptoData.solana.price, cryptoData.solana.threshold)) && (
          <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-300 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <div className="mr-2">🔔</div>
              <div>
                <p className="font-medium">Price Alert: One or more cryptocurrencies have reached your target price!</p>
                <p className="text-sm">Consider selling now while the market price is high.</p>
              </div>
            </div>
          </div>
        )}

        {/* Crypto Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bitcoin Card */}
          <div className="bg-gray-800 rounded-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-xs">B</span>
                </div>
                <h3 className="font-bold text-lg">Bitcoin</h3>
              </div>
              <div className={`flex items-center ${cryptoData.bitcoin.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cryptoData.bitcoin.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {cryptoData.bitcoin.change > 0 ? '+' : ''}{cryptoData.bitcoin.change}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">${cryptoData.bitcoin.price.toLocaleString()}</div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Price Threshold: ${cryptoData.bitcoin.threshold.toLocaleString()}</div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" 
                     style={{ width: `${Math.min(100, (cryptoData.bitcoin.price / cryptoData.bitcoin.threshold) * 100)}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {checkThreshold(cryptoData.bitcoin.price, cryptoData.bitcoin.threshold) ? (
                <button className="bg-green-600 hover:bg-green-700 py-2 rounded-md font-medium">
                  Sell Now
                </button>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium">
                  Set Alert
                </button>
              )}
              <button className="bg-purple-600 hover:bg-purple-700 py-2 rounded-md font-medium">
                Mint Token
              </button>
            </div>
          </div>

          {/* Ethereum Card */}
          <div className="bg-gray-800 rounded-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-xs">E</span>
                </div>
                <h3 className="font-bold text-lg">Ethereum</h3>
              </div>
              <div className={`flex items-center ${cryptoData.ethereum.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cryptoData.ethereum.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {cryptoData.ethereum.change > 0 ? '+' : ''}{cryptoData.ethereum.change}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">${cryptoData.ethereum.price.toLocaleString()}</div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Price Threshold: ${cryptoData.ethereum.threshold.toLocaleString()}</div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" 
                     style={{ width: `${Math.min(100, (cryptoData.ethereum.price / cryptoData.ethereum.threshold) * 100)}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {checkThreshold(cryptoData.ethereum.price, cryptoData.ethereum.threshold) ? (
                <button className="bg-green-600 hover:bg-green-700 py-2 rounded-md font-medium">
                  Sell Now
                </button>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium">
                  Set Alert
                </button>
              )}
              <button className="bg-purple-600 hover:bg-purple-700 py-2 rounded-md font-medium">
                Mint Token
              </button>
            </div>
          </div>

          {/* Solana Card */}
          <div className="bg-gray-800 rounded-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-xs">S</span>
                </div>
                <h3 className="font-bold text-lg">Solana</h3>
              </div>
              <div className={`flex items-center ${cryptoData.solana.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cryptoData.solana.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {cryptoData.solana.change > 0 ? '+' : ''}{cryptoData.solana.change}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">${cryptoData.solana.price.toLocaleString()}</div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Price Threshold: ${cryptoData.solana.threshold.toLocaleString()}</div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" 
                     style={{ width: `${Math.min(100, (cryptoData.solana.price / cryptoData.solana.threshold) * 100)}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {checkThreshold(cryptoData.solana.price, cryptoData.solana.threshold) ? (
                <button className="bg-green-600 hover:bg-green-700 py-2 rounded-md font-medium">
                  Sell Now
                </button>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium">
                  Set Alert
                </button>
              )}
              <button className="bg-purple-600 hover:bg-purple-700 py-2 rounded-md font-medium">
                Mint Token
              </button>
            </div>
          </div>
        </div>

        {/* Price Threshold Settings */}
        <div className="bg-gray-800 rounded-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Set Price Thresholds</h2>
          <p className="text-gray-400 mb-4">Set price thresholds to receive alerts when cryptocurrencies reach your target prices for selling or minting.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bitcoin (BTC) Threshold</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-700 rounded-l-md border border-r-0 border-gray-600">$</span>
                <input 
                  type="number" 
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cryptoData.bitcoin.threshold}
                  onChange={(e) => updateThreshold('bitcoin', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ethereum (ETH) Threshold</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-700 rounded-l-md border border-r-0 border-gray-600">$</span>
                <input 
                  type="number" 
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cryptoData.ethereum.threshold}
                  onChange={(e) => updateThreshold('ethereum', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Solana (SOL) Threshold</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-700 rounded-l-md border border-r-0 border-gray-600">$</span>
                <input 
                  type="number" 
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cryptoData.solana.threshold}
                  onChange={(e) => updateThreshold('solana', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Price History Chart */}
        <div className="bg-gray-800 rounded-md p-6">
          <h3 className="text-xl font-bold mb-6">Price History</h3>
          <div className="h-48 bg-gray-900 rounded-md flex items-end justify-between px-4 pt-4">
            <div className="h-1/4 w-8 bg-blue-500 rounded-t-sm"></div>
            <div className="h-2/5 w-8 bg-blue-500 rounded-t-sm"></div>
            <div className="h-1/2 w-8 bg-blue-500 rounded-t-sm"></div>
            <div className="h-1/3 w-8 bg-blue-500 rounded-t-sm"></div>
            <div className="h-3/5 w-8 bg-blue-500 rounded-t-sm"></div>
            <div className="h-4/5 w-8 bg-blue-500 rounded-t-sm"></div>
            <div className="h-full w-8 bg-green-500 rounded-t-sm"></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>1D</span>
            <span>1W</span>
            <span>1M</span>
            <span>3M</span>
            <span>6M</span>
            <span>1Y</span>
            <span>Now</span>
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md flex items-center font-medium">
              View Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;