import { NextRequest, NextResponse } from 'next/server'

// Receipt OCR with multiple fallbacks:
// 1. ASI-1 Mini (Fetch.ai)
// 2. OCR.space
// 3. Mock data for demo

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptData {
  items: ReceiptItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
  merchant: string
  date: string
}

function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)

  const merchant = lines[0] || 'Unknown Merchant'

  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
  const date = dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

  // parse items
  const items: ReceiptItem[] = []
  const itemRegex = /(.+?)\s+(\d+)?\s*[\$]?(\d+\.\d{2})/

  for (const line of lines) {
    const match = line.match(itemRegex)
    if (match) {
      const name = match[1].trim()
      const quantity = match[2] ? parseInt(match[2]) : 1
      const price = parseFloat(match[3])
      items.push({
        name,
        quantity,
        price: price / quantity,
        total: price
      })
    }
  }

  // extract totals from receipt
  const subtotalMatch = text.match(/subtotal[:\s]*\$?(\d+\.\d{2})/i)
  const taxMatch = text.match(/tax[:\s]*\$?(\d+\.\d{2})/i)
  const tipMatch = text.match(/tip[:\s]*\$?(\d+\.\d{2})/i)
  const totalMatch = text.match(/total[:\s]*\$?(\d+\.\d{2})/i)

  const subtotal = subtotalMatch ? parseFloat(subtotalMatch[1]) : items.reduce((sum, item) => sum + item.total, 0)
  const tax = taxMatch ? parseFloat(taxMatch[1]) : 0
  const tip = tipMatch ? parseFloat(tipMatch[1]) : 0
  const total = totalMatch ? parseFloat(totalMatch[1]) : subtotal + tax + tip

  return { merchant, date, items, subtotal, tax, tip, total }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('receipt') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No receipt image provided' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    const ASI_API_KEY = process.env.ASI_ONE_API_KEY
    const OCR_SPACE_KEY = process.env.OCR_SPACE_API_KEY

    // try ASI-1 first
    if (ASI_API_KEY) {
      try {
        console.log('Scanning with ASI-1 Mini...')

        const asiResponse = await fetch('https://api.asi1.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ASI_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            model: 'asi1-mini',
            messages: [
              {
                role: 'system',
                content: 'Extract receipt data. Return valid JSON only.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Parse this receipt and extract all items with prices.

Return this JSON format (no markdown):
{
  "merchant": "store name",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "price": unit price,
      "total": line total
    }
  ],
  "subtotal": number,
  "tax": number,
  "tip": number,
  "total": number
}`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: base64Image
                    }
                  }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 2000,
            stream: false
          }),
        })

        if (!asiResponse.ok) {
          const errorText = await asiResponse.text()
          console.error('ASI-1 error:', asiResponse.status, errorText)
          throw new Error(`ASI-1 returned ${asiResponse.status}`)
        }

        const asiData = await asiResponse.json()
        const content = asiData.choices?.[0]?.message?.content || ''

        if (!content) throw new Error('Empty response from ASI-1')

        let receiptData: ReceiptData

        // extract JSON (handle markdown blocks)
        const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (codeBlockMatch) {
          receiptData = JSON.parse(codeBlockMatch[1])
        } else {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            receiptData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        }

        // verify totals add up
        const calculatedTotal = receiptData.subtotal + receiptData.tax + receiptData.tip
        const diff = Math.abs(calculatedTotal - receiptData.total)

        if (diff > 0.01) {
          console.warn(`Total mismatch: ${calculatedTotal} vs ${receiptData.total}`)
          receiptData.total = calculatedTotal
        }

        console.log('Parsed receipt:', receiptData.merchant, receiptData.items.length, 'items')
        return NextResponse.json(receiptData)

      } catch (error) {
        console.error('ASI-1 failed:', error)
        console.log('Trying fallback...')
      }
    }

    // fallback to OCR.space
    if (OCR_SPACE_KEY) {
      try {
        console.log('Using OCR.space...')

        const formData = new FormData()
        formData.append('base64Image', base64Image)
        formData.append('language', 'eng')
        formData.append('detectOrientation', 'true')
        formData.append('scale', 'true')
        formData.append('OCREngine', '2')

        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': OCR_SPACE_KEY,
          },
          body: formData,
        })

        if (ocrResponse.ok) {
          const ocrData = await ocrResponse.json()
          const text = ocrData.ParsedResults?.[0]?.ParsedText || ''

          if (text) {
            const receiptData = parseReceiptText(text)
            console.log('OCR.space parsed:', receiptData.merchant)
            return NextResponse.json(receiptData)
          }
        }
      } catch (error) {
        console.log('OCR.space failed, using mock...', error)
      }
    }

    // fallback mock data
    console.warn('No API keys - using demo data')
    const mockData: ReceiptData = {
      merchant: 'Demo Restaurant',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Classic Burger', quantity: 1, price: 12.99, total: 12.99 },
        { name: 'French Fries', quantity: 2, price: 3.99, total: 7.98 },
        { name: 'Soft Drink', quantity: 2, price: 2.49, total: 4.98 },
        { name: 'Garden Salad', quantity: 1, price: 8.99, total: 8.99 },
      ],
      subtotal: 34.94,
      tax: 3.15,
      tip: 5.00,
      total: 43.09,
    }

    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Receipt scan failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scan receipt' },
      { status: 500 }
    )
  }
}
