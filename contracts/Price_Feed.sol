// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Token.sol";

contract PriceMonitoringAction {
    mapping(string => AggregatorV3Interface) public priceFeeds;
    SimpleToken public token;
    uint public ethMintThreshold;
    bool public isThresholdActive;
    address public admin;
    
  
    mapping(address => mapping(string => uint)) public savedCrypto;
    
    mapping(string => uint) public historicalPeaks;
    
    event TokensMinted(address recipient, uint amount, uint price);
    event CryptoReleased(address recipient, string symbol, uint amount, uint price);
    event TokenSold(address seller, string symbol, uint amount, uint price);
    event ThresholdUpdated(uint newThreshold, bool active);
    event PriceFeedUpdated(string symbol, address feedAddress);

    constructor(address tokenAddress) {
        token = SimpleToken(tokenAddress);
        admin = msg.sender;
        

        ethMintThreshold = 1500 * 10**8; 
        isThresholdActive = true;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function setPriceFeed(string memory symbol, address feedAddress) external onlyAdmin {
        priceFeeds[symbol] = AggregatorV3Interface(feedAddress);
        emit PriceFeedUpdated(symbol, feedAddress);
    }
    
 
    function batchSetPriceFeeds(
        string[] memory symbols, 
        address[] memory feedAddresses
    ) external onlyAdmin {
        require(symbols.length == feedAddresses.length, "Array length mismatch");
        
        for (uint i = 0; i < symbols.length; i++) {
            priceFeeds[symbols[i]] = AggregatorV3Interface(feedAddresses[i]);
            emit PriceFeedUpdated(symbols[i], feedAddresses[i]);
        }
    }

    function getPriceInUSD(string memory symbol) public view returns (uint) {
        require(address(priceFeeds[symbol]) != address(0), "Price feed not found");

        (, int price,,,) = priceFeeds[symbol].latestRoundData();
        require(price > 0, "Invalid price");
        
        return uint(price);
    }
    

    function getDisplayPrice(string memory symbol) public view returns (uint) {
        uint rawPrice = getPriceInUSD(symbol);
        uint8 decimals = priceFeeds[symbol].decimals();
        
        return (rawPrice * 100) / (10 ** decimals);
    }

   
    function mintNow(address to) external {
        require(isThresholdActive, "Minting threshold not active");
        uint currentPrice = getPriceInUSD("ETH/USD");
        require(currentPrice >= ethMintThreshold, "ETH price below threshold");
        
        uint mintAmount = 100 * 10**18; 
        token.mint(to, mintAmount);
        
        emit TokensMinted(to, mintAmount, currentPrice);
    }
    
 
    function updateThreshold(uint newThreshold, bool active) external onlyAdmin {
        ethMintThreshold = newThreshold;
        isThresholdActive = active;
        emit ThresholdUpdated(newThreshold, active);
    }
    
  
    function saveCrypto(string memory symbol, uint amount) external {
        savedCrypto[msg.sender][symbol] += amount;
    }
    
 
    function releaseCrypto(string memory symbol) external {
        uint amount = savedCrypto[msg.sender][symbol];
        require(amount > 0, "No saved crypto of this type");
        
        uint currentPrice = getPriceInUSD(symbol);
        
        if (currentPrice > historicalPeaks[symbol]) {
            historicalPeaks[symbol] = currentPrice;
        }
        
        savedCrypto[msg.sender][symbol] = 0;
        
        emit CryptoReleased(msg.sender, symbol, amount, currentPrice);
    }
    
 
    function sellTokens(string memory symbol, uint amount) external {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient tokens");
        
        uint currentPrice = getPriceInUSD(symbol);
        
        require(currentPrice >= historicalPeaks[symbol] * 90 / 100, "Price not optimal for selling");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit TokenSold(msg.sender, symbol, amount, currentPrice);
    }


    function getAllPrices(string[] memory symbols) external view returns(uint[] memory) {
        uint[] memory prices = new uint[](symbols.length);

        for (uint i = 0; i < symbols.length; i++) {
            if (address(priceFeeds[symbols[i]]) != address(0)) {
                prices[i] = getDisplayPrice(symbols[i]);
            }
        }
        return prices;
    }
    

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be zero address");
        admin = newAdmin;
    }
}