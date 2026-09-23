import type { Metadata } from 'next'
import { VestingScheduleClient } from './VestingScheduleClient'
export const metadata: Metadata = {
  title: 'Vesting Schedule Calculator — Token Vesting Timeline Generator',
  description: 'Generate and visualize token vesting schedules. Calculate monthly unlock amounts, cliff periods, and total vested tokens over time. Essential tokenomics tool.',
  keywords: ['vesting schedule calculator', 'token vesting calculator', 'cliff vesting calculator', 'token unlock schedule'],
}
export default function Page() { return <VestingScheduleClient /> }