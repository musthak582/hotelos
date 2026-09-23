import type { Metadata } from 'next'
import { APYCalculatorClient } from './APYCalculatorClient'

export const metadata: Metadata = {
  title: 'APY Calculator — Annual Percentage Yield Calculator for DeFi & Staking',
  description:
    'Calculate APY from APR with any compounding frequency. Model staking rewards, liquidity mining, and yield farming returns over time. Compare daily, weekly, monthly compounding. Free Web3 DeFi tool.',
  keywords: [
    'apy calculator', 'apr to apy calculator', 'defi apy calculator',
    'staking apy', 'compound interest crypto', 'yield calculator crypto',
    'annual percentage yield', 'defi yield calculator', 'crypto compounding calculator',
  ],
}

export default function APYCalculatorPage() {
  return <APYCalculatorClient />
}