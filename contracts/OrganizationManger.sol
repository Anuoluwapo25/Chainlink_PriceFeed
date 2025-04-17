// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract OrganizationManager {
    address public owner;
    mapping(uint256 => Organization) public Organizations;
    mapping(uint256 => address[]) public OrganizationJobs;
    mapping(uint256 => mapping(address => bool)) public OrganizationMembers;
    
    uint256 public organizationCount;
    
    event OrganizationCreated(uint256 indexed orgId, address indexed owner, string name);
    event JobAdded(uint256 indexed orgId, address indexed jobAddress);
    event WorkerAdded(uint256 indexed orgId, address indexed worker);
    event WorkerRemoved(uint256 indexed orgId, address indexed worker);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not Authorized");
        _;
    }
    
    modifier validOrgOwner(uint256 _orgId) {
        require(Organizations[_orgId].orgOwner == msg.sender, "Not org owner");
        _;
    }
    
    struct Organization {
        address orgOwner;
        string description;
        string name;
        bool isActive;
        uint256 createdAt;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function createOrganization(
        string memory _description,
        string memory _name
    ) external returns(uint256) {
        organizationCount++;
        
        Organizations[organizationCount] = Organization({
            orgOwner: msg.sender,
            description: _description,
            name: _name,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit OrganizationCreated(organizationCount, msg.sender, _name);
        
        return organizationCount;
    }
    
    function getOrganization(uint256 _orgId) external view returns (
        address orgOwner,
        string memory description,
        string memory name,
        bool isActive,
        uint256 createdAt
    ) {
        require(_orgId > 0 && _orgId <= organizationCount, "Invalid organization ID");
        
        Organization memory org = Organizations[_orgId];
        
        return (org.orgOwner, org.description, org.name, org.isActive, org.createdAt);
    }
    
    function addJob(uint256 orgId, address _job) external validOrgOwner(orgId) {
        require(Organizations[orgId].isActive == true, "Organization is not active");
        
        OrganizationJobs[orgId].push(_job);
        emit JobAdded(orgId, _job);
    }
    
    function getOrganizationJobs(uint256 orgId) external view returns(address[] memory) {
        require(Organizations[orgId].isActive == true, "Organization does not exist");
        
        return OrganizationJobs[orgId];
    }
    
    function addWorker(uint256 _orgId, address _worker) external validOrgOwner(_orgId) {
        require(Organizations[_orgId].isActive == true, "Organization does not exist");
        require(_worker != address(0), "Invalid worker address");
        
        OrganizationMembers[_orgId][_worker] = true;
        emit WorkerAdded(_orgId, _worker);
    }
    
    function removeWorker(uint256 _orgId, address _worker) external validOrgOwner(_orgId) {
        require(Organizations[_orgId].isActive == true, "Organization does not exist");
        require(OrganizationMembers[_orgId][_worker], "Worker not a member");
        
        OrganizationMembers[_orgId][_worker] = false;
        emit WorkerRemoved(_orgId, _worker);
    }
    
    function getOrganizationsByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 count = 0;
                for (uint256 i = 1; i <= organizationCount; i++) {
            if (Organizations[i].orgOwner == _owner && Organizations[i].isActive) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= organizationCount; i++) {
            if (Organizations[i].orgOwner == _owner && Organizations[i].isActive) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    function isWorkerInOrganization(uint256 _orgId, address _worker) external view returns (bool) {
        return OrganizationMembers[_orgId][_worker];
    }
}
