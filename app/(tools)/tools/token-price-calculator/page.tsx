import type { Metadata } from 'next'
import { TokenPriceCalculatorClient } from './TokenPriceCalculatorClient'

export const metadata: Metadata = {
  title: 'Token Price Calculator — Calculate Crypto Token Value from Market Cap & Supply',
  description:
    'Calculate token price from market cap and circulating supply, or reverse-calculate market cap from price. Supports FDV, price targets, and multi-scenario analysis. Free Web3 tool for traders and analysts.',
  keywords: [
    'token price calculator', 'crypto price calculator', 'market cap to price',
    'token valuation tool', 'circulating supply calculator', 'fdv price target',
    'crypto token price', 'defi token calculator',
  ],
}

export default function TokenPriceCalculatorPage() {
  return <TokenPriceCalculatorClient />
}