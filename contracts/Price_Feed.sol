// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Token.sol";

contract PriceFeedConsumer {
    mapping(string => AggregatorV3Interface) public priceFeeds;
    SimpleToken public token;

    constructor(address tokenAddress) {
        token = SimpleToken(tokenAddress);

        priceFeeds["ETH/USD"] = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306); 
        priceFeeds["BTC/USD"] = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
    }

    function getPriceInUSD(string memory symbol) public view returns (uint) {
        require(address(priceFeeds[symbol]) != address(0), "Price feed not found");

        (, int price,,,) = priceFeeds[symbol].latestRoundData();
        uint8 decimals = priceFeeds[symbol].decimals();

        return uint(price) / (10 ** (decimals)); 
    }

    function mintIfPriceHigh(address to) external {
        require(getPriceInUSD("ETH/USD") >= 1500, "Price too low");
        token.mint(to, 100 * 10 ** 18); 
    }

    function transferIfPriceHigh(address to, uint amount) external {
        require(getPriceInUSD("ETH/USD") >= 1500, "Price too low");
        require(token.transferFrom(msg.sender, to, amount), "Transfer failed");
    }

    function getAllprice(string[] memory symbols) external view returns(uint[] memory) {
        uint[] memory prices = new uint[](symbols.length);

        for (uint z=0; z < symbols.length; z++) {
            if (address(priceFeeds[symbols[z]]) != address(0)) {
                prices[z] = getPriceInUSD(symbols[z]);
            }
        }
        return prices;
    }

    function updatePriceFeed(string memory pair, address feedAddress) public {
        priceFeeds[pair] = AggregatorV3Interface(feedAddress);

    }
}