export const CircleScoreABI = [
  {
    type: 'function',
    name: 'getScore',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getScoreDetails',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'totalScore', type: 'uint256' },
          { name: 'billsSplit', type: 'uint256' },
          { name: 'loansRepaid', type: 'uint256' },
          { name: 'latePayments', type: 'uint256' },
          { name: 'onTimePayments', type: 'uint256' },
          { name: 'lastActivityTimestamp', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateBorrowingPower',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isEligibleForLoan',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'recordBillSplit',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordPayment',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_debtCreationTime', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'recordLoanRepayment',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ScoreUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'newScore', type: 'uint256', indexed: false },
      { name: 'reason', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BillSplitRecorded',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'scoreIncrease', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PaymentRecorded',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'onTime', type: 'bool', indexed: false },
      { name: 'scoreChange', type: 'uint256', indexed: false },
    ],
  },
] as const
