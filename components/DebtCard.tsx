'use client'

import { useDebt } from '@/lib/hooks/useDebts'
import { useSettleDebt } from '@/lib/hooks/useSettleDebt'
import { useCrossChainPayment } from '@/lib/hooks/useCrossChainPayment'
import { formatEther } from 'viem'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ChainSelector } from './ChainSelector'
import { XCircle, DollarSign, AlertTriangle, Rocket, Lightbulb } from 'lucide-react'

interface DebtCardProps {
  debtId: bigint
  userAddress: string
}

export function DebtCard({ debtId, userAddress }: DebtCardProps) {
  const { debt, isLoading } = useDebt(debtId)
  const { chain } = useAccount()
  const { settleDebt, isPending, isConfirming, isSuccess, hash } = useSettleDebt()
  const { 
    executeCrossChainPayment,
    isPending: isCrossChainPending,
    isConfirming: isCrossChainConfirming,
    isSuccess: isCrossChainSuccess,
    error: crossChainError,
    hash: crossChainHash,
  } = useCrossChainPayment()
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCrossChain, setShowCrossChain] = useState(false)

  useEffect(() => {
    if (isSuccess || isCrossChainSuccess) {
      setShowSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }, [isSuccess, isCrossChainSuccess])

  if (isLoading) {
    return (
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    )
  }

  if (!debt) return null

  const isDebtor = debt.debtor.toLowerCase() === userAddress.toLowerCase()
  const amount = formatEther(debt.amount)
  const otherParty = isDebtor ? debt.creditor : debt.debtor

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const isOnHedera = chain?.id === 296

  if (debt.settled || showSuccess) {
    return (
      <div className="flex justify-between items-center p-4 bg-green-50 rounded border border-green-200">
        <div>
          <span className="text-gray-500 line-through">
            {isDebtor ? 'Owed' : 'From'} {formatAddress(otherParty)}
          </span>
          <div className="text-xs text-green-600 mt-1">✓ Settled</div>
        </div>
        <span className="text-green-600 font-semibold">✓ Paid</span>
      </div>
    )
  }

  const handleDirectSettle = async () => {
    if (!isOnHedera) {
      alert('Please switch to Hedera network for direct payment')
      return
    }
    if (window.confirm(`Confirm payment of $${parseFloat(amount).toFixed(2)} from Hedera?`)) {
      await settleDebt(debtId)
    }
  }

  const handleCrossChainSettle = async () => {
    if (isOnHedera) {
      alert('You are already on Hedera. Use direct payment instead.')
      return
    }
    if (window.confirm(`Confirm cross-chain payment of $${parseFloat(amount).toFixed(2)}?`)) {
      await executeCrossChainPayment(amount, debtId, chain?.id)
    }
  }

  const anyPending = isPending || isCrossChainPending
  const anyConfirming = isConfirming || isCrossChainConfirming
  const txHash = hash || crossChainHash

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm text-gray-600">
            {isDebtor ? 'You owe' : 'Owes you'}
          </div>
          <div className="font-mono text-xs text-gray-400 mt-1">
            {formatAddress(otherParty)}
          </div>
        </div>
        <div className={`text-xl font-bold ${isDebtor ? 'text-red-600' : 'text-green-600'}`}>
          {isDebtor ? '-' : '+'}${parseFloat(amount).toFixed(2)}
        </div>
      </div>

      {isDebtor && (
        <div className="space-y-2">
          {anyPending && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              ⏳ Check your wallet...
            </div>
          )}
          
          {anyConfirming && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span>
                  {isCrossChainConfirming ? 'Bridging payment via Avail Nexus...' : 'Confirming transaction...'}
                </span>
              </div>
              {txHash && (
                <a 
                  href={`https://hashscan.io/testnet/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  View on HashScan →
                </a>
              )}
            </div>
          )}

          {crossChainError && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>{crossChainError.message}</span>
            </div>
          )}

          {/* Payment Options */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDirectSettle}
              disabled={anyPending || anyConfirming || !isOnHedera}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-semibold"
              title={!isOnHedera ? 'Switch to Hedera network' : 'Pay on Hedera'}
            >
              {anyPending ? 'Check Wallet...' :
               anyConfirming ? 'Confirming...' :
               isOnHedera ? (
                <span className="flex items-center justify-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Pay on Hedera</span>
                </span>
               ) : (
                <span className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Switch to Hedera</span>
                </span>
               )}
            </button>
            
            <button
              type="button"
              onClick={() => setShowCrossChain(!showCrossChain)}
              disabled={anyPending || anyConfirming}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition"
              title="Pay from another chain"
            >
              🌐
            </button>
          </div>

          {/* Cross-chain options */}
          {showCrossChain && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-sm font-semibold text-gray-700">
                  🌐 Cross-Chain Payment
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                  Powered by Avail
                </span>
              </div>
              
              <p className="text-xs text-gray-600">
                Pay from any supported network. Avail Nexus will bridge your payment to Hedera automatically.
              </p>

              <ChainSelector 
                onChainSelect={() => {}} 
                disabled={anyPending || anyConfirming}
              />
              
              <button
                type="button"
                onClick={handleCrossChainSettle}
                disabled={anyPending || anyConfirming || isOnHedera}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-semibold"
              >
                {isOnHedera ? (
                  <span className="flex items-center justify-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Already on Hedera</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Rocket className="w-4 h-4" />
                    <span>Bridge & Pay</span>
                  </span>
                )}
              </button>

              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <Lightbulb className="w-3 h-3" />
                <span>Estimated time: 30-60 seconds for cross-chain settlement</span>
              </p>
            </div>
          )}
        </div>
      )}

      {!isDebtor && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          ⏳ Waiting for payment...
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-2 space-y-1">
          <div>Debt ID: {debtId.toString()}</div>
          <div>Current Chain: {chain?.name || 'Unknown'}</div>
        </div>
      )}
    </div>
  )
}