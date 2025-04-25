// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./Token.sol";
import "./Libraries/PriceUtils.sol";

contract PriceMonitoringAction is KeeperCompatibleInterface {
    mapping(string => AggregatorV3Interface) public priceFeeds;
    SimpleToken public token;
    uint public ethMintThreshold;
    bool public isThresholdActive;
    address public admin;
    
    mapping(address => mapping(string => uint)) public savedCrypto;
    mapping(string => uint) public historicalPeaks;
    
    uint public lastUpdateTimestamp;
    uint public updateInterval;
    mapping(string => address) public registeredFeeds;
    string[] public supportedSymbols;

    error NotAdmin();
    error ArrayMismatch();
    error PriceNotFound();
    error InvalidPrice();
    error CannotBeAccountZero();
    error TransferFailed();
    error PriceNotOptimal();
    error ThresholdNotActive();
    error ETHBelowThreshold();
    error InsufficientToken();
    error CryptoNotSaved();
    
    event TokensMinted(address recipient, uint amount, uint price);
    event CryptoReleased(address recipient, string symbol, uint amount, uint price);
    event TokenSold(address seller, string symbol, uint amount, uint price);
    event ThresholdUpdated(uint newThreshold, bool active);
    event PriceFeedUpdated(string symbol, address feedAddress);
    event FeedRegistered(string symbol, address feedAddress);

    constructor(address tokenAddress) {
        token = SimpleToken(tokenAddress);
        admin = msg.sender;
        ethMintThreshold = 1500 * 10**8; 
        isThresholdActive = true;
        
        updateInterval = 86400;
        lastUpdateTimestamp = block.timestamp;
    }
    
    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert NotAdmin();
        }
        _;
    }

    function registerFeed(string memory symbol, address feedAddress) external onlyAdmin {
        registeredFeeds[symbol] = feedAddress;
        priceFeeds[symbol] = AggregatorV3Interface(feedAddress); // Set the priceFeed too
        
        bool exists = false;
        for (uint i = 0; i < supportedSymbols.length; i++) {
            if (keccak256(bytes(supportedSymbols[i])) == keccak256(bytes(symbol))) {
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            supportedSymbols.push(symbol);
        }
        
        emit FeedRegistered(symbol, feedAddress);
    }
    
    function setUpdateInterval(uint newInterval) external onlyAdmin {
        updateInterval = newInterval;
    }

    function checkUpkeep(bytes calldata /* checkData */) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        upkeepNeeded = (block.timestamp - lastUpdateTimestamp) > updateInterval;
        
        if (upkeepNeeded) {
            return (true, abi.encode(supportedSymbols));
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        if ((block.timestamp - lastUpdateTimestamp) <= updateInterval) {
            return;
        }
        
        lastUpdateTimestamp = block.timestamp;
        
        string[] memory symbolsToUpdate = abi.decode(performData, (string[]));
        
        for (uint i = 0; i < symbolsToUpdate.length; i++) {
            string memory symbol = symbolsToUpdate[i];
            address feedAddress = registeredFeeds[symbol];
            
            if (feedAddress != address(0)) {
                priceFeeds[symbol] = AggregatorV3Interface(feedAddress);
                emit PriceFeedUpdated(symbol, feedAddress);
            }
        }
    }

    function setPriceFeed(string memory symbol, address feedAddress) external onlyAdmin {
        priceFeeds[symbol] = AggregatorV3Interface(feedAddress);
        emit PriceFeedUpdated(symbol, feedAddress);
    }
    
    function batchSetPriceFeeds(
        string[] calldata symbols, 
        address[] calldata feedAddresses
    ) external onlyAdmin {
        // FIXED: Changed condition from == to !=
        if (symbols.length != feedAddresses.length) {
            revert ArrayMismatch();
        }
        
        for (uint i = 0; i < symbols.length; i++) {
            priceFeeds[symbols[i]] = AggregatorV3Interface(feedAddresses[i]);
            emit PriceFeedUpdated(symbols[i], feedAddresses[i]);
        }
    }

    // FIXED: Fixed the reversed conditions
    function getPriceInUSD(string memory symbol) public view returns (uint) {
        if (address(priceFeeds[symbol]) == address(0)) {
            revert PriceNotFound();
        }

        (, int price,,,) = priceFeeds[symbol].latestRoundData();
        if (price <= 0) {
            revert InvalidPrice();
        }
        
        return uint(price);
    }
    
    function getDisplayPrice(string memory symbol) public view returns (uint) {
        uint rawPrice = getPriceInUSD(symbol);
        uint8 decimals = priceFeeds[symbol].decimals();
        
        return PriceUtils.formatDisplayPrice(rawPrice, decimals);
    }
   
    // FIXED: Fixed the reversed condition
    function mintNow(address to) external {
        if (!isThresholdActive) {
            revert ThresholdNotActive();
        }
        uint currentPrice = getPriceInUSD("ETH/USD");
        if (currentPrice < ethMintThreshold) {
            revert ETHBelowThreshold();
        }
        
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
    
    // FIXED: Fixed the reversed condition
    function releaseCrypto(string memory symbol) external {
        uint amount = savedCrypto[msg.sender][symbol];
        if (amount == 0) {
            revert CryptoNotSaved();
        }
        
        uint currentPrice = getPriceInUSD(symbol);
        
        if (currentPrice > historicalPeaks[symbol]) {
            historicalPeaks[symbol] = currentPrice;
        }
        
        savedCrypto[msg.sender][symbol] = 0;
        
        emit CryptoReleased(msg.sender, symbol, amount, currentPrice);
    }
    
    // FIXED: Fixed multiple reversed conditions
    function sellTokens(string memory symbol, uint amount) external {
        if (token.balanceOf(msg.sender) < amount) {
            revert InsufficientToken();
        }
        
        uint currentPrice = getPriceInUSD(symbol);
        
        if (!PriceUtils.isOptimalForSelling(currentPrice, historicalPeaks[symbol])) {
            revert PriceNotOptimal();
        }
        
        if (!token.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
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
    
    // FIXED: Fixed the reversed condition
    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) {
            revert CannotBeAccountZero();
        }
        admin = newAdmin;
    }
    
    function getSupportedSymbols() external view returns (string[] memory) {
        return supportedSymbols;
    }
    
    // ADDED: Debug function to help diagnose issues
    function debugPriceFeed(string memory symbol) external view returns (
        address feedAddress,
        uint8 decimals,
        string memory description
    ) {
        feedAddress = address(priceFeeds[symbol]);
        
        if (feedAddress != address(0)) {
            try priceFeeds[symbol].decimals() returns (uint8 dec) {
                decimals = dec;
            } catch {
                decimals = 0;
            }
            
            try priceFeeds[symbol].description() returns (string memory desc) {
                description = desc;
            } catch {
                description = "Unknown";
            }
        }
        
        return (feedAddress, decimals, description);
    }
}