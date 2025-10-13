'use client'

import { useDebt } from '@/lib/hooks/useDebts'
import { formatEther } from 'viem'

interface DebtCardProps {
  debtId: bigint
  userAddress: string
}

export function DebtCard({ debtId, userAddress }: DebtCardProps) {
  const { debt, isLoading } = useDebt(debtId)

  if (isLoading) {
    return (
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    )
  }

  if (!debt) return null

  // Check if current user is debtor (owes money) or creditor (is owed money)
  const isDebtor = debt.debtor.toLowerCase() === userAddress.toLowerCase()
  const amount = formatEther(debt.amount) // Convert from wei to ETH/HBAR
  const otherParty = isDebtor ? debt.creditor : debt.debtor

  // Format address to show first 6 and last 4 characters
  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  if (debt.settled) {
    return (
      <div className="flex justify-between items-center p-3 bg-green-50 rounded opacity-50">
        <span className="text-gray-500 line-through">
          {isDebtor ? 'Owed' : 'From'} {formatAddress(otherParty)}
        </span>
        <span className="text-green-600 font-semibold">✓ Settled</span>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
      <span>
        {isDebtor ? 'Owe' : 'From'} {formatAddress(otherParty)}
      </span>
      <span className={`font-semibold ${isDebtor ? 'text-red-600' : 'text-green-600'}`}>
        {isDebtor ? '-' : '+'}${parseFloat(amount).toFixed(2)}
      </span>
    </div>
  )
}