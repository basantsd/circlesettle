'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import Image from 'next/image'
import {
  Camera,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Receipt
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Bill Splitting</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Fair bill splitting,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> built on trust</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Split bills instantly with AI receipt scanning and build your financial reputation with on-chain credit scoring.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <ConnectButton />
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:border-gray-400 transition"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero.jpeg"
                  alt="CircleSettle App Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to split bills fairly and build financial trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Manual Split */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Manual Split</h3>
              <p className="text-gray-700 mb-6">
                Quickly split bills manually by entering the total amount and your share. Simple and straightforward.
              </p>
              {/* Feature Image */}
              <div className="relative aspect-video bg-white/50 rounded-lg overflow-hidden">
                <Image
                  src="/images/powerful-1.jpeg"
                  alt="Manual split feature"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Feature 2: AI Scanner */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Receipt Scanner</h3>
              <p className="text-gray-700 mb-6">
                Upload any receipt and our AI automatically extracts items, prices, tax, and tip. Powered by ASI Alliance.
              </p>
              {/* Feature Image */}
              <div className="relative aspect-video bg-white/50 rounded-lg overflow-hidden">
                <Image
                  src="/images/powerful-2.jpeg"
                  alt="AI receipt scanner feature"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Feature 3: Circle Score */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Circle Score</h3>
              <p className="text-gray-700 mb-6">
                Build your on-chain credit score (300-850) through timely payments. Higher scores unlock better borrowing power.
              </p>
              {/* Feature Image */}
              <div className="relative aspect-video bg-white/50 rounded-lg overflow-hidden">
                <Image
                  src="/images/powerful-3.jpeg"
                  alt="Circle Score dashboard"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Split bills in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Scan Receipt</h3>
                <p className="text-gray-600 mb-6">
                  Upload a photo of your receipt. Our AI extracts all items, prices, and calculates totals automatically.
                </p>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/how-it-work-1.jpeg"
                    alt="Scan receipt step"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-10 -right-6 text-gray-300">
                <ArrowRight className="w-12 h-12" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Select Your Items</h3>
                <p className="text-gray-600 mb-6">
                  Choose the items you had from the scanned receipt. We'll calculate your exact share including tax and tip.
                </p>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/how-it-work-2.jpeg"
                    alt="Select your items step"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-10 -right-6 text-gray-300">
                <ArrowRight className="w-12 h-12" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Settle & Build Score</h3>
                <p className="text-gray-600 mb-6">
                  Create debt records on-chain and settle payments. Timely payments boost your Circle Score automatically.
                </p>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  <Image
                    src="/images/how-it-work-3.jpeg"
                    alt="Settle and build score step"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why CircleSettle Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Trust Image */}
            <div className="order-2 md:order-1">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/trust.jpeg"
                  alt="Trust and transparency"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built on Trust & Transparency</h2>
              <p className="text-xl text-gray-600 mb-8">
                Every transaction is recorded on-chain, creating a transparent and immutable record of your financial interactions.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">On-Chain Credit Scoring</h4>
                    <p className="text-gray-600">Build your reputation with every payment. Score ranges from 300-850, just like traditional credit.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Cross-Chain Payments</h4>
                    <p className="text-gray-600">Powered by Avail Nexus for seamless multi-network settlements with USDC.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Receipt Scanning</h4>
                    <p className="text-gray-600">Advanced OCR technology extracts receipt data in seconds. Powered by ASI Alliance.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
                    <p className="text-gray-600">Your data is protected with industry-standard encryption and wallet signatures.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section id="get-started" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to split smarter?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect your wallet and start building your Circle Score today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ConnectButton />
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Free to use • Secure & decentralized
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.png"
                    alt="CircleSettle Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </div>
                <span className="text-xl font-bold text-white">CircleSettle</span>
              </div>
              <p className="text-gray-400 mb-4">
                Fair bill splitting, built on trust. Split bills with AI, build credit on-chain.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Technology</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">ASI Alliance</a></li>
                <li><a href="#" className="hover:text-white transition">Avail Nexus</a></li>
                <li><a href="#" className="hover:text-white transition">Smart Contracts</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 CircleSettle. Built with trust and transparency.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
