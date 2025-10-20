// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICircleScore {
    function recordBillSplit(address _user) external;
    function recordPayment(address _user, uint256 _debtCreationTime) external;
}

contract MicroDebtTracker {

    // Debt structure
    struct Debt {
        address creditor;  // Who is owed money
        address debtor;    // Who owes money
        uint256 amount;    // Amount in PYUSD (or test token)
        uint256 timestamp;
        bool settled;
    }

    // Mapping: debtId => Debt
    mapping(uint256 => Debt) public debts;
    uint256 public debtCounter;

    // Mapping: user => their debt IDs
    mapping(address => uint256[]) public userDebts;

    // CircleScore contract reference
    ICircleScore public circleScore;

    // Events
    event DebtCreated(uint256 indexed debtId, address creditor, address debtor, uint256 amount);
    event DebtSettled(uint256 indexed debtId);

    constructor(address _circleScore) {
        circleScore = ICircleScore(_circleScore);
    }
    
    // Create a new debt
    function addDebt(address _creditor, address _debtor, uint256 _amount) external returns (uint256) {
        debtCounter++;

        debts[debtCounter] = Debt({
            creditor: _creditor,
            debtor: _debtor,
            amount: _amount,
            timestamp: block.timestamp,
            settled: false
        });

        userDebts[_debtor].push(debtCounter);

        // Update score for bill split
        if (address(circleScore) != address(0)) {
            circleScore.recordBillSplit(_debtor);
            circleScore.recordBillSplit(_creditor);
        }

        emit DebtCreated(debtCounter, _creditor, _debtor, _amount);

        return debtCounter;
    }

    // Settle a debt (simplified for MVP)
    function settleDebt(uint256 _debtId) external {
        require(!debts[_debtId].settled, "Already settled");
        require(msg.sender == debts[_debtId].debtor, "Not your debt");

        Debt storage debt = debts[_debtId];
        debt.settled = true;

        // Update score for payment
        if (address(circleScore) != address(0)) {
            circleScore.recordPayment(msg.sender, debt.timestamp);
        }

        emit DebtSettled(_debtId);
    }
    
    // Get all debts for a user
    function getMyDebts() external view returns (uint256[] memory) {
        return userDebts[msg.sender];
    }
    
    // Get debt details
    function getDebt(uint256 _debtId) external view returns (Debt memory) {
        return debts[_debtId];
    }
}