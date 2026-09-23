import type { Metadata } from 'next'
import { CryptoTaxClient } from './CryptoTaxClient'
export const metadata: Metadata = {
  title: 'Crypto Tax Calculator — Estimate Capital Gains Tax on Crypto Trades',
  description: 'Estimate capital gains tax on crypto trades. Supports short-term and long-term rates, FIFO/LIFO methods, and multiple jurisdictions. Free Web3 tax tool.',
  keywords: ['crypto tax calculator', 'bitcoin tax calculator', 'capital gains crypto', 'crypto trading tax', 'defi tax calculator'],
}
export default function Page() { return <CryptoTaxClient /> }