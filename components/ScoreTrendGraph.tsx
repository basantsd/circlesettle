'use client'

import { useCircleScore } from '@/lib/hooks/useCircleScore'
import { useMemo } from 'react'

interface ScoreTrendGraphProps {
  address: `0x${string}`
}

export function ScoreTrendGraph({ address }: ScoreTrendGraphProps) {
  const { score, scoreDetails, isLoading } = useCircleScore(address)

  // Generate mock historical data based on current score
  const historicalData = useMemo(() => {
    if (!scoreDetails) return []

    const points: { score: number; label: string }[] = []
    const activities = Number(scoreDetails.billsSplit) + Number(scoreDetails.onTimePayments) + Number(scoreDetails.loansRepaid)

    if (activities === 0) {
      // New user - show projected growth
      return [
        { score: 500, label: 'Start' },
        { score: 500, label: 'Now' },
      ]
    }

    // Calculate historical points (working backwards)
    let currentScore = score
    const billSplits = Number(scoreDetails.billsSplit)
    const onTimePayments = Number(scoreDetails.onTimePayments)
    const latePayments = Number(scoreDetails.latePayments)
    const loansRepaid = Number(scoreDetails.loansRepaid)

    // Starting point
    points.unshift({ score: 500, label: 'Start' })

    // Add points for each activity (simplified simulation)
    if (billSplits > 0) {
      const prevScore = points[points.length - 1].score
      points.push({ score: prevScore + billSplits * 5, label: `${billSplits} splits` })
    }

    if (onTimePayments > 0) {
      const prevScore = points[points.length - 1].score
      points.push({ score: prevScore + onTimePayments * 10, label: `${onTimePayments} on-time` })
    }

    if (latePayments > 0) {
      const prevScore = points[points.length - 1].score
      points.push({ score: Math.max(300, prevScore - latePayments * 50), label: `${latePayments} late` })
    }

    if (loansRepaid > 0) {
      const prevScore = points[points.length - 1].score
      points.push({ score: Math.min(850, prevScore + loansRepaid * 50), label: `${loansRepaid} loans` })
    }

    // Current score
    points.push({ score: currentScore, label: 'Now' })

    return points
  }, [score, scoreDetails])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (historicalData.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Score Trend</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>Not enough data yet</p>
          <p className="text-sm mt-1">Complete more activities to see your trend</p>
        </div>
      </div>
    )
  }

  const maxScore = 850
  const minScore = 300
  const range = maxScore - minScore

  const getYPosition = (score: number) => {
    return ((maxScore - score) / range) * 100
  }

  const getColorForScore = (score: number) => {
    if (score >= 750) return 'stroke-green-500'
    if (score >= 650) return 'stroke-blue-500'
    if (score >= 550) return 'stroke-yellow-500'
    return 'stroke-orange-500'
  }

  // Create SVG path
  const pathData = useMemo(() => {
    if (historicalData.length < 2) return ''

    const points = historicalData.map((point, index) => {
      const x = (index / (historicalData.length - 1)) * 100
      const y = getYPosition(point.score)
      return { x, y, score: point.score }
    })

    const path = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      return `L ${point.x} ${point.y}`
    }).join(' ')

    return path
  }, [historicalData])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Score Trend</h3>
        <div className="text-sm text-gray-500">
          {historicalData.length} data points
        </div>
      </div>

      {/* Graph */}
      <div className="relative h-48 mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>850</span>
          <span>700</span>
          <span>500</span>
          <span>300</span>
        </div>

        {/* Graph area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[850, 700, 500, 300].map(score => (
              <div
                key={score}
                className="absolute w-full border-t border-gray-100"
                style={{ top: `${getYPosition(score)}%` }}
              ></div>
            ))}
          </div>

          {/* SVG Graph */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Area under curve */}
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {pathData && (
              <>
                {/* Fill area */}
                <path
                  d={`${pathData} L 100 100 L 0 100 Z`}
                  fill="url(#scoreGradient)"
                />
                {/* Line */}
                <path
                  d={pathData}
                  fill="none"
                  className={getColorForScore(score)}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Data points */}
            {historicalData.map((point, index) => {
              const x = (index / (historicalData.length - 1)) * 100
              const y = getYPosition(point.score)
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    className={getColorForScore(point.score)}
                    fill="white"
                    strokeWidth="2"
                  />
                </g>
              )
            })}
          </svg>

          {/* Tooltip on hover (simplified) */}
          {historicalData.map((point, index) => {
            const x = (index / (historicalData.length - 1)) * 100
            return (
              <div
                key={index}
                className="absolute w-1 h-full cursor-pointer group"
                style={{ left: `${x}%` }}
              >
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                  {point.label}: {point.score}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-8 flex justify-between text-xs text-gray-500">
        {historicalData.map((point, index) => (
          index === 0 || index === historicalData.length - 1 ? (
            <span key={index}>{point.label}</span>
          ) : null
        ))}
      </div>

      {/* Score change indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Score Change</div>
            <div className="text-2xl font-bold text-gray-900">
              {score - 500 >= 0 ? '+' : ''}{score - 500} points
            </div>
          </div>
          <div className="text-4xl">
            {score > 500 ? '📈' : score < 500 ? '📉' : '➡️'}
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-2">
          {score > 500 && 'Keep up the great work! '}
          {score < 500 && 'Build your score with on-time payments '}
          {score === 500 && 'Start building your credit history '}
        </div>
      </div>
    </div>
  )
}
