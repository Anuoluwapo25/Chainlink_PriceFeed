// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FairPay.sol";
import "../src/JobEscrow.sol";
import "../src/Token/SimpleToken.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FairPayTest is Test {
    FairPay public fairPay;
    SimpleERC20 public token;
    
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;
    
    function setUp() public {
        fairPay = new FairPay();
        token = new SimpleERC20("Test Token", "TT", INITIAL_SUPPLY);

        
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        
        vm.deal(owner, 100 ether);
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
        
        token.transfer(user1, 10000 ether);
        token.transfer(user2, 10000 ether);
    }
    
    function testInitialState() public {
        assertEq(fairPay.owner(), owner);
        assertEq(fairPay.platformFee(), 250); 
        assertEq(fairPay.organizationCount(), 0);
    }
    
    function testCreateOrganization() public {
        fairPay.createOrganization("Test Org", "A test organization");
        
        assertEq(fairPay.organizationCount(), 1);
        
        (address orgOwner, string memory name, string memory description, bool isActive, uint256 createdAt) = fairPay.organizations(1);
        
        assertEq(orgOwner, owner);
        assertEq(name, "Test Org");
        assertEq(description, "A test organization");
        assertTrue(isActive);
        assertGt(createdAt, 0);
        
        assertTrue(fairPay.organizationMembers(1, owner));
    }
    
    function testAddRemoveMember() public {
        fairPay.createOrganization("Test Org", "A test organization");
        

        fairPay.addMember(1, user1);
        assertTrue(fairPay.organizationMembers(1, user1));
        
        fairPay.addMember(1, user2);
        assertTrue(fairPay.organizationMembers(1, user2));
        
        fairPay.removeMember(1, user1);
        assertFalse(fairPay.organizationMembers(1, user1));
        
        vm.expectRevert("Cannot remove owner");
        fairPay.removeMember(1, owner);
    }
    

    
    function testCreateJob() public {
        fairPay.createOrganization("Test Org", "A test organization");
        
        uint256 amount = 100 ether;
        token.approve(address(fairPay), amount);
        
        address payable jobAddress = payable(fairPay.createJob(
            1,                      
            "Test Job",             
            "A test job",          
            amount,                 
            3,                      
            address(token)          
        ));
        
        address[] memory jobs = fairPay.getOrganizationJobs(1);
        assertEq(jobs.length, 1);
        assertEq(jobs[0], jobAddress);
        
        JobEscrow job = JobEscrow(jobAddress);
        assertEq(job.platform(), address(fairPay));
        assertEq(job.employer(), owner);  
        assertEq(job.organizationId(), 1);
        assertEq(job.title(), "Test Job");
        assertEq(job.description(), "A test job");
        assertEq(job.totalPayment(), amount);
        assertEq(job.token(), address(token));
        assertEq(job.platformFee(), 250);  
    }
    

    // function testNonMemberCannotCreateJob() public {
    //     fairPay.createOrganization("Test Org", "A test organization");
        
    //     vm.prank(user3);  
    //     vm.expectRevert("Not a member of organization");
    //     fairPay.createJob(
    //         1,                    
    //         "Test Job",           
    //         "A test job",         
    //         100 ether,             
    //         3,                     
    //         address(token)
    //     );
    // }
    
    function testCreateJobWithInvalidMilestoneCount() public {
        fairPay.createOrganization("Test Org", "A test organization");
        
        vm.expectRevert("Must have at least one milestone");
        fairPay.createJob(
            1,                      
            "Test Job",             
            "A test job",          
            100 ether,             
            0,                      
            address(token)
        );
    }
    
    function testUpdatePlatformFee() public {
        assertEq(fairPay.platformFee(), 250);
        
        fairPay.updatePlatformFee(500);  
        assertEq(fairPay.platformFee(), 500);
        
  
        vm.expectRevert("Fee cannot exceed 10%");
        fairPay.updatePlatformFee(1100);
    }
    
   
    // function testNonOwnerCannotUpdatePlatformFee() public {
    //     vm.prank(user1);
    //     vm.expectRevert("Ownable: caller is not the owner");
    //     fairPay.updatePlatformFee(500);
    // }
    
    function testWithdrawETHFees() public {
        vm.deal(address(fairPay), 1 ether);
        
        uint256 initialBalance = address(owner).balance;
        
        fairPay.withdrawFees(address(0));
        
        assertEq(address(owner).balance, initialBalance + 1 ether);
        assertEq(address(fairPay).balance, 0);
    }
    

    function testWithdrawERC20Fees() public {
        token.transfer(address(fairPay), 100 ether);
        
        uint256 initialBalance = token.balanceOf(owner);
        

        fairPay.withdrawFees(address(token));
        
        assertEq(token.balanceOf(owner), initialBalance + 100 ether);
        assertEq(token.balanceOf(address(fairPay)), 0);
    }
    
    function testCannotWithdrawIfNoBalance() public {
        vm.expectRevert("No ETH to withdraw");
        fairPay.withdrawFees(address(0));
        
        vm.expectRevert("No tokens to withdraw");
        fairPay.withdrawFees(address(token));
    }
    
    // function testNonOwnerCannotWithdrawFees() public {
    //     vm.deal(address(fairPay), 1 ether);
        
    //     vm.prank(user1);
    //     vm.expectRevert("Ownable: caller is not the owner");
    //     fairPay.withdrawFees(address(0));
    // }
}