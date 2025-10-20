'use client'

import { useMyDebts, useDebt } from '@/lib/hooks/useDebts'
import { formatEther } from 'viem'
import { useMemo } from 'react'

interface PaymentHistoryTimelineProps {
  address: `0x${string}`
}

interface TimelineEvent {
  id: string
  type: 'bill_split' | 'payment' | 'received'
  amount: string
  timestamp: bigint
  settled: boolean
  otherParty: string
  scoreImpact: number
  isOnTime?: boolean
}

export function PaymentHistoryTimeline({ address }: PaymentHistoryTimelineProps) {
  const { debtIds, isLoading } = useMyDebts()

  const timeline = useMemo(() => {
    if (!debtIds || debtIds.length === 0) return []

    const events: TimelineEvent[] = []

    debtIds.forEach(debtId => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { debt } = useDebt(debtId)
      if (!debt) return

      const isCreditor = debt.creditor.toLowerCase() === address.toLowerCase()
      const isDebtor = debt.debtor.toLowerCase() === address.toLowerCase()

      // Bill split event (+5 points for everyone)
      events.push({
        id: `${debtId}-split`,
        type: 'bill_split',
        amount: formatEther(debt.amount),
        timestamp: debt.timestamp,
        settled: debt.settled,
        otherParty: isCreditor ? debt.debtor : debt.creditor,
        scoreImpact: 5,
      })

      // Payment event (if settled)
      if (debt.settled) {
        const now = BigInt(Math.floor(Date.now() / 1000))
        const timeDiff = now - debt.timestamp
        const onTime = timeDiff <= BigInt(24 * 60 * 60) // 24 hours

        if (isDebtor) {
          // You paid
          events.push({
            id: `${debtId}-payment`,
            type: 'payment',
            amount: formatEther(debt.amount),
            timestamp: debt.timestamp + BigInt(60 * 60), // Assume paid 1hr later (placeholder)
            settled: true,
            otherParty: debt.creditor,
            scoreImpact: onTime ? 10 : -50,
            isOnTime: onTime,
          })
        } else if (isCreditor) {
          // You received
          events.push({
            id: `${debtId}-received`,
            type: 'received',
            amount: formatEther(debt.amount),
            timestamp: debt.timestamp + BigInt(60 * 60),
            settled: true,
            otherParty: debt.debtor,
            scoreImpact: 0,
          })
        }
      }
    })

    // Sort by timestamp (newest first)
    return events.sort((a, b) => Number(b.timestamp - a.timestamp))
  }, [debtIds, address])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No payment history yet</p>
          <p className="text-sm mt-1">Start splitting bills to build your history</p>
        </div>
      </div>
    )
  }

  const getEventIcon = (type: string, scoreImpact: number) => {
    if (type === 'bill_split') return '🍽️'
    if (type === 'received') return '💰'
    if (scoreImpact > 0) return '✅'
    return '⚠️'
  }

  const getEventColor = (type: string, scoreImpact: number) => {
    if (type === 'bill_split') return 'bg-blue-50 border-blue-200'
    if (type === 'received') return 'bg-green-50 border-green-200'
    if (scoreImpact > 0) return 'bg-green-50 border-green-200'
    return 'bg-orange-50 border-orange-200'
  }

  const getEventText = (event: TimelineEvent) => {
    if (event.type === 'bill_split') {
      return 'Split a bill'
    }
    if (event.type === 'received') {
      return 'Received payment'
    }
    if (event.isOnTime) {
      return 'Paid on time'
    }
    return 'Late payment'
  }

  const getScoreText = (scoreImpact: number) => {
    if (scoreImpact > 0) return `+${scoreImpact}`
    if (scoreImpact < 0) return `${scoreImpact}`
    return '0'
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Payment History</h3>
        <span className="text-sm text-gray-500">{timeline.length} events</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline events */}
        <div className="space-y-4">
          {timeline.slice(0, 10).map((event, index) => (
            <div key={event.id} className="relative pl-14">
              {/* Timeline dot */}
              <div className="absolute left-4 top-3 w-4 h-4 rounded-full bg-white border-2 border-gray-300 z-10"></div>

              {/* Event card */}
              <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${getEventColor(event.type, event.scoreImpact)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xl">{getEventIcon(event.type, event.scoreImpact)}</span>
                      <span className="font-semibold text-gray-900">{getEventText(event)}</span>
                      {event.scoreImpact !== 0 && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          event.scoreImpact > 0 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {getScoreText(event.scoreImpact)} pts
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${parseFloat(event.amount).toFixed(2)} • {event.otherParty.slice(0, 6)}...{event.otherParty.slice(-4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</div>
                    {!event.settled && event.type !== 'bill_split' && (
                      <span className="text-xs text-yellow-600 font-medium">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {timeline.length > 10 && (
          <div className="text-center mt-6">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all {timeline.length} events →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
