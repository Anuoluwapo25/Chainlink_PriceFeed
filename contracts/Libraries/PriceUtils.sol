// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

library PriceUtils {
    function formatDisplayPrice(uint rawPrice, uint8 decimals) internal pure returns (uint) {
        return (rawPrice * 100) / (10 ** decimals);
    }
    
    function isPriceAboveThreshold(uint price, uint threshold) internal pure returns (bool) {
        return price >= threshold;
    }
    
    function isOptimalForSelling(uint currentPrice, uint peakPrice) internal pure returns (bool) {
        return currentPrice >= peakPrice * 90 / 100;
    }
    
    function calculatePercentOfPeak(uint currentPrice, uint peakPrice) internal pure returns (uint) {
        if (peakPrice == 0) return 0;
        return (currentPrice * 100) / peakPrice;
    }
}