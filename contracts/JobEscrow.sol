// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract JobEscrow {
    using SafeERC20 for IERC20;
    
    address public platform;
    uint256 public platformFee; 
    
    mapping(address => uint256) public jobBalances;
    
    event FundsDeposited(address indexed job, uint256 amount);
    event FundsReleased(address indexed job, address indexed to, uint256 amount);
    
    constructor(address _platform, uint256 _platformFee) {
        platform = _platform;
        platformFee = _platformFee;
    }
    
    function depositFunds(address _job, address _token, uint256 _amount) external {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        jobBalances[_job] += _amount;
        
        emit FundsDeposited(_job, _amount);
    }
    
    function releaseFunds(
        address _job, 
        address _token, 
        address payable _recipient, 
        uint256 _amount
    ) external {
        require(msg.sender == _job, "Only job contract can release funds");
        require(jobBalances[_job] >= _amount, "Insufficient balance");
        
        jobBalances[_job] -= _amount;
        
        uint256 fee = (_amount * platformFee) / 10000;
        uint256 payment = _amount - fee;
        
        IERC20(_token).safeTransfer(_recipient, payment);
        IERC20(_token).safeTransfer(platform, fee);
        
        emit FundsReleased(_job, _recipient, payment);
    }
    
    function getJobBalance(address _job) external view returns (uint256) {
        return jobBalances[_job];
    }
}