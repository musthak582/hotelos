import type { Metadata } from 'next'
import { BreakEvenClient } from './BreakEvenClient'
export const metadata: Metadata = {
  title: 'Break-even Calculator — Find Your Crypto Trade Break-even Price',
  description: 'Calculate the exact break-even price for any crypto trade including fees, taxes, and gas costs. Supports long/short positions and DCA entries. Free Web3 trading tool.',
  keywords: ['break-even calculator crypto', 'crypto trade break even', 'break even price calculator', 'crypto fee break even'],
}
export default function Page() { return <BreakEvenClient /> }