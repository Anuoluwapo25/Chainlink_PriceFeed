// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import JobManager from './OrganizationManger.sol';
import FeeManager from './FeeManager.sol';
import JobEscrow from './JobEscrow.sol';

contract WorkPlatformCore {
    JobManager public organizationManager;
    FeeManager public feeManager;
    JobEscrow public jobEscrow;
    
    address public owner;
    mapping(address => bool) public supportedTokens;
    
    event JobCreated(address indexed jobAddress, address indexed employer, address indexed worker);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor(
        address _organizationManager,
        address _feeManager,
        address _jobEscrow
    ) {
        owner = msg.sender;
        organizationManager = OrganizationManager(_organizationManager);
        feeManager = FeeManager(_feeManager);
        jobEscrow = JobEscrow(_jobEscrow);
    }
    
    function createJob(
        address _worker,
        uint256 _orgId,
        address _token,
        string memory _title,
        string memory _description
    ) external returns (address) {
        require(supportedTokens[_token], "Token not supported");
        
        // Check if employer is part of the organization
        (address orgOwner,,,bool isActive,) = organizationManager.getOrganization(_orgId);
        require(isActive, "Organization not active");
        require(
            msg.sender == orgOwner || 
            organizationManager.isWorkerInOrganization(_orgId, msg.sender), 
            "Not authorized to create job for this organization"
        );
        
        uint256 platformFee = feeManager.getFee(msg.sender);
        
        // Create new job contract
        JobManager newJob = new JobManager(
            msg.sender, // employer
            _worker,
            feeManager.treasury(),
            _token,
            platformFee
        );
        
        // Register job with organization
        organizationManager.addJob(_orgId, address(newJob));
        
        emit JobCreated(address(newJob), msg.sender, _worker);
        
        return address(newJob);
    }
    
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
        emit TokenAdded(_token);
    }
    
    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
        emit TokenRemoved(_token);
    }
    
    function isTokenSupported(address _token) external view returns (bool) {
        return supportedTokens[_token];
    }
}