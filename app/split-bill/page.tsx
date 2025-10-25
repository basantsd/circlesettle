'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { redirect, useRouter } from 'next/navigation'
import { useAddDebt } from '@/lib/hooks/useAddDebt'
import { CheckCircle, XCircle, Wrench, Info } from 'lucide-react'

interface Person {
  address: string
  amount: string
}

export default function SplitBillPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([{ address: '', amount: '' }])
  const [totalAmount, setTotalAmount] = useState('')
  const [yourShare, setYourShare] = useState('')
  const [creatingDebts, setCreatingDebts] = useState(false)
  const [debtsCreated, setDebtsCreated] = useState(0)
  const [totalDebts, setTotalDebts] = useState(0)

  const { addDebt, isPending, isConfirming, isSuccess, error, hash } = useAddDebt()

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
    if (!yourShare) return 0
    const total = parseFloat(yourShare)
    const assigned = calculateTotalOwed()
    return total - assigned
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
    if (remaining < 0) return 'text-red-600'
    if (remaining > 0) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Split Bill Manually</h1>
        <p className="text-gray-600 mb-8">You paid the bill. Enter how much each friend owes you.</p>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Important Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>How it works:</strong> YOU paid the restaurant in cash/card. Now enter each friend's share.
                They will pay YOU back via crypto (USDC). Each debt is recorded on-chain.
              </div>
            </div>

            {/* Total Bill & Your Share */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Bill Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={creatingDebts}
                />
                <p className="text-xs text-gray-500 mt-1">What the restaurant charged</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Share ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={yourShare}
                  onChange={(e) => setYourShare(e.target.value)}
                  placeholder="40.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={creatingDebts}
                />
                <p className="text-xs text-gray-500 mt-1">What your items cost</p>
              </div>
            </div>

            {/* People Who Owe You */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Friends Who Owe You Money
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPeople([{ address: '0x3F21E113C74F8A1Abf27a700aF848BFB0F8188F8', amount: '30' }])
                        setTotalAmount('100')
                        setYourShare('60')
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center space-x-1 ml-2"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Fill Test</span>
                    </button>
                  )}
                </label>
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
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
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
                            disabled={creatingDebts}
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
                              disabled={creatingDebts}
                            />
                            {index === people.length - 1 && calculateRemaining() > 0 && (
                              <button
                                type="button"
                                onClick={autoFillLastPerson}
                                className="px-3 py-2 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition"
                              >
                                Auto-fill Remaining
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {people.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePerson(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition mt-5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split Summary */}
            {totalAmount && yourShare && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Split Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bill:</span>
                  <span className="font-semibold">${totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Items:</span>
                  <span className="font-semibold text-green-600">${yourShare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Friends Should Pay:</span>
                  <span className="font-semibold text-blue-600">
                    ${(parseFloat(totalAmount) - parseFloat(yourShare || '0')).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total Assigned:</span>
                    <span className="font-semibold">${calculateTotalOwed().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-1">
                    <span className="text-gray-900">Remaining to Assign:</span>
                    <span className={getRemainingColor()}>
                      ${Math.abs(calculateRemaining()).toFixed(2)}
                      {calculateRemaining() < 0 && ' (over)'}
                      {calculateRemaining() > 0 && ' (under)'}
                      {calculateRemaining() === 0 && ' ✓'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {creatingDebts && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Creating debt records... {debtsCreated}/{totalDebts}
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>All debt records created! Redirecting to dashboard...</span>
                </p>
                {hash && (
                  <a
                    href={`https://hashscan.io/testnet/transaction/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline mt-1 block"
                  >
                    View on HashScan →
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 flex items-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Error: {error.message}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={people.filter(p => p.address.trim() && parseFloat(p.amount) > 0).length === 0 || creatingDebts}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {creatingDebts ? `Creating ${debtsCreated}/${totalDebts}...` :
               isSuccess ? 'Success! ✓' :
               'Create Debt Records'}
            </button>

            {/* Warning if amounts don't match */}
            {calculateRemaining() !== 0 && yourShare && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Warning:</strong> The amounts don't add up correctly.
                  {calculateRemaining() > 0 && ` You still need to assign $${calculateRemaining().toFixed(2)}.`}
                  {calculateRemaining() < 0 && ` You've assigned $${Math.abs(calculateRemaining()).toFixed(2)} too much.`}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
