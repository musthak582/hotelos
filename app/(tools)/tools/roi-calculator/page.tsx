import type { Metadata } from 'next'
import { ROICalculatorClient } from './ROICalculatorClient'

export const metadata: Metadata = {
  title: 'ROI Calculator — Crypto Return on Investment Calculator',
  description:
    'Calculate return on investment for any crypto trade. Compute profit, loss, ROI percentage, and multiple from entry/exit prices. Supports DCA entries, fees, and multi-scenario analysis. Free Web3 tool.',
  keywords: [
    'crypto roi calculator', 'return on investment calculator', 'crypto profit calculator',
    'bitcoin roi', 'crypto trade calculator', 'investment return calculator',
    'dca calculator crypto', 'crypto gains calculator',
  ],
}

export default function ROICalculatorPage() {
  return <ROICalculatorClient />
}