// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;
    
    // Use this event to debug any issues
    event PriceReceived(int256 price, uint256 timestamp);
    
    // Constructor that accepts the price feed address as a parameter for flexibility
    constructor(address _priceFeedAddress) {
        // For ETH/USD on Base Sepolia, check the current address from Chainlink docs
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }
    
    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int256) {
    (
        , // roundID (unused)
        int256 price,
        , // startedAt (unused)
        uint256 timeStamp,
        // answeredInRound (unused)
    ) = priceFeed.latestRoundData();
    
    // Validation to prevent returning stale data
    require(timeStamp > 0, "Round not complete");
    
    return price;
}
    
    /**
     * Nonview function that emits the price data as an event
     * Useful for debugging purposes
     */
    function getAndEmitLatestPrice() public returns (int256) {
    (
        , // roundID (unused)
        int256 price,
        , // startedAt (unused)
        uint256 timeStamp,
        // answeredInRound (unused)
    ) = priceFeed.latestRoundData();
    
    emit PriceReceived(price, timeStamp);
    return price;
}
}