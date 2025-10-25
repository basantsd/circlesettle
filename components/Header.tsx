'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { SUPPORTED_CHAINS } from '@/lib/chains'
import { Bot } from 'lucide-react'

export function Header() {
  const { isConnected, chain } = useAccount()
  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chain?.id)
  const [mounted, setMounted] = useState(false)

  // prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="CircleSettle Logo"
                width={32}
                height={32}
                className="rounded-lg object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-900">CircleSettle</span>
          </Link>

          {mounted && isConnected && (
            <nav className="flex items-center space-x-6">
              {currentChain && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
                  <Image
                    src={currentChain.icon}
                    alt={currentChain.name}
                    width={20}
                    height={20}
                    className="object-contain"
                    priority
                  />
                  <span className="text-sm font-semibold text-blue-700">
                    {currentChain.name}
                  </span>
                </div>
              )}

              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                href="/split-bill"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Split Bill
              </Link>
              <Link
                href="/split-bill-ai"
                className="flex items-center space-x-1 text-purple-700 hover:text-purple-900 font-medium transition"
              >
                <Bot className="w-4 h-4" />
                <span>AI Scanner</span>
              </Link>
            </nav>
          )}

          <ConnectButton />
        </div>
      </div>
    </header>
  )
}