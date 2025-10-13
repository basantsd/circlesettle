'use client'

import { useAccount } from 'wagmi'
import { redirect } from 'next/navigation'
import { useMyDebts } from '@/lib/hooks/useDebts'
import { DebtCard } from '@/components/DebtCard'
import Link from 'next/link'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { debtIds, isLoading } = useMyDebts()

  if (!isConnected) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link 
            href="/split-bill"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Bill Split
          </Link>
        </div>
        
        {/* Connected Address */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <p className="text-sm text-gray-600">
            {address}
          </p>
        </div>

        {/* Debts List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
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
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">No debts yet!</p>
              <p className="mb-6">Split your first bill to get started</p>
              <Link 
                href="/split-bill"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Split a Bill
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}