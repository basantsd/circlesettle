import { useAccount, useReadContract } from 'wagmi'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '../contracts/config'

export function useMyDebts() {
  const { address } = useAccount()

  // Get array of debt IDs for current user
  const { data: debtIds, isLoading, refetch } = useReadContract({
    address: MICRO_DEBT_TRACKER_ADDRESS,
    abi: MICRO_DEBT_TRACKER_ABI,
    functionName: 'getMyDebts',
    account: address,
  })

  return {
    debtIds: debtIds as bigint[] | undefined,
    isLoading,
    refetch,
  }
}

export function useDebt(debtId: bigint | undefined) {
  const { data: debt, isLoading } = useReadContract({
    address: MICRO_DEBT_TRACKER_ADDRESS,
    abi: MICRO_DEBT_TRACKER_ABI,
    functionName: 'getDebt',
    args: debtId ? [debtId] : undefined,
    query: {
      enabled: !!debtId,
    },
  })

  return {
    debt: debt as {
      creditor: string
      debtor: string
      amount: bigint
      timestamp: bigint
      settled: boolean
    } | undefined,
    isLoading,
  }
}