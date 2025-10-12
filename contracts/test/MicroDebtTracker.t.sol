// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MicroDebtTracker.sol";

contract MicroDebtTrackerTest is Test {
    MicroDebtTracker public tracker;
    address alice = address(0x1);
    address bob = address(0x2);
    
    function setUp() public {
        tracker = new MicroDebtTracker();
    }
    
    function testAddDebt() public {
        // Alice creates debt: Bob owes Alice $20
        uint256 debtId = tracker.addDebt(alice, bob, 20 ether);
        
        assertEq(debtId, 1);
        
        // Check debt details
        (address creditor, address debtor, uint256 amount, , bool settled) = tracker.debts(debtId);
        assertEq(creditor, alice);
        assertEq(debtor, bob);
        assertEq(amount, 20 ether);
        assertEq(settled, false);
    }
    
    function testSettleDebt() public {
        // Create debt
        uint256 debtId = tracker.addDebt(alice, bob, 20 ether);
        
        // Bob settles it
        vm.prank(bob);
        tracker.settleDebt(debtId);
        
        // Check settled
        (, , , , bool settled) = tracker.debts(debtId);
        assertEq(settled, true);
    }
}