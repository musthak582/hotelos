import type { Metadata } from 'next'
import { ImpermanentLossClient } from './ImpermanentLossClient'

export const metadata: Metadata = {
  title: 'Impermanent Loss Calculator — DeFi LP Impermanent Loss Tool',
  description:
    'Calculate impermanent loss for any liquidity pool position. Compare LP returns vs holding, model price scenarios, and understand fee break-even points. Free DeFi tool for Uniswap, Curve, and more.',
  keywords: ['impermanent loss calculator', 'defi lp calculator', 'uniswap impermanent loss', 'liquidity pool loss', 'amm impermanent loss'],
}
export default function Page() { return <ImpermanentLossClient /> }