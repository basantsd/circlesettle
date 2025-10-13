'use client'

// import { useAccount } from 'wagmi'
// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Home() {
  // const { isConnected } = useAccount()
  // const router = useRouter()

  // // Auto-redirect to dashboard if already connected
  // useEffect(() => {
  //   if (isConnected) {
  //     router.push('/dashboard')
  //   }
  // }, [isConnected, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🌊 CircleSettle
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Split bills in seconds, borrow from friends anonymously
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">📸</div>
            <h3 className="text-lg font-semibold mb-2">Scan & Split</h3>
            <p className="text-gray-600">
              Take photo of receipt, AI splits it in 15 seconds
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">🎭</div>
            <h3 className="text-lg font-semibold mb-2">Anonymous Loans</h3>
            <p className="text-gray-600">
              Borrow from friends without embarrassment
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold mb-2">Circle Score</h3>
            <p className="text-gray-600">
              Build credit through trustworthy behavior
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}