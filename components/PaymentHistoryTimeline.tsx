'use client'

import { useMyDebts } from '@/lib/hooks/useDebts'
import { useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { useMemo, useState } from 'react'
import { MICRO_DEBT_TRACKER_ABI, MICRO_DEBT_TRACKER_ADDRESS } from '@/lib/contracts/config'
import {
  DollarSign,
  CheckCircle,
  XCircle,
  ExternalLink,
  Filter,
  Search,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Receipt
} from 'lucide-react'

interface PaymentHistoryTimelineProps {
  address: `0x${string}`
}

interface TimelineEvent {
  id: string
  debtId: bigint
  type: 'bill_split' | 'payment' | 'received'
  amount: string
  timestamp: bigint
  settled: boolean
  otherParty: string
  scoreImpact: number
  isOnTime?: boolean
  txHash?: string
}

type FilterType = 'all' | 'bill_split' | 'payment' | 'received'
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest'

export function PaymentHistoryTimeline({ address }: PaymentHistoryTimelineProps) {
  const { debtIds, isLoading: isLoadingIds } = useMyDebts()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  // Fetch all debts in a single call using useReadContracts
  const { data: debtsData, isLoading: isLoadingDebts } = useReadContracts({
    contracts: debtIds?.map(debtId => ({
      address: MICRO_DEBT_TRACKER_ADDRESS,
      abi: MICRO_DEBT_TRACKER_ABI,
      functionName: 'getDebt',
      args: [debtId],
    })) || [],
  })

  const timeline = useMemo(() => {
    if (!debtIds || !debtsData || debtIds.length === 0) return []

    const events: TimelineEvent[] = []

    debtIds.forEach((debtId, index) => {
      const debtResult = debtsData[index]
      if (debtResult?.status !== 'success') return

      const debt = debtResult.result as any
      if (!debt) return

      const isCreditor = debt.creditor.toLowerCase() === address.toLowerCase()
      const isDebtor = debt.debtor.toLowerCase() === address.toLowerCase()

      // Bill split event (+5 points for everyone)
      events.push({
        id: `${debtId}-split`,
        debtId,
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
            debtId,
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
            debtId,
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

    return events
  }, [debtIds, debtsData, address])

  // Filter and sort timeline
  const filteredTimeline = useMemo(() => {
    let filtered = timeline

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.otherParty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.amount.includes(searchQuery) ||
        e.id.includes(searchQuery)
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return Number(b.timestamp - a.timestamp)
        case 'oldest':
          return Number(a.timestamp - b.timestamp)
        case 'highest':
          return parseFloat(b.amount) - parseFloat(a.amount)
        case 'lowest':
          return parseFloat(a.amount) - parseFloat(b.amount)
        default:
          return Number(b.timestamp - a.timestamp)
      }
    })

    return sorted
  }, [timeline, filterType, searchQuery, sortType])

  const isLoading = isLoadingIds || isLoadingDebts

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
        <div className="text-center py-12 text-gray-500">
          <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No payment history yet</p>
          <p className="text-sm mt-1">Start splitting bills to build your history</p>
        </div>
      </div>
    )
  }

  const getEventIcon = (type: string, scoreImpact: number) => {
    if (type === 'bill_split') return <Receipt className="w-5 h-5" />
    if (type === 'received') return <TrendingUp className="w-5 h-5" />
    if (scoreImpact > 0) return <CheckCircle className="w-5 h-5" />
    return <TrendingDown className="w-5 h-5" />
  }

  const getEventColor = (type: string, scoreImpact: number) => {
    if (type === 'bill_split') return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    if (type === 'received') return 'bg-green-50 border-green-200 hover:bg-green-100'
    if (scoreImpact > 0) return 'bg-green-50 border-green-200 hover:bg-green-100'
    return 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  }

  const getEventText = (event: TimelineEvent) => {
    if (event.type === 'bill_split') {
      return event.settled ? 'Bill Split (Settled)' : 'Bill Split (Pending)'
    }
    if (event.type === 'received') {
      return 'Received Payment'
    }
    if (event.isOnTime) {
      return 'Paid On Time'
    }
    return 'Late Payment'
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

  const formatFullDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBlockExplorerLink = (debtId: bigint) => {
    // Hedera Testnet HashScan
    return `https://hashscan.io/testnet/contract/${MICRO_DEBT_TRACKER_ADDRESS}`
  }

  const stats = {
    total: filteredTimeline.length,
    billsSplit: filteredTimeline.filter(e => e.type === 'bill_split').length,
    payments: filteredTimeline.filter(e => e.type === 'payment').length,
    received: filteredTimeline.filter(e => e.type === 'received').length,
    totalAmount: filteredTimeline.reduce((sum, e) => sum + parseFloat(e.amount), 0),
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-semibold">Payment History</h3>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} transaction{stats.total !== 1 ? 's' : ''} • ${stats.totalAmount.toFixed(2)} total
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">Bills Split</div>
          <div className="text-2xl font-bold text-blue-700">{stats.billsSplit}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-600 font-medium">Received</div>
          <div className="text-2xl font-bold text-green-700">{stats.received}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="text-xs text-purple-600 font-medium">Paid</div>
          <div className="text-2xl font-bold text-purple-700">{stats.payments}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 font-medium">Volume</div>
          <div className="text-xl font-bold text-gray-700">${stats.totalAmount.toFixed(0)}</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address or amount..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'bill_split', 'payment', 'received'] as FilterType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 text-xs rounded-full transition ${
                    filterType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? 'All' :
                   type === 'bill_split' ? 'Bills' :
                   type === 'payment' ? 'Paid' : 'Received'}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex flex-wrap gap-2">
              {(['newest', 'oldest', 'highest', 'lowest'] as SortType[]).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortType(sort)}
                  className={`px-3 py-1 text-xs rounded-full transition ${
                    sortType === sort
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {sort === 'newest' ? 'Newest' :
                   sort === 'oldest' ? 'Oldest' :
                   sort === 'highest' ? 'Highest $' : 'Lowest $'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {filteredTimeline.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No transactions match your filters</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterType('all')
            }}
            className="text-sm text-blue-600 hover:text-blue-700 mt-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline events */}
          <div className="space-y-3">
            {filteredTimeline.map((event) => (
              <div key={event.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-2 z-10 ${
                  event.type === 'bill_split' ? 'bg-blue-500 border-blue-600' :
                  event.type === 'received' ? 'bg-green-500 border-green-600' :
                  event.scoreImpact > 0 ? 'bg-green-500 border-green-600' :
                  'bg-orange-500 border-orange-600'
                }`}></div>

                {/* Event card */}
                <div
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${getEventColor(event.type, event.scoreImpact)}`}
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-gray-700">{getEventIcon(event.type, event.scoreImpact)}</span>
                        <span className="font-semibold text-gray-900">{getEventText(event)}</span>
                        {event.scoreImpact !== 0 && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            event.scoreImpact > 0 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                          }`}>
                            {getScoreText(event.scoreImpact)} pts
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">${parseFloat(event.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span className="font-mono text-xs">
                            {event.otherParty.slice(0, 6)}...{event.otherParty.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">{formatTimestamp(event.timestamp)}</span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expandedEvent === event.id && (
                        <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Full Date:</span>
                              <p className="font-medium">{formatFullDate(event.timestamp)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <p className="font-medium">
                                {event.settled ? (
                                  <span className="text-green-600">Settled</span>
                                ) : (
                                  <span className="text-yellow-600">Pending</span>
                                )}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Other Party:</span>
                              <p className="font-mono text-xs break-all">{event.otherParty}</p>
                            </div>
                          </div>

                          {/* Blockchain Explorer Link */}
                          <a
                            href={getBlockExplorerLink(event.debtId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View on HashScan Explorer</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export/Download option */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Showing {filteredTimeline.length} of {timeline.length} transactions
        </p>
        <a
          href={getBlockExplorerLink(debtIds![0])}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Contract on Explorer</span>
        </a>
      </div>
    </div>
  )
}
