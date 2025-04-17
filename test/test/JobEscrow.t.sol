// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FairPay.sol";
import "../src/JobEscrow.sol";

contract JobEscrowTest is Test {
    FairPay public fairPay;
    JobEscrow public jobEscrow;
    MockERC20 public token;
    
    address public platform;
    address public employer;
    address public worker;
    address public thirdParty;
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;
    uint256 public constant JOB_PAYMENT = 100 ether;
    uint256 public constant MILESTONE_COUNT = 3;
    
    function setUp() public {
        platform = address(this);
        employer = address(0x1);
        worker = address(0x2);
        thirdParty = address(0x3);
        
        vm.deal(platform, 100 ether);
        vm.deal(employer, 100 ether);
        vm.deal(worker, 100 ether);
        vm.deal(thirdParty, 100 ether);
        
        token = new MockERC20("Test Token", "TT", INITIAL_SUPPLY);
        token.transfer(employer, 10000 ether);
        
        fairPay = new FairPay();
        
        fairPay.createOrganization("Test Org", "A test organization");
        fairPay.addMember(1, employer);
        
        vm.startPrank(employer);
        token.approve(address(fairPay), JOB_PAYMENT);
        address jobAddress = fairPay.createJob(
            1,                      
            "Test Job",             
            "A test job",          
            JOB_PAYMENT,            
            MILESTONE_COUNT,        
            address(token)          
        );
        vm.stopPrank();
        

        jobEscrow = JobEscrow(jobAddress);
    }
    
    function testInitialJobState() public {
        assertEq(jobEscrow.platform(), address(fairPay));
        assertEq(jobEscrow.employer(), employer);
        assertEq(jobEscrow.organizationId(), 1);
        assertEq(jobEscrow.title(), "Test Job");
        assertEq(jobEscrow.description(), "A test job");
        assertEq(jobEscrow.totalPayment(), JOB_PAYMENT);
        assertEq(jobEscrow.token(), address(token));
        assertEq(jobEscrow.platformFee(), 250); 
        assertEq(uint(jobEscrow.status()), uint(JobEscrow.JobStatus.Created));
        assertEq(jobEscrow.worker(), address(0));
        assertEq(jobEscrow.workerConfirmed(), false);
        assertEq(jobEscrow.currentMilestoneIndex(), 0);
    }
    

    function testDepositFunds() public {
        vm.startPrank(employer);
        
        token.approve(address(jobEscrow), JOB_PAYMENT);
        
        jobEscrow.depositFunds();
        vm.stopPrank();
        
        assertEq(token.balanceOf(address(jobEscrow)), JOB_PAYMENT);
    }
    
}