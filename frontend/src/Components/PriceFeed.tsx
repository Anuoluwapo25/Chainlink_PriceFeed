import React, { useState, useEffect } from 'react';
import * as ethers from 'ethers';
import './PriceFeed.css';


declare global {
    interface Window {
      ethereum?: any;
    }
  }
  
// ABI for your PriceFeedConsumer contract
const contractABI = [
  "function getFormattedPrice(string memory symbol) public view returns (uint, uint8)",
  "function getPriceInUSD(string memory symbol) public view returns (uint)",
  "function getDecimals(string memory symbol) public view returns (uint8)",
  "function updatePriceData(string memory symbol) public returns (bool)",
  "function getPriceChangePercentage(string memory symbol) public view returns (int)",
  "function getAllPrices(string[] memory symbols) public view returns (uint[])",
  "function setThresholds(string memory symbol, uint highThreshold, uint lowThreshold) public",
  "function highThresholds(string) public view returns (uint)",
  "function lowThresholds(string) public view returns (uint)",
  "function isAboveHighThreshold(string) public view returns (bool)",
  "function isBelowLowThreshold(string) public view returns (bool)",
  "event ThresholdCrossed(string symbol, uint price, bool crossedHigh, bool crossedLow)"
];

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = "0xYourContractAddressHere";

// List of supported tokens
const SUPPORTED_TOKENS = ["ETH/USD", "BTC/USD", "LINK/USD"];

interface TokenPrice {
  symbol: string;
  price: string;
  changePercentage: string;
  isAboveHigh: boolean;
  isBelowLow: boolean;
  highThreshold: string;
  lowThreshold: string;
}

// Utility functions to handle different ethers versions
const getProvider = () => {
  // Check if window.ethereum exists
  if (window.ethereum) {
    // Try ethers v6 style first
    try {
      // @ts-ignore - Handle potential missing BrowserProvider
      return new ethers.BrowserProvider(window.ethereum);
    } catch (e) {
      // Fall back to ethers v5 style
      try {
        // @ts-ignore - Handle potential missing providers
        return new ethers.providers.Web3Provider(window.ethereum);
      } catch (e2) {
        throw new Error("Could not create provider with ethers");
      }
    }
  }
  throw new Error("No ethereum object found");
};

const getSigner = async (provider: any) => {
  try {
    // Try ethers v6 style (async)
    return await provider.getSigner();
  } catch (e) {
    // Fall back to ethers v5 style (sync)
    return provider.getSigner();
  }
};

const formatUnits = (value: any, decimals: number): string => {
  try {
    // Try ethers v6 style
    // @ts-ignore
    return ethers.formatUnits(value, decimals);
  } catch (e) {
    // Fall back to ethers v5 style
    // @ts-ignore
    return ethers.utils.formatUnits(value, decimals);
  }
};

const parseUnits = (value: string, decimals: number): any => {
  try {
    // Try ethers v6 style
    // @ts-ignore
    return ethers.parseUnits(value, decimals);
  } catch (e) {
    // Fall back to ethers v5 style
    // @ts-ignore
    return ethers.utils.parseUnits(value, decimals);
  }
};

