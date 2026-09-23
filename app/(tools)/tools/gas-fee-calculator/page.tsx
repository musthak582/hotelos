import type { Metadata } from 'next'
import { GasFeeCalculatorClient } from './GasFeeCalculatorClient'

export const metadata: Metadata = {
  title: 'Gas Fee Calculator — Estimate Ethereum Gas Costs in ETH & USD',
  description:
    'Free Ethereum gas fee calculator. Estimate transaction costs using real gas prices (slow, standard, fast). Supports ETH to USD conversion, ERC-20 transfers, contract deployments, and custom gas limits.',
  keywords: [
    'gas fee calculator', 'ethereum gas calculator', 'eth gas estimator',
    'gwei calculator', 'transaction fee calculator', 'ethereum transaction cost',
  ],
}

export default function GasFeeCalculatorPage() {
  return <GasFeeCalculatorClient />
}