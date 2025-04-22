import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Plus, DollarSign } from 'lucide-react';

const HomePage: React.FC = () => {
  // Sample data - in a real app, you would fetch this from an API
  const [cryptoData, setCryptoData] = useState([
    { name: 'Bitcoin', symbol: 'BTC', price: 76866.15, change: 2.45, balance: 0.5, threshold: 80000 },
    { name: 'Ethereum', symbol: 'ETH', price: 2897.05, change: 3.11, balance: 2.3, threshold: 3000 },
    { name: 'Solana', symbol: 'SOL', price: 1560.60, change: 5.22, balance: 10, threshold: 1800 }
  ]);

  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prev => 
        prev.map(crypto => ({
          ...crypto,
          price: +(crypto.price * (1 + (Math.random() * 0.01 - 0.005))).toFixed(2),
          change: +(crypto.change + (Math.random() * 0.4 - 0.2)).toFixed(2)
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cryptoData.forEach(crypto => {
      if (crypto.price > crypto.threshold && !notifications.includes(`${crypto.name} is above your sell threshold of $${crypto.threshold}!`)) {
        setNotifications(prev => [...prev, `${crypto.name} is above your sell threshold of $${crypto.threshold}!`]);
      }
    });
  }, [cryptoData, notifications]);

  const handleSell = (cryptoName: string) => {
    alert(`Selling ${cryptoName} at current market price`);
  };

  const handleMint = (cryptoName: string) => {
    alert(`Minting ${cryptoName} at current market price`);
  };

  const handleSetThreshold = (index: number) => {
    const newThreshold = prompt(`Enter new price threshold for ${cryptoData[index].name}:`, cryptoData[index].threshold.toString());
    
    if (newThreshold && !isNaN(+newThreshold)) {
      setCryptoData(prev => 
        prev.map((crypto, i) => 
          i === index ? {...crypto, threshold: +newThreshold} : crypto
        )
      );
    }
  };

  const clearNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">CryptoBalance Manager</h1>
          <p className="mt-2">Monitor, sell, and mint crypto at optimal market rates</p>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Price Alerts</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {notifications.map((notification, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <p className="text-yellow-800">{notification}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSell(notification.split(' ')[0])}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Sell Now
                    </button>
                    <button 
                      onClick={() => clearNotification(index)}
                      className="bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cryptoData.map((crypto, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">{crypto.name}</h3>
                  {crypto.change > 0 ? 
                    <div className="flex items-center text-green-500">
                      <TrendingUp size={16} className="mr-1" />
                      +{crypto.change}%
                    </div> : 
                    <div className="flex items-center text-red-500">
                      <TrendingDown size={16} className="mr-1" />
                      {crypto.change}%
                    </div>
                  }
                </div>
                <div className="text-2xl font-bold mb-1">${crypto.price.toLocaleString()}</div>
                <div className="text-gray-500 mb-4">Balance: {crypto.balance} {crypto.symbol} (${(crypto.balance * crypto.price).toLocaleString()})</div>
                
                <div className="flex justify-between">
                  <button 
                    onClick={() => handleSell(crypto.name)}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <DollarSign size={16} className="mr-1" />
                    Sell
                  </button>
                  <button 
                    onClick={() => handleMint(crypto.name)}
                    className="bg-purple-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Mint
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Thresholds */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Price Thresholds</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="mb-4">Set price thresholds to receive alerts when cryptocurrencies reach your target prices</p>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Asset</th>
                  <th className="text-left py-2">Current Price</th>
                  <th className="text-left py-2">Threshold</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {cryptoData.map((crypto, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{crypto.name}</td>
                    <td className="py-3">${crypto.price.toLocaleString()}</td>
                    <td className="py-3">${crypto.threshold.toLocaleString()}</td>
                    <td className="py-3">
                      <button 
                        onClick={() => handleSetThreshold(index)}
                        className="bg-gray-200 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto">
            Advanced Trading Options
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;