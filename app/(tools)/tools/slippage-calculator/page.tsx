import type { Metadata } from 'next'
import { SlippageClient } from './SlippageClient'
export const metadata: Metadata = {
  title: 'Slippage Calculator — Estimate DEX Trade Slippage & Price Impact',
  description: 'Calculate slippage and price impact for DEX trades on Uniswap, Curve, and other AMMs. Model optimal trade sizes and find slippage tolerance settings. Free Web3 tool.',
  keywords: ['slippage calculator', 'dex slippage', 'price impact calculator', 'uniswap slippage', 'amm price impact', 'defi trade slippage'],
}
export default function Page() { return <SlippageClient /> }