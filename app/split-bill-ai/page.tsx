'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { redirect, useRouter } from 'next/navigation'
import { useAddDebt } from '@/lib/hooks/useAddDebt'
import Link from 'next/link'
import { Bot, Camera, Mic, CheckCircle, XCircle, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Person {
  address: string
  amount: string
}

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
  const [people, setPeople] = useState<Person[]>([{ address: '', amount: '' }])
  const [creatingDebts, setCreatingDebts] = useState(false)
  const [debtsCreated, setDebtsCreated] = useState(0)
  const [totalDebts, setTotalDebts] = useState(0)

  const [isScanning, setIsScanning] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [conversionRate, setConversionRate] = useState(1)

  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(false)

  const { addDebt, isSuccess, error } = useAddDebt()

  if (!isConnected) {
    redirect('/')
  }

  // Check voice support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setVoiceSupported(!!SpeechRecognition)
    }
  }, [])

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

  const startVoiceRecognition = () => {
    if (!voiceSupported || !receiptData) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceTranscript('')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setVoiceTranscript(transcript)
      parseVoiceCommand(transcript)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const parseVoiceCommand = (transcript: string) => {
    if (!receiptData) return

    const lowerTranscript = transcript.toLowerCase()
    const newSelectedItems: number[] = []

    // Parse patterns like "I had item 1, 3, and 5" or "I had the burger"
    const numberMatches = lowerTranscript.match(/\d+/g)

    if (numberMatches) {
      // User said item numbers
      numberMatches.forEach(num => {
        const index = parseInt(num) - 1 // convert to 0-indexed
        if (index >= 0 && index < receiptData.items.length) {
          newSelectedItems.push(index)
        }
      })
      setSelectedItems(newSelectedItems)
    } else {
      // Try to match item names
      receiptData.items.forEach((item, index) => {
        const itemNameLower = item.name.toLowerCase()
        if (lowerTranscript.includes(itemNameLower)) {
          newSelectedItems.push(index)
        }
      })

      if (newSelectedItems.length > 0) {
        setSelectedItems(newSelectedItems)
      }
    }
  }

  const addPerson = () => {
    setPeople([...people, { address: '', amount: '' }])
  }

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index))
    }
  }

  const updatePersonAddress = (index: number, value: string) => {
    const newPeople = [...people]
    newPeople[index].address = value
    setPeople(newPeople)
  }

  const updatePersonAmount = (index: number, value: string) => {
    const newPeople = [...people]
    newPeople[index].amount = value
    setPeople(newPeople)
  }

  const calculateTotalOwed = () => {
    return people.reduce((sum, person) => {
      const amount = parseFloat(person.amount) || 0
      return sum + amount
    }, 0)
  }

  const calculateRemaining = () => {
    const myShare = calculateMyShare()
    const myShareUSD = convertAmount(myShare)
    const assigned = calculateTotalOwed()
    return myShareUSD - assigned
  }

  const autoFillLastPerson = () => {
    if (people.length > 0) {
      const remaining = calculateRemaining()
      if (remaining > 0) {
        const lastIndex = people.length - 1
        updatePersonAmount(lastIndex, remaining.toFixed(2))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    const validPeople = people.filter(p => p.address.trim() !== '' && parseFloat(p.amount) > 0)
    if (validPeople.length === 0) return

    setCreatingDebts(true)
    setDebtsCreated(0)
    setTotalDebts(validPeople.length)

    try {
      for (let i = 0; i < validPeople.length; i++) {
        await addDebt(validPeople[i].address, address, validPeople[i].amount)
        setDebtsCreated(i + 1)
      }
    } catch (err) {
      console.error('Failed to create debts:', err)
    } finally {
      setCreatingDebts(false)
    }
  }

  const getRemainingColor = () => {
    const remaining = calculateRemaining()
    if (remaining < -0.01) return 'text-red-600'
    if (remaining > 0.01) return 'text-yellow-600'
    return 'text-green-600'
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
            <Bot className="w-8 h-8 text-purple-600" />
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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

            {/* Friends Who Owe You */}
            {receiptData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2 mb-4">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <strong>You paid the restaurant.</strong> Enter how much each friend owes you based on what they ate.
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">2. Who Owes You Money?</h2>
                  <button
                    type="button"
                    onClick={addPerson}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                  >
                    + Add Person
                  </button>
                </div>

                <div className="space-y-3">
                  {people.map((person, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Person {index + 1} - Wallet Address
                            </label>
                            <input
                              type="text"
                              value={person.address}
                              onChange={(e) => updatePersonAddress(index, e.target.value)}
                              placeholder="0x..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Amount They Owe You ($)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={person.amount}
                                onChange={(e) => updatePersonAmount(index, e.target.value)}
                                placeholder="25.00"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                required
                              />
                              {index === people.length - 1 && calculateRemaining() > 0.01 && (
                                <button
                                  type="button"
                                  onClick={autoFillLastPerson}
                                  className="px-3 py-2 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition whitespace-nowrap"
                                >
                                  Auto-fill
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {people.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePerson(index)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition mt-4"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* Voice Input Section */}
              {voiceSupported && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Mic className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Voice Selection</span>
                    </div>
                    <button
                      type="button"
                      onClick={startVoiceRecognition}
                      disabled={isListening}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isListening ? 'Listening...' : 'Say what you had'}
                    </button>
                  </div>
                  {voiceTranscript && (
                    <div className="mt-2 p-2 bg-white rounded border border-purple-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">You said:</span> &quot;{voiceTranscript}&quot;
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-purple-700 mt-2">
                    Try: &quot;I had items 1 and 3&quot; or &quot;I had the burger and fries&quot;
                  </p>
                </div>
              )}

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
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
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

                {/* Split breakdown */}
                {people.filter(p => p.address.trim()).length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Payment Breakdown:</p>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div className="flex justify-between">
                        <span>Your total share (USD):</span>
                        <span className="font-semibold">${convertAmount(calculateMyShare()).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total assigned to friends:</span>
                        <span className="font-semibold">${calculateTotalOwed().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1 border-t border-blue-300">
                        <span>Remaining to assign:</span>
                        <span className={getRemainingColor()}>
                          ${Math.abs(calculateRemaining()).toFixed(2)}
                          {calculateRemaining() < -0.01 && ' (over)'}
                          {calculateRemaining() > 0.01 && ' (under)'}
                          {Math.abs(calculateRemaining()) <= 0.01 && ' ✓'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <form onSubmit={handleSubmit} className="mt-6">
                {creatingDebts && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      Creating debts... {debtsCreated}/{totalDebts}
                    </p>
                    <div className="mt-2 bg-white rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(debtsCreated / totalDebts) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {!creatingDebts && isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-800 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>All debts created! Redirecting...</span>
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-800 flex items-center space-x-2">
                      <XCircle className="w-4 h-4" />
                      <span>{error.message}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={people.filter(p => p.address.trim() && parseFloat(p.amount) > 0).length === 0 || selectedItems.length === 0 || creatingDebts}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {creatingDebts ? `Creating ${debtsCreated}/${totalDebts}...` :
                   isSuccess ? 'Success! ✓' :
                   'Create Debt Records'}
                </button>

                {/* Warning if amounts don't match */}
                {Math.abs(calculateRemaining()) > 0.01 && selectedItems.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Warning:</strong> The amounts don&apos;t match your share.
                      {calculateRemaining() > 0.01 && ` You still need to assign $${calculateRemaining().toFixed(2)}.`}
                      {calculateRemaining() < -0.01 && ` You&apos;ve assigned $${Math.abs(calculateRemaining()).toFixed(2)} too much.`}
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Empty State */}
          {!receiptData && !isScanning && (
            <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center text-center">
              <Bot className="w-20 h-20 text-purple-600 mb-4" />
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
