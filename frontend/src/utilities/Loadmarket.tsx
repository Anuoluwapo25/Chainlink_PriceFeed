import React, { useEffect } from 'react';
import axios from 'axios';
import { ContractPriceData } from './LoadBlockchain';

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
  contractPrice?: string; // Optional 
}

interface MarketDataProviderProps {
  contractPrices: ContractPriceData;
  onDataLoaded: (data: {
    marketData: CoinData[];
    topVolume: CoinData[];
    biggestIncrease: CoinData | null;
    biggestDecrease: CoinData | null;
  }) => void;
}


const symbolMapping: { [key: string]: string } = {
  'ETH': 'ETH',
  'BTC': 'BTC',
  'LINK': 'LINK',
  'DIA': 'DIA',
  'USDC': 'USDC',
  'USDT': 'USDT'
};

const MarketDataProvider: React.FC<MarketDataProviderProps> = ({ contractPrices, onDataLoaded }) => {
  useEffect(() => {
    
    loadMarketData();
    
 
    const interval = setInterval(() => {
      loadMarketData();
    }, 30000000);
    
    return () => clearInterval(interval);
  }, [contractPrices, onDataLoaded]);
  
  const loadMarketData = async (): Promise<void> => {
    try {
      console.log("Loading market data with contract prices:", contractPrices);
      
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets/', {
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
      
      interface CoinGeckoResponse {
        id: string;
        symbol: string;
        name: string;
        current_price: number;
        price_change_percentage_24h: number;
        total_volume: number;
        high_24h: number;
        low_24h: number;
      }
      
      const formattedData: CoinData[] = response.data.map((coin: CoinGeckoResponse) => {
        const symbol = coin.symbol.toUpperCase();
        
        const contractSymbol = symbolMapping[symbol] || symbol;
        const contractPrice = contractPrices[contractSymbol];
        
        console.log(`Coin ${symbol}, Contract Symbol: ${contractSymbol}, Contract Price: ${contractPrice}`);
        
        return {
          symbol,
          name: coin.name,
          pair: `${symbol}/AUD`,
          lastPrice: `$${coin.current_price.toLocaleString()}`,
          contractPrice: contractPrice ? `$${contractPrice}` : '-',
          change: parseFloat(coin.price_change_percentage_24h.toFixed(2)),
          volume: `$${coin.total_volume.toLocaleString()}`,
          high24: `$${coin.high_24h?.toLocaleString() || '0.00'}`,
          low24: `$${coin.low_24h?.toLocaleString() || '0.00'}`,
          bid: `$${(coin.current_price * 0.999).toLocaleString()}`,
          ask: `$${(coin.current_price * 1.001).toLocaleString()}`,
          positive: coin.price_change_percentage_24h > 0
        };
      });
      
      Object.entries(contractPrices).forEach(([contractSymbol, price]) => {
        const exists = formattedData.some(coin => 
          coin.symbol === contractSymbol || symbolMapping[coin.symbol] === contractSymbol
        );
        
        if (!exists && price) {
          console.log(`Adding missing contract price for ${contractSymbol}: ${price}`);
          formattedData.push({
            symbol: contractSymbol,
            name: contractSymbol,
            pair: `${contractSymbol}/USD`,
            lastPrice: '-',
            contractPrice: `$${price}`,
            change: 0,
            volume: '-',
            high24: '-',
            low24: '-',
            bid: '-',
            ask: '-',
            positive: true
          });
        }
      });
      
      const validVolumeData = formattedData.filter(coin => coin.volume !== '-');
      const volumeSorted = [...validVolumeData].sort((a, b) => 
        parseFloat(b.volume.replace(/[$,]/g, '')) - parseFloat(a.volume.replace(/[$,]/g, ''))
      );
      const topVolume = volumeSorted.slice(0, 2);
      
      const validChangeData = formattedData.filter(coin => !isNaN(coin.change));
      const increaseSorted = [...validChangeData].sort((a, b) => b.change - a.change);
      const decreaseSorted = [...validChangeData].sort((a, b) => a.change - b.change);
      
      const biggestIncrease = increaseSorted.length > 0 ? increaseSorted[0] : null;
      const biggestDecrease = decreaseSorted.length > 0 ? decreaseSorted[0] : null;
      
      console.log("Final formatted data:", formattedData);
      
      onDataLoaded({
        marketData: formattedData,
        topVolume,
        biggestIncrease,
        biggestDecrease
      });
      
    } catch (error) {
      console.error("Error loading market data:", error);
      
      if (Object.keys(contractPrices).length > 0) {
        const fallbackData: CoinData[] = Object.entries(contractPrices).map(([symbol, price]) => ({
          symbol,
          name: symbol,
          pair: `${symbol}/USD`,
          lastPrice: '-',
          contractPrice: `$${price}`,
          change: 0,
          volume: '-',
          high24: '-',
          low24: '-',
          bid: '-',
          ask: '-',
          positive: true
        }));
        
        onDataLoaded({
          marketData: fallbackData,
          topVolume: [],
          biggestIncrease: null,
          biggestDecrease: null
        });
      }
    }
  };
  
  return null;
};

export default MarketDataProvider;