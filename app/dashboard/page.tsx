'use client'

import { useAccount } from 'wagmi'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Balance Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Balance</h2>
          <div className="space-y-2">
            <p className="text-gray-600">Connected: {address}</p>
            <div className="text-2xl font-bold text-red-600">
              You Owe: -$47.50
            </div>
            <div className="text-2xl font-bold text-green-600">
              Owed to You: +$7.00
            </div>
          </div>
        </div>

        {/* Debts List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Debts</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Owe Alex</span>
              <span className="font-semibold text-red-600">$23.50</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Owe Sarah</span>
              <span className="font-semibold text-red-600">$31.00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Tom owes you</span>
              <span className="font-semibold text-green-600">$7.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}