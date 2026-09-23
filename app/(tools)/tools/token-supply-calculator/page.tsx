import type { Metadata } from 'next'
import { TokenSupplyCalculatorClient } from './TokenSupplyCalculatorClient'

export const metadata: Metadata = {
  title: 'Token Supply Calculator — Analyze Circulating, Total & Max Supply Metrics',
  description:
    'Calculate and analyze token supply metrics including circulating supply, total supply, max supply, inflation rate, and unlock schedules. Essential tokenomics tool for Web3 founders, analysts, and traders.',
  keywords: [
    'token supply calculator', 'circulating supply', 'total supply', 'max supply',
    'tokenomics calculator', 'token inflation rate', 'token unlock schedule',
    'crypto supply metrics', 'token distribution calculator',
  ],
}

export default function TokenSupplyCalculatorPage() {
  return <TokenSupplyCalculatorClient />
}