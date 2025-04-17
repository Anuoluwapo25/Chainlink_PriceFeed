// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract FeeManager {
    address public owner;
    address public treasury;
    
    // Fee structure in basis points (100 = 1%)
    uint256 public standardFee = 500; // 5% default
    mapping(address => uint256) public customFees; // Custom fees for specific organizations
    
    event FeeUpdated(uint256 newFee);
    event CustomFeeSet(address indexed organization, uint256 fee);
    event TreasuryUpdated(address newTreasury);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor(address _treasury) {
        owner = msg.sender;
        treasury = _treasury;
    }
    
    function setStandardFee(uint256 _fee) external onlyOwner {
        require(_fee <= 3000, "Fee too high"); // Max 30%
        standardFee = _fee;
        emit FeeUpdated(_fee);
    }
    
    function setCustomFee(address _organization, uint256 _fee) external onlyOwner {
        require(_fee <= 3000, "Fee too high"); // Max 30%
        customFees[_organization] = _fee;
        emit CustomFeeSet(_organization, _fee);
    }
    
    function getFee(address _organization) external view returns (uint256) {
        uint256 customFee = customFees[_organization];
        return customFee > 0 ? customFee : standardFee;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
}
