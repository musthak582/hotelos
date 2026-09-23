import type { Metadata } from 'next'
import { LPShareClient } from './LPShareClient'
export const metadata: Metadata = {
  title: 'Liquidity Pool Share Calculator — Calculate LP Position & Fee Earnings',
  description: 'Calculate your share of any liquidity pool, expected trading fee earnings, and LP token value. Model different deposit sizes and fee tiers. Free DeFi tool.',
  keywords: ['liquidity pool share calculator', 'lp share calculator', 'defi lp earnings', 'uniswap lp calculator', 'amm fee calculator'],
}
export default function Page() { return <LPShareClient /> }