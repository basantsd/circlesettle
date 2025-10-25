'use client'

import { useAccount, useReadContract } from 'wagmi'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '@/lib/contracts/config'

export const dynamic = 'force-dynamic'

export default function DebugPage() {
  const { address } = useAccount()

  // Read total debt counter
  const { data: debtCounter } = useReadContract({
    address: MICRO_DEBT_TRACKER_ADDRESS,
    abi: MICRO_DEBT_TRACKER_ABI,
    functionName: 'debtCounter',
  })

  // Read my debts
  const { data: myDebts } = useReadContract({
    address: MICRO_DEBT_TRACKER_ADDRESS,
    abi: MICRO_DEBT_TRACKER_ABI,
    functionName: 'getMyDebts',
    account: address,
  })

  // Convert BigInt array to string array for display
  const formatDebts = () => {
    if (!myDebts) return '[]'
    const debtsArray = myDebts as bigint[]
    return '[' + debtsArray.map(d => d.toString()).join(', ') + ']'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug Info</h1>
        
        <div className="space-y-6">
          {/* Contract Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contract</h2>
            <div className="space-y-2 text-sm font-mono">
              <p><strong>Address:</strong> {MICRO_DEBT_TRACKER_ADDRESS}</p>
              <p><strong>Total Debts Created:</strong> {debtCounter?.toString() || '0'}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Account</h2>
            <div className="space-y-2 text-sm font-mono break-all">
              <p><strong>Address:</strong> {address || 'Not connected'}</p>
              <p><strong>Your Debt IDs:</strong> {formatDebts()}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">📝 How to test:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>If &quot;Total Debts&quot; is 0, contract is working but has no data yet</li>
              <li>Go to /split-bill and create a debt</li>
              <li>Come back here to see updated data</li>
              <li>Check HashScan for transaction details</li>
            </ol>
          </div>

          {/* HashScan Link */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">🔍 Check on HashScan:</h3>
            <a 
              href={`https://hashscan.io/testnet/contract/${MICRO_DEBT_TRACKER_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {MICRO_DEBT_TRACKER_ADDRESS}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}