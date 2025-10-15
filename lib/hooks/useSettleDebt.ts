import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '../contracts/config'

export function useSettleDebt() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const settleDebt = async (debtId: bigint) => {
    try {
      writeContract({
        address: MICRO_DEBT_TRACKER_ADDRESS,
        abi: MICRO_DEBT_TRACKER_ABI,
        functionName: 'settleDebt',
        args: [debtId],
      })
    } catch (err) {
      console.error('Error settling debt:', err)
      throw err
    }
  }

  return {
    settleDebt,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}