import type { Metadata } from 'next'
import { NFTProfitClient } from './NFTProfitClient'
export const metadata: Metadata = {
  title: 'NFT Profit Calculator — Calculate NFT Trading Profit After Fees',
  description: 'Calculate NFT profit and loss after marketplace fees, royalties, and gas costs. Compare buy/sell prices and find break-even points. Free Web3 NFT trading tool.',
  keywords: ['nft profit calculator', 'nft trading calculator', 'nft royalty calculator', 'opensea fees calculator', 'nft break even'],
}
export default function Page() { return <NFTProfitClient /> }