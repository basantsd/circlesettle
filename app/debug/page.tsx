'use client'

import { useAccount, useReadContract } from 'wagmi'
import { MICRO_DEBT_TRACKER_ADDRESS, MICRO_DEBT_TRACKER_ABI } from '@/lib/contracts/config'

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
            <div className="space-y-2 text-sm font-mono">
              <p><strong>Address:</strong> {address || 'Not connected'}</p>
              <p><strong>Your Debt IDs:</strong> {myDebts ? JSON.stringify(myDebts) : '[]'}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">📝 How to test:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>If "Total Debts" is 0, contract is working but has no data yet</li>
              <li>Create a test debt using Foundry script (see below)</li>
              <li>Refresh this page to see updated data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}