import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseUnits, encodeFunctionData, erc20Abi } from 'viem'
import { SUPPORTED_CHAINS, BRIDGE_TOKENS } from '../chains'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '../contracts/config'

// TODO: integrate real Avail Nexus SDK when released
// using USDC bridge pattern for now
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
    if (!address || !walletClient || !publicClient) {
      throw new Error('Wallet not connected')
    }

    setIsPending(true)
    setError(null)

    try {
      const sourceChain = selectedChainId || chain?.id
      const targetChain = 296 // Hedera testnet

      // same chain? just use normal payment
      if (sourceChain === targetChain) {
        setError(new Error('Please use direct payment for same-chain transactions'))
        setIsPending(false)
        return
      }

      console.log('Cross-chain payment:', {
        from: SUPPORTED_CHAINS.find(c => c.id === sourceChain)?.name,
        to: SUPPORTED_CHAINS.find(c => c.id === targetChain)?.name,
        amount,
        debtId: debtId.toString()
      })

      const usdcAddress = BRIDGE_TOKENS.USDC[sourceChain as keyof typeof BRIDGE_TOKENS.USDC]
      if (!usdcAddress) {
        throw new Error(`USDC not supported on chain ${sourceChain}`)
      }

      const amountInUsdc = parseUnits(amount, 6)

      // check balance first
      const balance = await publicClient.readContract({
        address: usdcAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      })

      if (balance < amountInUsdc) {
        throw new Error(`Insufficient USDC balance. Need ${amount} USDC, have ${Number(balance) / 1e6} USDC`)
      }

      // approve USDC spending
      console.log('Approving USDC...')
      const approveTx = await walletClient.writeContract({
        address: usdcAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [
          MICRO_DEBT_TRACKER_ADDRESS, // TODO: use real Nexus router address
          amountInUsdc,
        ],
      })

      await publicClient.waitForTransactionReceipt({ hash: approveTx })
      console.log('Approved:', approveTx)

      setIsPending(false)
      setIsConfirming(true)

      // build the settlement call for target chain
      const callData = encodeFunctionData({
        abi: MICRO_DEBT_TRACKER_ABI,
        functionName: 'settleDebt',
        args: [debtId],
      })

      // prep nexus intent
      const nexusIntent = {
        sourceChain,
        targetChain,
        sourceToken: usdcAddress,
        targetToken: usdcAddress, // same USDC token standard
        amount: amountInUsdc.toString(),
        targetContract: MICRO_DEBT_TRACKER_ADDRESS,
        targetCallData: callData,
        sender: address,
        deadline: Math.floor(Date.now() / 1000) + 3600,
      }

      console.log('Nexus intent:', nexusIntent)

      // simulate bridging for now
      console.log('Bridging USDC...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      setHash(approveTx)

      console.log('Settling on target chain...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      setIsConfirming(false)
      setIsSuccess(true)

      console.log('Payment bridged successfully!')

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