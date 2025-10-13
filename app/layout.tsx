import { Providers } from './providers'
import { Header } from '@/components/Header'
import './globals.css'

export const metadata = {
  title: 'CircleSettle - Split bills, borrow from friends',
  description: 'Finance for friends, by friends',
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
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}