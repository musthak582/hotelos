import type { Metadata } from 'next'
import { YieldFarmingClient } from './YieldFarmingClient'

export const metadata: Metadata = {
  title: 'Yield Farming Calculator — DeFi Yield Farming Returns & Profit Calculator',
  description:
    'Calculate yield farming returns including gas costs, impermanent loss, and compounding. Model net profit across different APY scenarios and holding periods. Free DeFi tool.',
  keywords: ['yield farming calculator', 'defi farming returns', 'liquidity mining calculator', 'farming apy calculator', 'defi profit calculator'],
}
export default function Page() { return <YieldFarmingClient /> }