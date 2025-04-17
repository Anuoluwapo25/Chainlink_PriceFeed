// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract JobManager is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    address public employer;
    address public worker;
    address public platform;
    address public token;
    uint256 public milestoneCount;
    uint256 public platformFee; 
    uint256 public currentMilestoneIndex;
    
    enum JobStatus { NotStarted, InProgress, Completed, Disputed, Cancelled }
    enum MilestoneStatus { NotStarted, InProgress, Completed, Disputed }
    
    JobStatus public status;
    
    struct JobDetails {
        address employer;
        string title;
        uint256 orgId;
        string description;
        uint256 platformFee;
    }
    
    struct Milestone {
        string title;
        string description;
        bool paid;
        uint256 amount;
        MilestoneStatus status;
    }
    
    Milestone[] public milestones;
    
    event MilestoneAdded(uint256 indexed index, string title, uint256 amount);
    event MilestoneUpdate(uint256 indexed index, MilestoneStatus status);
    event MilestoneCompleted(uint256 indexed index);
    event Payment(address indexed to, uint256 amount);
    event JobComplete();
    event PaymentReleased(uint256 indexed milestoneIndex, address indexed to, uint256 amount);
    
    error OnlyEmployer();
    error JobNotActive();
    error InvalidMilestone();
    
    modifier onlyEmployer() {
        if (msg.sender != employer) revert OnlyEmployer();
        _;
    }
    
    modifier jobActive() {
        if (status != JobStatus.InProgress) revert JobNotActive();
        _;
    }
    
    constructor(
        address _employer,
        address _worker,
        address _platform,
        address _token,
        uint256 _platformFee
    ) {
        employer = _employer;
        worker = _worker;
        platform = _platform;
        token = _token;
        platformFee = _platformFee;
        status = JobStatus.NotStarted;
    }
    
    function setMilestones(
        string[] calldata _titles,
        string[] calldata _descriptions,
        uint256[] calldata _amounts
    ) external onlyEmployer {
        require(_titles.length == _descriptions.length && _titles.length == _amounts.length, "Arrays must have same length");
        
        for (uint256 i = 0; i < _titles.length; i++) {
            milestones.push(Milestone({
                title: _titles[i],
                description: _descriptions[i],
                paid: false,
                amount: _amounts[i],
                status: i == 0 ? MilestoneStatus.InProgress : MilestoneStatus.NotStarted
            }));
            
            emit MilestoneAdded(milestones.length - 1, _titles[i], _amounts[i]);
        }
        
        if (milestones.length > 0 && status == JobStatus.NotStarted) {
            status = JobStatus.InProgress;
        }
    }
    
    function confirmJob() external onlyEmployer {
        require(status == JobStatus.NotStarted, "Job already started");
        require(milestones.length > 0, "No milestones set");
        
        status = JobStatus.InProgress;
        milestones[0].status = MilestoneStatus.InProgress;
        emit MilestoneUpdate(0, MilestoneStatus.InProgress);
    }
    
    
    function depositTokens(uint256 amount) external onlyEmployer {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }
    
    function approveMilestone(uint256 _index) external onlyEmployer jobActive nonReentrant {
        if (_index >= milestones.length) revert InvalidMilestone();
        if (milestones[_index].status != MilestoneStatus.Completed) revert InvalidMilestone();
        
        uint256 amount = milestones[_index].amount;
        uint256 fee = amount * platformFee / 10000;
        
        milestones[_index].paid = true;
        
        IERC20(token).safeTransfer(worker, amount - fee);
        IERC20(token).safeTransfer(platform, fee);
        
        emit Payment(worker, amount - fee);
        
        if (++currentMilestoneIndex >= milestones.length) {
            status = JobStatus.Completed;
            emit JobComplete();
        } else {
            milestones[currentMilestoneIndex].status = MilestoneStatus.InProgress;
            emit MilestoneUpdate(currentMilestoneIndex, MilestoneStatus.InProgress);
        }
        
        emit MilestoneCompleted(_index);
        emit PaymentReleased(_index, worker, amount - fee);
    }
    
    function completeMilestone(uint256 _index) external {
        require(msg.sender == worker, "Only worker can complete milestone");
        require(_index == currentMilestoneIndex, "Can only complete current milestone");
        require(milestones[_index].status == MilestoneStatus.InProgress, "Milestone not in progress");
        
        milestones[_index].status = MilestoneStatus.Completed;
        emit MilestoneUpdate(_index, MilestoneStatus.Completed);
    }
    
    function cancelJob() external onlyEmployer {
        require(status == JobStatus.InProgress, "Job not in progress");
        status = JobStatus.Cancelled;
        
    }
}