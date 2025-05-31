import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './Navigation'
import { StagewiseToolbar } from '@stagewise/toolbar-next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deeper Mail',
  description: 'A decentralized email system',
}

const stagewiseConfig = {
  plugins: []
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
      </body>
    </html>
  )
}
