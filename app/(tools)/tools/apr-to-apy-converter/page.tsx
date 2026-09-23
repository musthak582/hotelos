import type { Metadata } from 'next'
import { APRToAPYConverterClient } from './APRToAPYConverterClient'

export const metadata: Metadata = {
  title: 'APR to APY Converter — Convert Annual Percentage Rate to Yield',
  description:
    'Instantly convert APR to APY and APY to APR for any compounding interval. Compare rates across DeFi protocols, staking platforms, and lending markets. Free Web3 yield calculator.',
  keywords: [
    'apr to apy converter', 'apy to apr converter', 'apr apy calculator',
    'convert apr to apy', 'defi rate converter', 'staking rate calculator',
    'annual percentage yield converter', 'crypto interest rate converter',
  ],
}

export default function APRToAPYConverterPage() {
  return <APRToAPYConverterClient />
}