import React from 'react';
import { ArrowRight, TrendingUp, CreditCard, BarChart2 } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center px-6 py-12 bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="max-w-4xl mx-auto text-center pt-12">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <BarChart2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">PriceFeed Controller</h2>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8">
          Trade Smarter With<br />Price Triggers
        </h1>
        
        <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
          Automatically release saved crypto when market prices peak, sell tokens at optimal times, 
          and mint new tokens when currencies reach target thresholds <br /> all powered by reliable Chainlink price feeds.
        </p>
        
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium flex items-center justify-center mx-auto hover:bg-blue-700">
          Connect Wallet
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-16 relative w-full max-w-5xl">
        <div className="absolute -left-8 bottom-20">
          <div className="rounded-full bg-gray-800 p-4 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl w-64">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 mr-3 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-lg font-medium">Price Monitoring</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Real-time crypto price feeds powered by Chainlink oracles
            </p>
            <div className="h-1 w-full bg-blue-900 mb-4 rounded-full">
              <div className="h-1 bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <div className="text-sm text-gray-400">ETH: $1632.45 / BTC: $65432.10</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl w-64">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 mr-3 bg-green-500 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-lg font-medium">Token Minting</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Mint new tokens when ETH price exceeds $1,500 threshold
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Threshold: $1,500</span>
              <span className="text-sm text-green-400">ACTIVE</span>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm">
              Mint Now
            </button>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl w-64">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 mr-3 bg-purple-500 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5" />
              </div>
              <span className="text-lg font-medium">Smart Actions</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Release saved crypto when prices peak, sell tokens at optimal times
            </p>
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>BTC Release</span>
              <span>SOL Sale</span>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm">
                Release
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md text-sm">
                Sell
              </button>
            </div>
          </div>
          <div className='bg-gray-800/50 w-64 backdrop-blur-md py-6 px-6 bg-purple-500rounded-xl'>
            <div className='flex  gap-5 '>
            <ArrowRight className="h-5 w-5 bg-purple-500 rounded-2xl" />
            <div> Smart Actions </div>
            </div>
            <div className='text-sm'>  Release saved crypto when prices peak, sell tokens at optimal times </div>
            <div className='flex justify-between'>
              <span>BTC Release</span>
              <span>SOL Sale</span>
            </div>
            <div className=' flex justify-between'>
              <button className='bg-purple-500 text-sm'>Release</button>
              <button className='bg-blue-500 text-sm'> Sale</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-20 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/40 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Connect & Configure</h3>
            <p className="text-gray-400 text-sm">
              Connect your wallet and set price thresholds for different cryptocurrencies
            </p>
          </div>
          
          <div className="bg-gray-800/40 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Monitor Prices</h3>
            <p className="text-gray-400 text-sm">
              Our system continuously monitors crypto prices via Chainlink oracles
            </p>
          </div>
          
          <div className="bg-gray-800/40 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Trigger Actions</h3>
            <p className="text-gray-400 text-sm">
              When prices hit your thresholds, automatically mint, release or sell your crypto assets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;