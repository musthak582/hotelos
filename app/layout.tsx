import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Web3Tools — 100+ Free Tools for Web3 Developers & Traders',
    template: '%s | Web3Tools',
  },
  description:
    'Professional-grade Web3 tools for developers, traders, and DeFi users. Gas calculators, converters, smart contract utilities, security checkers, and more — all free.',
  keywords: [
    'web3 tools', 'ethereum tools', 'solidity tools', 'defi calculator',
    'gas fee calculator', 'crypto converter', 'smart contract tools',
  ],
  authors: [{ name: 'Web3Tools' }],
  creator: 'Web3Tools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://web3tools.dev',
    siteName: 'Web3Tools',
    title: 'Web3Tools — 100+ Free Tools for Web3 Developers & Traders',
    description: 'Professional-grade Web3 tools for developers, traders, and DeFi users.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3Tools — 100+ Free Tools for Web3 Developers & Traders',
    description: 'Professional-grade Web3 tools for developers, traders, and DeFi users.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-black antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}