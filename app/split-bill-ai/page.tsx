'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { redirect, useRouter } from 'next/navigation'
import { useAddDebt } from '@/lib/hooks/useAddDebt'
import Link from 'next/link'

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
  selected?: boolean
}

interface ReceiptData {
  items: ReceiptItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
  merchant: string
  date: string
  currency?: string
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 150 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
]

export default function SplitBillAIPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [friendAddress, setFriendAddress] = useState('')

  const [isScanning, setIsScanning] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [conversionRate, setConversionRate] = useState(1)

  const { addDebt, isPending, isConfirming, isSuccess, error } = useAddDebt()

  if (!isConnected) {
    redirect('/')
  }

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }, [isSuccess, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => setUploadedImage(e.target?.result as string)
    reader.readAsDataURL(file)

    setIsScanning(true)

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to scan receipt')

      const data: ReceiptData = await res.json()
      setReceiptData(data)
      setSelectedItems(data.items.map((_, i) => i)) // select all by default

    } catch (err) {
      console.error('Receipt scanning error:', err)
      alert('Failed to scan receipt. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const toggleItem = (index: number) => {
    setSelectedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const convertAmount = (amount: number) => {
    return amount / conversionRate
  }

  const formatCurrency = (amount: number) => {
    const currency = CURRENCIES.find(c => c.code === selectedCurrency)
    return `${currency?.symbol}${amount.toFixed(2)}`
  }

  const calculateMyShare = () => {
    if (!receiptData) return 0

    const itemsTotal = receiptData.items
      .filter((_, i) => selectedItems.includes(i))
      .reduce((sum, item) => sum + item.total, 0)

    const ratio = itemsTotal / receiptData.subtotal
    const myTax = receiptData.tax * ratio
    const myTip = receiptData.tip * ratio

    return itemsTotal + myTax + myTip
  }

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
    const currency = CURRENCIES.find(c => c.code === currencyCode)
    if (currency) {
      setConversionRate(currency.rate)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    try {
      const myShare = calculateMyShare()
      const myShareUSD = convertAmount(myShare) // convert to USD for on-chain
      await addDebt(friendAddress, address, myShareUSD.toFixed(2))
    } catch (err) {
      console.error('Failed to create debt:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">AI Receipt Scanner</h1>
            <p className="text-gray-600 mt-1">Upload a receipt and select your items</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="text-xs text-purple-700 font-semibold">Powered by</div>
              <div className="text-sm font-bold text-purple-900">ASI Alliance</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Receipt Upload */}
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">1. Upload Receipt</h2>

              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  {uploadedImage ? (
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Receipt"
                        className="max-h-64 mx-auto rounded"
                      />
                      {isScanning && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                          <div className="text-white">
                            <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p>Scanning with AI...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-gray-600 mb-2">Click to upload receipt</p>
                      <p className="text-sm text-gray-400">or drag and drop</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isScanning}
                  />
                </div>
              </label>

              {receiptData && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-900">
                        {receiptData.merchant}
                      </div>
                      <div className="text-xs text-green-700">
                        {receiptData.date} • {receiptData.items.length} items
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Friend's Address */}
            {receiptData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">2. Who Paid?</h2>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Friend's Wallet Address
                  </span>
                  <input
                    type="text"
                    value={friendAddress}
                    onChange={(e) => setFriendAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </label>
              </div>
            )}
          </div>

          {/* Right Column: Items Selection */}
          {receiptData && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">3. Select Your Items</h2>

                {/* Currency Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Currency:</span>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {receiptData.items.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleItem(index)}
                    className={`w-full p-3 rounded-lg border-2 transition text-left ${
                      selectedItems.includes(index)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedItems.includes(index)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedItems.includes(index) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 ml-7">
                          {item.quantity}x {formatCurrency(item.price)}
                        </div>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.total)}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({selectedItems.length})</span>
                  <span className="font-medium">{formatCurrency(receiptData.items
                    .filter((_, i) => selectedItems.includes(i))
                    .reduce((sum, item) => sum + item.total, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your share of tax</span>
                  <span className="font-medium">{formatCurrency(receiptData.tax * (selectedItems.length / receiptData.items.length))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your share of tip</span>
                  <span className="font-medium">{formatCurrency(receiptData.tip * (selectedItems.length / receiptData.items.length))}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Your Total ({selectedCurrency})</span>
                  <span className="text-blue-600">{formatCurrency(calculateMyShare())}</span>
                </div>
                {selectedCurrency !== 'USD' && (
                  <div className="flex justify-between text-sm text-gray-500 pt-1">
                    <span>Converted to USD:</span>
                    <span className="font-medium">${convertAmount(calculateMyShare()).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <form onSubmit={handleSubmit} className="mt-6">
                {isPending && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800">⏳ Check your wallet...</p>
                  </div>
                )}

                {isConfirming && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">⏳ Confirming transaction...</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-800">✅ Debt created! Redirecting...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-800">❌ {error.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!friendAddress || selectedItems.length === 0 || isPending || isConfirming}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isPending ? 'Check Wallet...' :
                   isConfirming ? 'Confirming...' :
                   isSuccess ? 'Success! ✓' :
                   'Create Debt Record'}
                </button>
              </form>
            </div>
          )}

          {/* Empty State */}
          {!receiptData && !isScanning && (
            <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Split</h3>
              <p className="text-gray-600 mb-4">
                Upload a receipt and our AI will automatically extract all items and prices
              </p>
              <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-900">
                <strong>Powered by ASI Alliance</strong>
                <br />
                Advanced OCR & NLP for instant receipt parsing
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
