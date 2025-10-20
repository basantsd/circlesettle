import { useReadContract } from 'wagmi'
import { CircleScoreABI } from '../contracts/CircleScoreABI'

// You'll need to deploy CircleScore and update this address
const CIRCLE_SCORE_ADDRESS = process.env.NEXT_PUBLIC_CIRCLE_SCORE_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000'

export interface UserScore {
  totalScore: bigint
  billsSplit: bigint
  loansRepaid: bigint
  latePayments: bigint
  onTimePayments: bigint
  lastActivityTimestamp: bigint
}

export function useCircleScore(address?: `0x${string}`) {
  const { data: score, isLoading: isLoadingScore, refetch: refetchScore } = useReadContract({
    address: CIRCLE_SCORE_ADDRESS,
    abi: CircleScoreABI,
    functionName: 'getScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: scoreDetails, isLoading: isLoadingDetails, refetch: refetchDetails } = useReadContract({
    address: CIRCLE_SCORE_ADDRESS,
    abi: CircleScoreABI,
    functionName: 'getScoreDetails',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: borrowingPower, isLoading: isLoadingPower, refetch: refetchPower } = useReadContract({
    address: CIRCLE_SCORE_ADDRESS,
    abi: CircleScoreABI,
    functionName: 'calculateBorrowingPower',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const refetch = () => {
    refetchScore()
    refetchDetails()
    refetchPower()
  }

  return {
    score: score ? Number(score) : 500,
    scoreDetails: scoreDetails as UserScore | undefined,
    borrowingPower: borrowingPower ? Number(borrowingPower) / 1e6 : 0, // Convert from USDC (6 decimals)
    isLoading: isLoadingScore || isLoadingDetails || isLoadingPower,
    refetch,
  }
}
