// ─── Tool 15: Token Allocation Calculator ────────────────────────────────
// File: app/tools/token-allocation-calculator/page.tsx
import type { Metadata } from 'next'
import { TokenAllocationClient } from './TokenAllocationClient'
export const metadata: Metadata = {
  title: 'Token Allocation Calculator — Model Tokenomics Distribution',
  description: 'Design and model token allocation across stakeholders. Visualize distribution, calculate USD values, and validate total supply allocations for any token launch.',
  keywords: ['token allocation calculator', 'tokenomics calculator', 'token distribution', 'ico token allocation'],
}
export default function Page() { return <TokenAllocationClient /> }