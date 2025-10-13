'use client'

import { useAccount } from 'wagmi'
import { redirect } from 'next/navigation'

export default function SplitBillPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Split Bill</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Manual split form coming tomorrow...</p>
        </div>
      </div>
    </div>
  )
}