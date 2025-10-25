import { Providers } from './providers'
import { Header } from '@/components/Header'
import { NavigationLoader } from '@/components/NavigationLoader'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CircleSettle - Fair bill splitting, built on trust',
  description: 'Web3-powered bill-splitting app with AI receipt scanning and on-chain credit score system. Split bills fairly with friends and build your financial reputation.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo.png', type: 'image/png' }
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'CircleSettle - Fair bill splitting, built on trust',
    description: 'Split bills with AI, build credit on-chain',
    images: ['/images/hero.jpeg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavigationLoader />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}