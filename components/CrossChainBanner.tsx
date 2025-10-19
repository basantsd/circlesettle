'use client'

import Image from 'next/image'
import { SUPPORTED_CHAINS } from '@/lib/chains'

export function CrossChainBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg p-6 mb-6 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative flex items-start space-x-4">
        <div className="text-4xl">🌐</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold">
              Pay from Any Chain
            </h3>
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
              Powered by Avail Nexus
            </span>
          </div>
          <p className="text-sm opacity-90 mb-3">
            CircleSettle supports cross-chain payments using Avail Nexus SDK. 
            Pay debts from any supported blockchain - we handle the routing automatically.
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-xs opacity-75">Supported chains:</span>
            <div className="flex space-x-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <div
                  key={chain.id}
                  className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg"
                  title={chain.name}
                >
                  <Image
                    src={chain.icon}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="object-contain"
                    priority
                  />
                  <span className="text-xs font-medium">{chain.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}