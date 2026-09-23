import type { Metadata } from 'next'
import { StakingRewardsClient } from './StakingRewardsClient'

export const metadata: Metadata = {
  title: 'Staking Rewards Calculator — Estimate Crypto Staking Returns',
  description:
    'Calculate staking rewards over time with compounding options. Model ETH, SOL, and any token staking returns. Includes lock-up periods, validator fees, and reinvestment scenarios.',
  keywords: ['staking rewards calculator', 'eth staking calculator', 'crypto staking returns', 'staking apy calculator', 'validator rewards calculator'],
}
export default function Page() { return <StakingRewardsClient /> }