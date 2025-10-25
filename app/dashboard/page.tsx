'use client'

import { useAccount, useReadContracts } from 'wagmi'
import { redirect } from 'next/navigation'
import { useMyDebts } from '@/lib/hooks/useDebts'
import { DebtCard } from '@/components/DebtCard'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { formatEther } from 'viem'
import { CrossChainBanner } from '@/components/CrossChainBanner'
import { CircleScoreCard } from '@/components/CircleScoreCard'
import { PaymentHistoryTimeline } from '@/components/PaymentHistoryTimeline'
import { ScoreTrendGraph } from '@/components/ScoreTrendGraph'
import { MICRO_DEBT_TRACKER_ABI, MICRO_DEBT_TRACKER_ADDRESS } from '@/lib/contracts/config'
import {
  Plus,
  Sparkles,
  Inbox,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wrench
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { debtIds, isLoading, refetch } = useMyDebts()

  if (!isConnected) {
    redirect('/')
  }

  // auto-refresh debts
  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000)
    return () => clearInterval(interval)
  }, [refetch])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link
              href="/split-bill"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Manual Split</span>
            </Link>
            <Link
              href="/split-bill-ai"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>AI Scanner</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-mono break-all">
                {address}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>
        </div>

        <CrossChainBanner />

        {/* Circle Score Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CircleScoreCard address={address!} />
          <ScoreTrendGraph address={address!} />
        </div>

        {/* Payment History Timeline */}
        <div className="mb-6">
          <PaymentHistoryTimeline address={address!} />
        </div>

        <BalanceSummary debtIds={debtIds} userAddress={address!} isLoading={isLoading} />

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Transactions</h2>
            {!isLoading && debtIds && debtIds.length > 0 && (
              <span className="text-sm text-gray-500">
                {debtIds.length} transaction{debtIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : debtIds && debtIds.length > 0 ? (
            <div className="space-y-3">
              {debtIds.map((debtId) => (
                <DebtCard
                  key={debtId.toString()}
                  debtId={debtId}
                  userAddress={address!}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <Inbox className="w-16 h-16 text-gray-300 mx-auto" />
              </div>
              <p className="text-lg text-gray-600 mb-2">No transactions yet!</p>
              <p className="text-gray-500 mb-6">Split your first bill to get started</p>
              <Link
                href="/split-bill"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Split Your First Bill
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/debug"
            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center space-x-1"
          >
            <Wrench className="w-4 h-4" />
            <span>Debug View</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function BalanceSummary({
  debtIds,
  userAddress,
  isLoading
}: {
  debtIds: bigint[] | undefined
  userAddress: string
  isLoading: boolean
}) {
  if (isLoading || !debtIds || debtIds.length === 0) {
    return null
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <DebtSummaryCard
        debtIds={debtIds}
        userAddress={userAddress}
        type="owed"
      />
      <DebtSummaryCard
        debtIds={debtIds}
        userAddress={userAddress}
        type="owing"
      />
      <DebtSummaryCard
        debtIds={debtIds}
        userAddress={userAddress}
        type="net"
      />
    </div>
  )
}

function DebtSummaryCard({
  debtIds,
  userAddress,
  type
}: {
  debtIds: bigint[]
  userAddress: string
  type: 'owed' | 'owing' | 'net'
}) {
  // Fetch all debts in a single call using useReadContracts
  const { data: debtsData } = useReadContracts({
    contracts: debtIds?.map(id => ({
      address: MICRO_DEBT_TRACKER_ADDRESS,
      abi: MICRO_DEBT_TRACKER_ABI,
      functionName: 'getDebt',
      args: [id],
    })) || [],
  })

  const totals = useMemo(() => {
    const debts = debtsData
      ?.map(result => result.status === 'success' ? result.result as unknown as { creditor: string; debtor: string; amount: bigint; settled: boolean } : null)
      .filter(d => d && !d.settled) || []
    let owed = 0
    let owing = 0

    debts.forEach(debt => {
      if (!debt) return
      const amount = parseFloat(formatEther(debt.amount))

      if (debt.creditor.toLowerCase() === userAddress.toLowerCase()) {
        owed += amount
      } else if (debt.debtor.toLowerCase() === userAddress.toLowerCase()) {
        owing += amount
      }
    })

    return { owed, owing, net: owed - owing }
  }, [debtsData, userAddress])

  const config = {
    owed: {
      label: 'Owed to You',
      value: totals.owed,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      Icon: TrendingUp
    },
    owing: {
      label: 'You Owe',
      value: totals.owing,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      Icon: TrendingDown
    },
    net: {
      label: 'Net Balance',
      value: totals.net,
      color: totals.net >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totals.net >= 0 ? 'bg-green-50' : 'bg-red-50',
      Icon: DollarSign
    }
  }

  const { label, value, color, bgColor, Icon } = config[type]

  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <Icon className="w-6 h-6 text-gray-500" />
      </div>
      <div className={`text-3xl font-bold ${color}`}>
        {type === 'net' && value !== 0 && (value > 0 ? '+' : '-')}
        ${Math.abs(value).toFixed(2)}
      </div>
    </div>
  )
}
