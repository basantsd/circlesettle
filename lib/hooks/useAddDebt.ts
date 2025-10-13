import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '../contracts/config'
import { parseEther } from 'viem'

export function useAddDebt() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addDebt = async (creditor: string, debtor: string, amount: string) => {
    try {
      // Convert dollar amount to wei (using ether as proxy)
      const amountInWei = parseEther(amount)
      
      writeContract({
        address: MICRO_DEBT_TRACKER_ADDRESS,
        abi: MICRO_DEBT_TRACKER_ABI,
        functionName: 'addDebt',
        args: [creditor as `0x${string}`, debtor as `0x${string}`, amountInWei],
      })
    } catch (err) {
      console.error('Error adding debt:', err)
      throw err
    }
  }

  return {
    addDebt,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}