import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ContractPriceData } from './ LoadBlockchain';

// Define interfaces for data structures
export interface CoinData {
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

// Define the props for the component
interface MarketDataProviderProps {
  contractPrices: ContractPriceData;
  onDataLoaded: (data: {
    marketData: CoinData[];
    topVolume: CoinData[];
    biggestIncrease: CoinData | null;
    biggestDecrease: CoinData | null;
  }) => void;
}

const MarketDataProvider: React.FC<MarketDataProviderProps> = ({ contractPrices, onDataLoaded }) => {
  useEffect(() => {
    // Load data when component mounts or when contractPrices changes
    loadMarketData();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      loadMarketData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [contractPrices, onDataLoaded]);
  
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
          // Use contract price if available, otherwise use API rice
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
      
      // Set top volume coins
      const volumeSorted = [...formattedData].sort((a, b) => 
        parseFloat(b.volume.replace(/[$,]/g, '')) - parseFloat(a.volume.replace(/[$,]/g, ''))
      );
      const topVolume = volumeSorted.slice(0, 2);
      
      // Set biggest increase/decrease
      const increaseSorted = [...formattedData].sort((a, b) => b.change - a.change);
      const decreaseSorted = [...formattedData].sort((a, b) => a.change - b.change);
      
      const biggestIncrease = increaseSorted[0];
      const biggestDecrease = decreaseSorted[0];
      
      // Pass data back to parent component
      onDataLoaded({
        marketData: formattedData,
        topVolume,
        biggestIncrease,
        biggestDecrease
      });
      
    } catch (error) {
      console.error("Error loading market data:", error);
    }
  };
  
  // This component doesn't render anything
  return null;
};

export default MarketDataProvider;