const PriceFeed: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>(SUPPORTED_TOKENS[0]);
  const [newHighThreshold, setNewHighThreshold] = useState<string>('');
  const [newLowThreshold, setNewLowThreshold] = useState<string>('');
  const [thresholdEvents, setThresholdEvents] = useState<any[]>([]);

  // Connect to MetaMask and initialize contract
  useEffect(() => {
    const connectWallet = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          setLoading(true);
          
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          
          // Create provider
          const web3Provider = getProvider();
          setProvider(web3Provider);
          
          // Get signer and create contract instance
          const signer = await getSigner(web3Provider);
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
          setContract(contractInstance);
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            setAccount(accounts[0]);
          });
          
          setLoading(false);
        } else {
          setError('Please install MetaMask to use this dApp');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error connecting to wallet:', err);
        setError('Failed to connect wallet. Please try again.');
        setLoading(false);
      }
    };

    connectWallet();
    
    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      if (!contract) return;
      
      try {
        setLoading(true);
        
        const pricePromises = SUPPORTED_TOKENS.map(async (symbol) => {
          try {
            // Get price in USD (with 2 decimal places)
            const priceRaw = await contract.getPriceInUSD(symbol);
            const price = formatUnits(priceRaw, 2);
            
            // Try to get price change percentage (may fail if not enough history)
            let changePercentage = '0';
            try {
              const changeRaw = await contract.getPriceChangePercentage(symbol);
              changePercentage = formatUnits(changeRaw, 2);
            } catch (err) {
              console.log(`Not enough history for ${symbol} yet.`);
            }
            
            // Get threshold information
            const highThresholdRaw = await contract.highThresholds(symbol);
            const lowThresholdRaw = await contract.lowThresholds(symbol);
            const decimals = await contract.getDecimals(symbol);
            
            const highThreshold = formatUnits(highThresholdRaw, decimals);
            const lowThreshold = formatUnits(lowThresholdRaw, decimals);
            
            const isAboveHigh = await contract.isAboveHighThreshold(symbol);
            const isBelowLow = await contract.isBelowLowThreshold(symbol);
            
            return {
              symbol,
              price,
              changePercentage,
              isAboveHigh,
              isBelowLow,
              highThreshold,
              lowThreshold
            };
          } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err);
            return {
              symbol,
              price: 'Error',
              changePercentage: '0',
              isAboveHigh: false,
              isBelowLow: false,
              highThreshold: '0',
              lowThreshold: '0'
            };
          }
        });
        
        const prices = await Promise.all(pricePromises);
        setTokenPrices(prices);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError('Failed to fetch prices');
        setLoading(false);
      }
    };

    if (contract) {
      fetchPrices();
      // Set up an interval to fetch prices every 30 seconds
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [contract]);

  // Listen for ThresholdCrossed events
  useEffect(() => {
    if (!contract) return;
    
    try {
      // Try to get filter (works differently in different ethers versions)
      const filter = contract.filters.ThresholdCrossed 
        ? contract.filters.ThresholdCrossed() 
        : contract.filters.ThresholdCrossed;
      
      const handleThresholdEvent = (
        symbol: string, 
        price: any, 
        crossedHigh: boolean, 
        crossedLow: boolean
      ) => {
        const timestamp = new Date().toLocaleTimeString();
        const priceFormatted = formatUnits(price, 8); // Assuming 8 decimals
        
        const eventInfo = {
          timestamp,
          symbol,
          price: priceFormatted,
          crossedHigh,
          crossedLow
        };
        
        setThresholdEvents(prev => [eventInfo, ...prev].slice(0, 10)); // Keep last 10 events
      };
      
      contract.on(filter, handleThresholdEvent);
    } catch (err) {
      console.error('Error setting up event listener:', err);
    }
    
    return () => {
      try {
        if (contract.removeAllListeners) {
          contract.removeAllListeners();
        }
      } catch (err) {
        console.error('Error removing event listeners:', err);
      }
    };
  }, [contract]);

  // Update price data on-chain
  const handleUpdatePrice = async (symbol: string) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.updatePriceData(symbol);
      await tx.wait();
      
      // Refresh prices after update
      const priceRaw = await contract.getPriceInUSD(symbol);
      const price = formatUnits(priceRaw, 2);
      
      setTokenPrices(prev => 
        prev.map(token => 
          token.symbol === symbol ? { ...token, price } : token
        )
      );
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating price:', err);
      setError('Failed to update price data');
      setLoading(false);
    }
  };

  // Set new thresholds
  const handleSetThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !selectedToken || !newHighThreshold || !newLowThreshold) return;
    
    try {
      setLoading(true);
      
      // Get decimals for the selected token
      const decimals = await contract.getDecimals(selectedToken);
      
      // Convert threshold values to proper format with decimals
      const highThresholdBN = parseUnits(newHighThreshold, decimals);
      const lowThresholdBN = parseUnits(newLowThreshold, decimals);
      
      // Send transaction to update thresholds
      const tx = await contract.setThresholds(selectedToken, highThresholdBN, lowThresholdBN);
      await tx.wait();
      
      // Update the token prices state with new thresholds
      setTokenPrices(prev => 
        prev.map(token => 
          token.symbol === selectedToken 
            ? { 
                ...token, 
                highThreshold: newHighThreshold, 
                lowThreshold: newLowThreshold 
              } 
            : token
        )
      );
      
      // Clear form
      setNewHighThreshold('');
      setNewLowThreshold('');
      setLoading(false);
    } catch (err) {
      console.error('Error setting thresholds:', err);
      setError('Failed to set thresholds');
      setLoading(false);
    }
  };

  // Format price with trend indicator
  const formatPriceWithTrend = (price: string, changePercentage: string) => {
    if (price === 'Error') return 'Error';
    
    const change = parseFloat(changePercentage);
    const trendClass = change > 0 ? 'price-up' : change < 0 ? 'price-down' : '';
    const trendIcon = change > 0 ? '▲' : change < 0 ? '▼' : '';
    
    return (
      <span className={trendClass}>
        ${price} {trendIcon} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="price-feed-container">
      <h1>Chainlink Price Feed Dashboard</h1>
      
      {account && (
        <div className="account-info">
          Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading price data...</div>
      ) : (
        <div className="content">
          <div className="price-cards">
            {tokenPrices.map((token) => (
              <div 
                key={token.symbol} 
                className={`price-card ${token.isAboveHigh ? 'above-threshold' : ''} ${token.isBelowLow ? 'below-threshold' : ''}`}
              >
                <h2>{token.symbol}</h2>
                <div className="price-value">
                  {formatPriceWithTrend(token.price, token.changePercentage)}
                </div>
                <div className="thresholds">
                  <div className="threshold high">High: ${token.highThreshold}</div>
                  <div className="threshold low">Low: ${token.lowThreshold}</div>
                </div>
                <button 
                  className="update-button" 
                  onClick={() => handleUpdatePrice(token.symbol)}
                  disabled={loading}
                >
                  Update Price
                </button>
              </div>
            ))}
          </div>
          
          <div className="actions-section">
            <h2>Set Price Thresholds</h2>
            <form onSubmit={handleSetThresholds}>
              <div className="form-group">
                <label>Select Token:</label>
                <select 
                  value={selectedToken} 
                  onChange={(e) => setSelectedToken(e.target.value)}
                >
                  {SUPPORTED_TOKENS.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>High Threshold ($):</label>
                <input 
                  type="number" 
                  value={newHighThreshold} 
                  onChange={(e) => setNewHighThreshold(e.target.value)}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Low Threshold ($):</label>
                <input 
                  type="number" 
                  value={newLowThreshold} 
                  onChange={(e) => setNewLowThreshold(e.target.value)}
                  step="0.01" 
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading || !newHighThreshold || !newLowThreshold}
              >
                Set Thresholds
              </button>
            </form>
          </div>
          
          <div className="events-section">
            <h2>Threshold Alerts</h2>
            {thresholdEvents.length === 0 ? (
              <p>No threshold events yet</p>
            ) : (
              <ul className="events-list">
                {thresholdEvents.map((event, index) => (
                  <li key={index} className="event-item">
                    <span className="event-time">{event.timestamp}</span>
                    <span className="event-symbol">{event.symbol}</span>
                    <span className="event-price">${event.price}</span>
                    <span className={`event-type ${event.crossedHigh ? 'crossed-high' : ''} ${event.crossedLow ? 'crossed-low' : ''}`}>
                      {event.crossedHigh ? 'Above High Threshold' : event.crossedLow ? 'Below Low Threshold' : 'Threshold Change'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {!account && !loading && (
        <div className="connect-prompt">
          <p>Please connect your wallet to view price data</p>
        </div>
      )}
    </div>
  );
};

export default PriceFeed;