import type { Metadata } from 'next'
import { MarketCapCalculatorClient } from './MarketCapCalculatorClient'

export const metadata: Metadata = {
  title: 'Market Cap Calculator — Calculate Crypto Market Capitalization',
  description:
    'Calculate cryptocurrency market cap from price and circulating supply. Compare against top assets, analyze rank scenarios, and model target market caps. Free Web3 tool for traders and analysts.',
  keywords: [
    'market cap calculator', 'crypto market cap', 'market capitalization calculator',
    'token market cap', 'crypto ranking tool', 'bitcoin market cap comparison',
    'defi market cap', 'altcoin market cap calculator',
  ],
}

export default function MarketCapCalculatorPage() {
  return <MarketCapCalculatorClient />
}