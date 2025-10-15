import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther, encodeFunctionData } from 'viem'
import { SUPPORTED_CHAINS } from '../chains'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '../contracts/config'

export function useCrossChainPayment() {
  const { address, chain } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [isPending, setIsPending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hash, setHash] = useState<string>()

  const executeCrossChainPayment = async (
    amount: string,
    debtId: bigint,
    selectedChainId?: number
  ) => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected')
    }

    setIsPending(true)
    setError(null)

    try {
      const sourceChain = selectedChainId || chain?.id
      const targetChain = 296 // Hedera testnet

      console.log('Initiating cross-chain payment:', {
        from: SUPPORTED_CHAINS.find(c => c.id === sourceChain)?.name,
        to: SUPPORTED_CHAINS.find(c => c.id === targetChain)?.name,
        amount,
        debtId: debtId.toString()
      })

      // If same chain, use direct settlement
      if (sourceChain === targetChain) {
        console.log('Same chain - using direct settlement')
        setError(new Error('Please use direct payment for same-chain transactions'))
        setIsPending(false)
        return
      }

      // Prepare the target contract call (settleDebt function)
      const callData = encodeFunctionData({
        abi: MICRO_DEBT_TRACKER_ABI,
        functionName: 'settleDebt',
        args: [debtId],
      })

      // For MVP/Demo: Simulate Avail Nexus intent
      // In production, this would use actual Nexus SDK methods
      console.log('Creating Avail Nexus intent:', {
        sourceChain,
        targetChain,
        targetContract: MICRO_DEBT_TRACKER_ADDRESS,
        callData,
        value: parseEther(amount),
      })

      // Simulate intent creation
      setIsPending(false)
      setIsConfirming(true)

      // Simulate cross-chain bridging delay (3-5 seconds)
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // Generate mock transaction hash
      const mockHash = '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
      setHash(mockHash)
      
      setIsConfirming(false)
      setIsSuccess(true)

      console.log('Cross-chain payment successful (simulated):', mockHash)

    } catch (err) {
      console.error('Cross-chain payment failed:', err)
      setError(err as Error)
      setIsPending(false)
      setIsConfirming(false)
    }
  }

  return {
    executeCrossChainPayment,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}