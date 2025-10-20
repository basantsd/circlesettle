// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CircleScore
 * @notice On-chain credit score system for CircleSettle
 * @dev Tracks user reputation based on bill splits and payment behavior
 */
contract CircleScore {

    // Score structure
    struct UserScore {
        uint256 totalScore;
        uint256 billsSplit;
        uint256 loansRepaid;
        uint256 latePayments;
        uint256 onTimePayments;
        uint256 lastActivityTimestamp;
    }

    // Mapping: user => their score data
    mapping(address => UserScore) public userScores;

    // Score constants
    uint256 public constant BILL_SPLIT_POINTS = 5;
    uint256 public constant ON_TIME_PAYMENT_BONUS = 10;
    uint256 public constant LOAN_REPAID_POINTS = 50;
    uint256 public constant LATE_PAYMENT_PENALTY = 50;
    uint256 public constant INITIAL_SCORE = 500;
    uint256 public constant MAX_SCORE = 850;
    uint256 public constant MIN_SCORE = 300;

    // Time threshold for "on-time" payment (24 hours)
    uint256 public constant ON_TIME_THRESHOLD = 24 hours;

    // Events
    event ScoreUpdated(address indexed user, uint256 newScore, string reason);
    event BillSplitRecorded(address indexed user, uint256 scoreIncrease);
    event PaymentRecorded(address indexed user, bool onTime, uint256 scoreChange);
    event LoanRepaid(address indexed user, uint256 scoreIncrease);

    /**
     * @notice Get a user's current score
     * @param _user Address of the user
     * @return Current credit score (300-850 range)
     */
    function getScore(address _user) external view returns (uint256) {
        UserScore memory score = userScores[_user];

        // New users get initial score
        if (score.billsSplit == 0 && score.loansRepaid == 0) {
            return INITIAL_SCORE;
        }

        return score.totalScore;
    }

    /**
     * @notice Get detailed score data for a user
     * @param _user Address of the user
     * @return UserScore struct with all score details
     */
    function getScoreDetails(address _user) external view returns (UserScore memory) {
        UserScore memory score = userScores[_user];

        // Initialize if new user
        if (score.billsSplit == 0 && score.loansRepaid == 0 && score.totalScore == 0) {
            score.totalScore = INITIAL_SCORE;
        }

        return score;
    }

    /**
     * @notice Record a new bill split
     * @param _user Address of the user who split a bill
     */
    function recordBillSplit(address _user) external {
        UserScore storage score = userScores[_user];

        // Initialize new user
        if (score.billsSplit == 0 && score.loansRepaid == 0 && score.totalScore == 0) {
            score.totalScore = INITIAL_SCORE;
        }

        score.billsSplit++;
        score.totalScore = _min(score.totalScore + BILL_SPLIT_POINTS, MAX_SCORE);
        score.lastActivityTimestamp = block.timestamp;

        emit BillSplitRecorded(_user, BILL_SPLIT_POINTS);
        emit ScoreUpdated(_user, score.totalScore, "Bill split recorded");
    }

    /**
     * @notice Record a debt payment
     * @param _user Address of the user who made payment
     * @param _debtCreationTime Timestamp when the debt was created
     */
    function recordPayment(address _user, uint256 _debtCreationTime) external {
        UserScore storage score = userScores[_user];

        // Initialize new user
        if (score.billsSplit == 0 && score.loansRepaid == 0 && score.totalScore == 0) {
            score.totalScore = INITIAL_SCORE;
        }

        bool onTime = (block.timestamp - _debtCreationTime) <= ON_TIME_THRESHOLD;

        if (onTime) {
            score.onTimePayments++;
            score.totalScore = _min(score.totalScore + ON_TIME_PAYMENT_BONUS, MAX_SCORE);
            emit PaymentRecorded(_user, true, ON_TIME_PAYMENT_BONUS);
            emit ScoreUpdated(_user, score.totalScore, "On-time payment");
        } else {
            score.latePayments++;
            score.totalScore = _max(score.totalScore - LATE_PAYMENT_PENALTY, MIN_SCORE);
            emit PaymentRecorded(_user, false, LATE_PAYMENT_PENALTY);
            emit ScoreUpdated(_user, score.totalScore, "Late payment penalty");
        }

        score.lastActivityTimestamp = block.timestamp;
    }

    /**
     * @notice Record a loan repayment
     * @param _user Address of the user who repaid a loan
     */
    function recordLoanRepayment(address _user) external {
        UserScore storage score = userScores[_user];

        // Initialize new user
        if (score.billsSplit == 0 && score.loansRepaid == 0 && score.totalScore == 0) {
            score.totalScore = INITIAL_SCORE;
        }

        score.loansRepaid++;
        score.totalScore = _min(score.totalScore + LOAN_REPAID_POINTS, MAX_SCORE);
        score.lastActivityTimestamp = block.timestamp;

        emit LoanRepaid(_user, LOAN_REPAID_POINTS);
        emit ScoreUpdated(_user, score.totalScore, "Loan repaid");
    }

    /**
     * @notice Calculate borrowing power based on score
     * @param _user Address of the user
     * @return Maximum amount user can borrow (in wei/smallest unit)
     */
    function calculateBorrowingPower(address _user) external view returns (uint256) {
        uint256 score = this.getScore(_user);

        // Score 500 = $200 = 200 USDC
        // Score 700 = $1,000 = 1000 USDC
        // Score 850 = $5,000 = 5000 USDC

        if (score < 500) {
            return 0; // Below minimum score
        } else if (score >= 850) {
            return 5000 * 10**6; // 5000 USDC (6 decimals)
        } else if (score >= 700) {
            // Linear interpolation between 1000 and 5000
            uint256 range = score - 700;
            return (1000 * 10**6) + ((range * 4000 * 10**6) / 150);
        } else {
            // Linear interpolation between 200 and 1000
            uint256 range = score - 500;
            return (200 * 10**6) + ((range * 800 * 10**6) / 200);
        }
    }

    /**
     * @notice Check if user is eligible for a loan amount
     * @param _user Address of the user
     * @param _amount Amount requested
     * @return bool Whether user can borrow this amount
     */
    function isEligibleForLoan(address _user, uint256 _amount) external view returns (bool) {
        return this.calculateBorrowingPower(_user) >= _amount;
    }

    // Helper functions
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function _max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}
