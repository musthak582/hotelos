import type { Metadata } from 'next'
import { TransactionFeeEstimatorClient } from './TransactionFeeEstimatorClient'

export const metadata: Metadata = {
  title: 'Transaction Fee Estimator — Compare ETH Gas Costs Across Scenarios',
  description:
    'Estimate and compare Ethereum transaction fees across slow, standard, and fast gas scenarios. Supports batch transactions, ERC-20 transfers, swaps, NFT mints, and contract deployments. Free Web3 tool.',
  keywords: [
    'transaction fee estimator', 'ethereum transaction cost', 'eth gas comparison',
    'batch transaction fees', 'erc20 transfer cost', 'smart contract gas cost',
    'defi transaction fees', 'gas price estimator',
  ],
}

export default function TransactionFeeEstimatorPage() {
  return <TransactionFeeEstimatorClient />
}