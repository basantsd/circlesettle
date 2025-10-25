'use client'

import { useCircleScore } from '@/lib/hooks/useCircleScore'
import { useState } from 'react'
import { Sparkles, DollarSign, Info, HelpCircle } from 'lucide-react'

interface CircleScoreCardProps {
  address: `0x${string}`
}

interface TooltipProps {
  content: string
  children: React.ReactNode
}

function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-fadeIn">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export function CircleScoreCard({ address }: CircleScoreCardProps) {
  const { score, scoreDetails, borrowingPower, isLoading } = useCircleScore(address)

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white animate-pulse">
        <div className="h-32 bg-white/10 rounded"></div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-400'
    if (score >= 650) return 'text-blue-300'
    if (score >= 550) return 'text-yellow-300'
    return 'text-orange-300'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent'
    if (score >= 650) return 'Good'
    if (score >= 550) return 'Fair'
    return 'Building'
  }

  const scorePercentage = ((score - 300) / (850 - 300)) * 100

  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wide">Circle Score</h3>
          <p className="text-xs text-purple-200/70 mt-1">Your on-chain credit reputation</p>
        </div>
        <Sparkles className="w-10 h-10 text-purple-200" />
      </div>

      <div className="mb-6">
        <div className="flex items-end space-x-3 mb-2">
          <div className={`text-6xl font-bold ${getScoreColor(score)} transition-all duration-300 hover:scale-110 cursor-default`}>
            {score}
          </div>
          <div className="pb-2">
            <span className="text-sm text-purple-200">/ 850</span>
            <div className={`text-sm font-semibold ${getScoreColor(score)} animate-pulse`}>
              {getScoreLabel(score)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              score >= 750
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : score >= 650
                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                : score >= 550
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                : 'bg-gradient-to-r from-orange-400 to-orange-500'
            } shadow-lg`}
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-purple-200/70 mt-1">
          <span>300</span>
          <span>850</span>
        </div>
      </div>

      {/* Borrowing Power */}
      <Tooltip content="Based on your Circle Score, this is the maximum you can borrow">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4 hover:bg-white/15 transition cursor-help">
          <div className="text-sm text-purple-200 mb-1 flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>Borrowing Power</span>
            <HelpCircle className="w-3 h-3" />
          </div>
          <div className="text-3xl font-bold transition-all duration-300 hover:scale-105">
            ${borrowingPower.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-purple-200/70 mt-1">
            Maximum loan amount based on your score
          </div>
        </div>
      </Tooltip>

      {/* Stats Grid */}
      {scoreDetails && (
        <div className="grid grid-cols-2 gap-3">
          <Tooltip content="+5 points per bill split">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 hover:bg-white/20 transition cursor-help">
              <div className="text-xs text-purple-200/70 flex items-center space-x-1">
                <span>Bills Split</span>
                <HelpCircle className="w-3 h-3" />
              </div>
              <div className="text-2xl font-bold">{Number(scoreDetails.billsSplit)}</div>
              <div className="text-xs text-green-300">+{Number(scoreDetails.billsSplit) * 5} pts</div>
            </div>
          </Tooltip>
          <Tooltip content="+10 points per on-time payment (within 24hrs)">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 hover:bg-white/20 transition cursor-help">
              <div className="text-xs text-purple-200/70 flex items-center space-x-1">
                <span>On-Time Payments</span>
                <HelpCircle className="w-3 h-3" />
              </div>
              <div className="text-2xl font-bold">{Number(scoreDetails.onTimePayments)}</div>
              <div className="text-xs text-green-300">+{Number(scoreDetails.onTimePayments) * 10} pts</div>
            </div>
          </Tooltip>
          <Tooltip content="+50 points per loan fully repaid">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 hover:bg-white/20 transition cursor-help">
              <div className="text-xs text-purple-200/70 flex items-center space-x-1">
                <span>Loans Repaid</span>
                <HelpCircle className="w-3 h-3" />
              </div>
              <div className="text-2xl font-bold">{Number(scoreDetails.loansRepaid)}</div>
              <div className="text-xs text-green-300">+{Number(scoreDetails.loansRepaid) * 50} pts</div>
            </div>
          </Tooltip>
          <Tooltip content="-50 points per late payment (after 24hrs)">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 hover:bg-white/20 transition cursor-help">
              <div className="text-xs text-purple-200/70 flex items-center space-x-1">
                <span>Late Payments</span>
                <HelpCircle className="w-3 h-3" />
              </div>
              <div className="text-2xl font-bold text-orange-300">{Number(scoreDetails.latePayments)}</div>
              <div className="text-xs text-orange-300">{Number(scoreDetails.latePayments) * 50} pts</div>
            </div>
          </Tooltip>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-4 bg-white/5 backdrop-blur border border-white/10 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-purple-200 flex-shrink-0" />
          <div className="text-xs text-purple-200/80">
            <strong>How to improve:</strong> Split bills (+5), pay on-time (+10), repay loans (+50).
            Avoid late payments (-50).
          </div>
        </div>
      </div>
    </div>
  )
}
