import type { Metadata } from 'next'
import { PortfolioAllocationClient } from './PortfolioAllocationClient'
export const metadata: Metadata = {
  title: 'Portfolio Allocation Calculator — Crypto Portfolio Risk & Allocation Tool',
  description: 'Calculate optimal crypto portfolio allocation by risk profile. Model conservative, balanced, and aggressive strategies. Track allocation percentages, USD values, and rebalancing needs.',
  keywords: ['crypto portfolio calculator', 'portfolio allocation tool', 'crypto asset allocation', 'portfolio rebalancing calculator', 'crypto risk allocation'],
}
export default function Page() { return <PortfolioAllocationClient /> }