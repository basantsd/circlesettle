'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌊</span>
            <span className="text-xl font-bold text-gray-900">CircleSettle</span>
          </Link>

          {/* Navigation - only show when connected */}
          {isConnected && (
            <nav className="flex space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/split-bill" 
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Split Bill
              </Link>
              {process.env.NODE_ENV === 'development' && (
                <Link 
                    href="/debug" 
                    className="text-red-500 hover:text-red-500 font-medium"
                >
                    Debug
                </Link>
                )}
            </nav>
          )}

          {/* Wallet Connect */}
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}