// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CircleScore.sol";

contract CircleScoreTest is Test {
    CircleScore public circleScore;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        circleScore = new CircleScore();
    }

    function testInitialScore() public {
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 500, "Initial score should be 500");
    }

    function testRecordBillSplit() public {
        circleScore.recordBillSplit(alice);
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 505, "Score should increase by 5 after bill split");
    }

    function testMultipleBillSplits() public {
        for (uint i = 0; i < 10; i++) {
            circleScore.recordBillSplit(alice);
        }
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 550, "Score should be 550 after 10 bill splits");
    }

    function testOnTimePayment() public {
        uint256 debtTime = block.timestamp;
        vm.warp(block.timestamp + 12 hours); // Pay within 24 hours

        circleScore.recordPayment(alice, debtTime);
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 510, "Score should increase by 10 for on-time payment");
    }

    function testLatePayment() public {
        uint256 debtTime = block.timestamp;
        vm.warp(block.timestamp + 48 hours); // Pay after 24 hours

        circleScore.recordPayment(alice, debtTime);
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 450, "Score should decrease by 50 for late payment");
    }

    function testLoanRepayment() public {
        circleScore.recordLoanRepayment(alice);
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 550, "Score should increase by 50 for loan repayment");
    }

    function testMaxScore() public {
        // Try to exceed max score
        for (uint i = 0; i < 100; i++) {
            circleScore.recordLoanRepayment(alice);
        }
        uint256 score = circleScore.getScore(alice);
        assertEq(score, 850, "Score should not exceed 850");
    }

    function testMinScore() public {
        // Initialize score first
        circleScore.recordBillSplit(alice);

        // Try to go below min score with late payments
        uint256 debtTime = block.timestamp;
        for (uint i = 0; i < 20; i++) {
            vm.warp(block.timestamp + 48 hours);
            circleScore.recordPayment(alice, debtTime);
            debtTime = block.timestamp;
        }

        uint256 score = circleScore.getScore(alice);
        assertGe(score, 300, "Score should not go below 300");
    }

    function testBorrowingPower() public {
        // Score 500 should give ~$200 borrowing power
        uint256 power = circleScore.calculateBorrowingPower(alice);
        assertEq(power, 200 * 10**6, "Score 500 should allow $200");

        // Increase score to 700
        for (uint i = 0; i < 40; i++) {
            circleScore.recordLoanRepayment(alice); // 50 points each
        }

        power = circleScore.calculateBorrowingPower(alice);
        assertGe(power, 1000 * 10**6, "Score 700+ should allow $1000+");
    }

    function testScoreDetails() public {
        circleScore.recordBillSplit(alice);
        circleScore.recordLoanRepayment(alice);

        CircleScore.UserScore memory details = circleScore.getScoreDetails(alice);

        assertEq(details.billsSplit, 1, "Should have 1 bill split");
        assertEq(details.loansRepaid, 1, "Should have 1 loan repaid");
        assertEq(details.totalScore, 555, "Total score should be 555");
    }

    function testIsEligibleForLoan() public {
        bool eligible = circleScore.isEligibleForLoan(alice, 100 * 10**6);
        assertTrue(eligible, "Should be eligible for $100 loan with initial score");

        eligible = circleScore.isEligibleForLoan(alice, 300 * 10**6);
        assertFalse(eligible, "Should not be eligible for $300 loan with initial score");
    }
}
