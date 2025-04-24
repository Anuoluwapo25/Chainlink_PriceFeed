
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IFeedPrice {
    event TokensMinted(address recipient, uint amount, uint price);
    event CryptoReleased(address recipient, string symbol, uint amount, uint price);
    event TokenSold(address seller, string symbol, uint amount, uint price);
    event ThresholdUpdated(uint newThreshold, bool active);
    event PriceFeedUpdated(string symbol, address feedAddress);
    event FeedRegistered(string symbol, address feedAddress);
}

  