import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const HomePage: React.FC = () => {
  // Contract-based thresholds (from your smart contract)
  const CONTRACT_ETH_THRESHOLD = 1500;
  
  // Crypto price data with initial values
  const [cryptoData, setCryptoData] = useState({
    ethereum: { price: 2897.05, change: 3.11, symbol: 'ETH/USD', contractAddress: '0x694AA1769357215DE4FAC081bf1f309aDC325306' },
    bitcoin: { price: 76866.15, change: 1.72, symbol: 'BTC/USD', contractAddress: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43' }
  });

  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false);

  // Function to check if price meets contract threshold for ETH
  const canMintOrTransfer = () => {
    return cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD;
  };

  // Simulate fetching prices (in real app, would connect to web3 provider and call contract)
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev => ({
        ethereum: {
          ...prev.ethereum,
          price: +(prev.ethereum.price * (1 + (Math.random() * 0.01 - 0.005))).toFixed(2),
          change: +(prev.ethereum.change + (Math.random() * 0.4 - 0.2)).toFixed(2)
        },
        bitcoin: {
          ...prev.bitcoin,
          price: +(prev.bitcoin.price * (1 + (Math.random() * 0.01 - 0.005))).toFixed(2),
          change: +(prev.bitcoin.change + (Math.random() * 0.4 - 0.2)).toFixed(2)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock function to connect wallet (in real app, would use ethers.js or web3.js)
  const connectWallet = () => {
    setWalletConnected(true);
  };

  // Mock function to call contract methods (in real app, would use contract interaction)
  const mintTokens = () => {
    if (!canMintOrTransfer()) {
      alert("ETH price is below threshold. Cannot mint tokens.");
      return;
    }
    alert("Calling mintIfPriceHigh() contract function...");
    // In real implementation: contract.mintIfPriceHigh(walletAddress)
  };

  const transferTokens = () => {
    if (!canMintOrTransfer()) {
      alert("ETH price is below threshold. Cannot transfer tokens.");
      return;
    }
    alert("Calling transferIfPriceHigh() contract function...");
    // In real implementation: contract.transferIfPriceHigh(recipientAddress, amount)
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header/Hero Section */}
        <div className="bg-gray-800 rounded-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Buy Crypto Token With Stable Rate</h1>
              <p className="text-gray-300">
                Keep your business account and all your finance needs safely organized under one roof.
              </p>
            </div>
            {!walletConnected ? (
              <button 
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium">
                Connect Wallet
              </button>
            ) : (
              <div className="bg-green-900/30 border border-green-500 text-green-400 px-4 py-2 rounded-md">
                Wallet Connected
              </div>
            )}
          </div>
        </div>

        {/* Contract Info Banner */}
        <div className="bg-blue-900/30 border border-blue-500 text-blue-300 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-medium">Smart Contract Thresholds</p>
              <p className="text-sm mt-1">
                This platform uses Chainlink price feeds to enable transactions only when ETH 
                price is above $1,500. Minting and transfers are automatically enabled when 
                this condition is met.
              </p>
            </div>
          </div>
        </div>

        {/* Price Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ethereum Card */}
          <div className="bg-gray-800 rounded-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-xs">E</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Ethereum</h3>
                  <div className="text-xs text-gray-400">Chainlink Feed: {cryptoData.ethereum.symbol}</div>
                </div>
              </div>
              <div className={`flex items-center ${cryptoData.ethereum.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cryptoData.ethereum.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {cryptoData.ethereum.change > 0 ? '+' : ''}{cryptoData.ethereum.change}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">${cryptoData.ethereum.price.toLocaleString()}</div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Contract Threshold: ${CONTRACT_ETH_THRESHOLD.toLocaleString()}</div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`${cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD ? 'bg-green-500' : 'bg-blue-500'} h-2.5 rounded-full`} 
                  style={{ width: `${Math.min(100, (cryptoData.ethereum.price / CONTRACT_ETH_THRESHOLD) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            {cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD ? (
              <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded-md mb-4">
                ETH price is above threshold - Contract functions available!
              </div>
            ) : (
              <div className="bg-yellow-900/30 border border-yellow-500 text-yellow-400 p-3 rounded-md mb-4">
                ETH price is below threshold - Contract functions locked
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={mintTokens}
                className={`py-2 rounded-md font-medium ${
                  cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={cryptoData.ethereum.price < CONTRACT_ETH_THRESHOLD}
              >
                Mint Tokens
              </button>
              <button 
                onClick={transferTokens}
                className={`py-2 rounded-md font-medium ${
                  cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={cryptoData.ethereum.price < CONTRACT_ETH_THRESHOLD}
              >
                Transfer Tokens
              </button>
            </div>
          </div>

          {/* Bitcoin Card */}
          <div className="bg-gray-800 rounded-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-xs">B</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Bitcoin</h3>
                  <div className="text-xs text-gray-400">Chainlink Feed: {cryptoData.bitcoin.symbol}</div>
                </div>
              </div>
              <div className={`flex items-center ${cryptoData.bitcoin.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cryptoData.bitcoin.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {cryptoData.bitcoin.change > 0 ? '+' : ''}{cryptoData.bitcoin.change}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">${cryptoData.bitcoin.price.toLocaleString()}</div>
            
            <div className="text-sm text-gray-400 mb-4">
              BTC price is monitored by the contract but does not affect token minting or transfers.
            </div>
            
            <div className="h-36 bg-gray-900 rounded-md flex items-end justify-between px-2">
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

        {/* Contract Function Cards */}
        <div className="bg-gray-800 rounded-md p-6">
          <h2 className="text-xl font-bold mb-6">Contract Functions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mint Function Card */}
            <div className="bg-gray-700 p-5 rounded-md">
              <h3 className="text-lg font-bold mb-2">mintIfPriceHigh()</h3>
              <p className="text-sm text-gray-400 mb-4">
                This function mints 100 tokens to your address when ETH price is above $1,500.
              </p>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-1">Function Requirements:</div>
                <div className="flex items-center mb-1">
                  <div className={`w-3 h-3 rounded-full mr-2 ${cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">ETH price must be above $1,500</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${walletConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Wallet must be connected</span>
                </div>
              </div>
              
              <button 
                onClick={mintTokens}
                className={`w-full py-3 rounded-md font-medium ${
                  cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD && walletConnected
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={cryptoData.ethereum.price < CONTRACT_ETH_THRESHOLD || !walletConnected}
              >
                Mint 100 Tokens
              </button>
            </div>
            
            {/* Transfer Function Card */}
            <div className="bg-gray-700 p-5 rounded-md">
              <h3 className="text-lg font-bold mb-2">transferIfPriceHigh()</h3>
              <p className="text-sm text-gray-400 mb-4">
                This function transfers tokens when ETH price is above $1,500.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Recipient Address</label>
                <input 
                  type="text" 
                  placeholder="0x..." 
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md"
                />
              </div>
              
              <button 
                onClick={transferTokens}
                className={`w-full py-3 rounded-md font-medium ${
                  cryptoData.ethereum.price >= CONTRACT_ETH_THRESHOLD && walletConnected
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={cryptoData.ethereum.price < CONTRACT_ETH_THRESHOLD || !walletConnected}
              >
                Transfer Tokens
              </button>
            </div>
          </div>
        </div>
        
        {/* Add Token Section */}
        <div className="mt-6 flex justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md flex items-center font-medium">
            Go to Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;