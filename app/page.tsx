'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          🌊 CircleSettle
        </h1>
        <p className="text-xl mb-8">
          Split bills in seconds, borrow from friends anonymously
        </p>
        <ConnectButton />
      </div>
    </main>
  )
}