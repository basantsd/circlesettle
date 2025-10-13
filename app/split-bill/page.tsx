'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { redirect, useRouter } from 'next/navigation'
import { useAddDebt } from '@/lib/hooks/useAddDebt'

export default function SplitBillPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [friendAddress, setFriendAddress] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [yourShare, setYourShare] = useState('')
  
  const { addDebt, isPending, isConfirming, isSuccess, error, hash } = useAddDebt()

  if (!isConnected) {
    redirect('/')
  }

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }, [isSuccess, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) return

    try {
      await addDebt(friendAddress, address, yourShare)
    } catch (err) {
      console.error('Failed to create debt:', err)
    }
  }

  const calculateFriendShare = () => {
    if (totalAmount && yourShare) {
      const total = parseFloat(totalAmount)
      const yours = parseFloat(yourShare)
      return (total - yours).toFixed(2)
    }
    return '0.00'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Split Bill</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Test's Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Friend's Wallet Address {process.env.NODE_ENV === 'development' && (
                <button
                    type="button"
                    onClick={() => {
                    setFriendAddress('0x3F21E113C74F8A1Abf27a700aF848BFB0F8188F8')
                    setTotalAmount('100')
                    setYourShare('50')
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                >
                    🔧 Fill Test Data
                </button>
                )}
              </label>
              
              <input
                type="text"
                value={friendAddress}
                onChange={(e) => setFriendAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isPending || isConfirming}
              />
              <p className="text-sm text-gray-500 mt-1">
                Who paid for this bill?
              </p>
            </div>

            {/* Total Bill Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Bill Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="100.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isPending || isConfirming}
              />
            </div>

            {/* Your Share */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Share ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={yourShare}
                onChange={(e) => setYourShare(e.target.value)}
                placeholder="50.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isPending || isConfirming}
              />
            </div>

            {/* Split Summary */}
            {totalAmount && yourShare && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Split Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bill:</span>
                  <span className="font-semibold">${totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Share:</span>
                  <span className="font-semibold text-green-600">${yourShare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Friend's Share:</span>
                  <span className="font-semibold text-blue-600">${calculateFriendShare()}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-900">You Owe Friend:</span>
                    <span className="text-red-600">${yourShare}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⏳ Waiting for wallet confirmation...
                </p>
              </div>
            )}

            {isConfirming && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ⏳ Transaction confirming on blockchain...
                </p>
                {hash && (
                  <a 
                    href={`https://hashscan.io/testnet/transaction/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 block"
                  >
                    View on HashScan →
                  </a>
                )}
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ Debt created successfully! Redirecting to dashboard...
                </p>
                {hash && (
                  <a 
                    href={`https://hashscan.io/testnet/transaction/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline mt-1 block"
                  >
                    View on HashScan →
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ❌ Error: {error.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || isConfirming || isSuccess}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isPending ? 'Check Wallet...' : 
               isConfirming ? 'Confirming...' : 
               isSuccess ? 'Success! ✓' :
               'Request Payment'}
            </button>

            {/* Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Note:</strong> This will create an on-chain debt record. 
                Your friend will see this in their dashboard.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}