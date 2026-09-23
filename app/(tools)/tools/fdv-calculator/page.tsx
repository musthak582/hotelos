import type { Metadata } from 'next'
import { FDVCalculatorClient } from './FDVCalculatorClient'

export const metadata: Metadata = {
  title: 'FDV Calculator — Fully Diluted Valuation for Crypto Tokens',
  description:
    'Calculate fully diluted valuation (FDV) for any crypto token. Compare FDV vs market cap, analyze dilution risk, model unlock impact on price, and benchmark against top assets. Free Web3 tool.',
  keywords: [
    'fdv calculator', 'fully diluted valuation', 'crypto fdv', 'token fdv calculator',
    'fdv vs market cap', 'token dilution calculator', 'fully diluted market cap',
    'crypto valuation tool', 'tokenomics fdv',
  ],
}

export default function FDVCalculatorPage() {
  return <FDVCalculatorClient />
}