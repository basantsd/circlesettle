'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAccount, useSwitchChain } from 'wagmi'
import { SUPPORTED_CHAINS } from '@/lib/chains'

interface ChainSelectorProps {
  onChainSelect?: (chainId: number) => void
  disabled?: boolean
}

export function ChainSelector({ onChainSelect, disabled }: ChainSelectorProps) {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chain?.id) || SUPPORTED_CHAINS[4]

  const handleChainSelect = async (chainId: number) => {
    try {
      await switchChain({ chainId })
      setIsOpen(false)
      onChainSelect?.(chainId)
    } catch (error) {
      console.error('Failed to switch chain:', error)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Image
          src={currentChain.icon}
          alt={currentChain.name}
          width={24}
          height={24}
          className="object-contain"
          unoptimized
        />
        <span className="font-medium">{currentChain.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 font-semibold">
                Select Network
              </div>
              {SUPPORTED_CHAINS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleChainSelect(c.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition ${
                    c.id === chain?.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <Image
                    src={c.icon}
                    alt={c.name}
                    width={28}
                    height={28}
                    className="object-contain"
                    unoptimized
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.symbol}</div>
                  </div>
                  {c.id === chain?.id && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-3">
              <p className="text-xs text-gray-500">
                💡 <strong>Powered by Avail Nexus</strong> - Pay from any chain, routed to Hedera
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}