'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Lock } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

const PRESETS = [
  { name: 'Ethereum (ETH)',  apy: 3.9,  fee: 10, lockDays: 0   },
  { name: 'Solana (SOL)',    apy: 7.2,  fee: 8,  lockDays: 2   },
  { name: 'Cardano (ADA)',   apy: 4.6,  fee: 5,  lockDays: 5   },
  { name: 'Polkadot (DOT)',  apy: 14.0, fee: 10, lockDays: 28  },
  { name: 'Cosmos (ATOM)',   apy: 19.0, fee: 5,  lockDays: 21  },
  { name: 'Custom',          apy: 10,   fee: 5,  lockDays: 0   },
]

const PERIODS = [
  { label:'1 Month', days: 30  },
  { label:'3 Months',days: 90  },
  { label:'6 Months',days: 180 },
  { label:'1 Year',  days: 365 },
  { label:'2 Years', days: 730 },
  { label:'3 Years', days: 1095},
  { label:'5 Years', days: 1825},
]

function fmtN(n:number, dec=2):string { return n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}) }
function fmt$(n:number):string {
  if(n>=1e6) return '$'+(n/1e6).toFixed(3)+'M'
  if(n>=1e3) return '$'+fmtN(n)
  return '$'+n.toFixed(2)
}
function fmtPct(n:number):string { return n.toFixed(2)+'%' }

export function StakingRewardsClient() {
  const tool = getToolBySlug('staking-rewards-calculator')!

  const [presetIdx,    setPresetIdx]    = useState(0)
  const [stakeRaw,     setStakeRaw]     = useState('10000')
  const [tokenPrice,   setTokenPrice]   = useState('3200')
  const [apyRaw,       setApyRaw]       = useState('3.9')
  const [validatorFee, setValidatorFee] = useState('10')
  const [lockDays,     setLockDays]     = useState('0')
  const [compound,     setCompound]     = useState(true)
  const [daysRaw,      setDaysRaw]      = useState('365')

  const staked   = parseFloat(stakeRaw.replace(/,/g,'')) || 0
  const price    = parseFloat(tokenPrice)                || 0
  const grossApy = parseFloat(apyRaw)                    || 0
  const fee      = parseFloat(validatorFee)              || 0
  const lock     = parseInt(lockDays)                    || 0
  const d        = parseInt(daysRaw)                     || 365

  // Net APY after validator fee
  const netApy = grossApy * (1 - fee / 100)

  // Staked in USD
  const stakedUsd = staked * price

  // Rewards calc
  const calcRewards = (days: number) => {
    if (!staked || !netApy) return { tokens: 0, usd: 0, totalTokens: 0, totalUsd: 0 }
    const years = days / 365
    let totalTokens: number
    if (compound) {
      totalTokens = staked * Math.pow(1 + netApy / 100, years)
    } else {
      totalTokens = staked * (1 + (netApy / 100) * years)
    }
    const earned = totalTokens - staked
    return { tokens: earned, usd: earned * price, totalTokens, totalUsd: totalTokens * price }
  }

  const current = calcRewards(d)
  const timeline = PERIODS.map(p => ({ ...p, ...calcRewards(p.days) }))

  const applyPreset = (idx: number) => {
    setPresetIdx(idx)
    const p = PRESETS[idx]
    setApyRaw(p.apy.toString())
    setValidatorFee(p.fee.toString())
    setLockDays(p.lockDays.toString())
  }

  const reset = () => { applyPreset(0); setStakeRaw('10000'); setTokenPrice('3200'); setDaysRaw('365'); setCompound(true) }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* Protocol presets */}
        <ToolSection title="Select Network" description="Choose a staking network or configure custom parameters">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESETS.map((p, i) => (
              <button key={p.name} onClick={() => applyPreset(i)}
                className={`flex flex-col items-start px-3 py-3 rounded-xl border text-left transition-all cursor-pointer
                  ${presetIdx === i ? 'bg-black text-white border-black' : 'border-[var(--border)] hover:border-zinc-400'}`}>
                <span className="text-xs font-semibold leading-tight">{p.name}</span>
                <span className={`text-[10px] mt-1 font-mono ${presetIdx === i ? 'text-zinc-400' : 'text-zinc-400'}`}>{p.apy}% APY</span>
              </button>
            ))}
          </div>
        </ToolSection>

        <ToolSection title="Staking Parameters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Amount to Stake (Tokens)">
              <input type="text" value={stakeRaw} onChange={e => setStakeRaw(e.target.value)} className="tool-input font-mono" placeholder="10000" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['100','1000','10000','32','100000'].map(v => (
                  <button key={v} onClick={() => setStakeRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${stakeRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Token Price (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={tokenPrice} onChange={e => setTokenPrice(e.target.value)} className="tool-input pl-7 font-mono" />
              </div>
            </InputGroup>

            <InputGroup label="Gross APY (%)" hint="Annual yield before validator fees">
              <input type="number" value={apyRaw} onChange={e => { setApyRaw(e.target.value); setPresetIdx(5) }} className="tool-input font-mono" step="0.1" />
            </InputGroup>

            <InputGroup label="Validator Fee (%)" hint="Commission taken by validator node">
              <input type="number" value={validatorFee} onChange={e => { setValidatorFee(e.target.value); setPresetIdx(5) }} className="tool-input font-mono" step="0.1" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','3','5','8','10','15','20'].map(v => (
                  <button key={v} onClick={() => setValidatorFee(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${validatorFee===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Lock-up Period (Days)" hint="Days before you can unstake">
              <input type="number" value={lockDays} onChange={e => setLockDays(e.target.value)} className="tool-input font-mono" />
            </InputGroup>

            <InputGroup label="Duration (Days)">
              <input type="number" value={daysRaw} onChange={e => setDaysRaw(e.target.value)} className="tool-input font-mono" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['30d','30'],['90d','90'],['180d','180'],['1yr','365'],['2yr','730'],['3yr','1095']].map(([l,v]) => (
                  <button key={v} onClick={() => setDaysRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${daysRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>

            <div className="sm:col-span-2">
              <InputGroup label="Reward Compounding">
                <div className="flex gap-2">
                  {[{ v: true, l: '🔁 Auto-compound' }, { v: false, l: '📤 No compounding' }].map(opt => (
                    <button key={String(opt.v)} onClick={() => setCompound(opt.v)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer
                        ${compound === opt.v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </InputGroup>
            </div>
          </div>
        </ToolSection>

        {staked > 0 && (
          <>
            {/* Hero */}
            <div className="p-6 rounded-xl border-2 border-black bg-black text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Rewards after {daysRaw} days</p>
                  <p className="text-4xl font-bold font-mono">+{fmtN(current.tokens, 4)} tokens</p>
                  {price > 0 && <p className="text-xl font-semibold text-zinc-300 mt-1">≈ {fmt$(current.usd)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-1">Net APY</p>
                  <p className="text-2xl font-bold font-mono">{fmtPct(netApy)}</p>
                  <p className="text-xs text-zinc-500">after {fee}% fee</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                {[
                  { l: 'Total Staked',    v: fmtN(staked, 2) + ' tokens' },
                  { l: 'Staked USD',      v: price > 0 ? fmt$(stakedUsd) : '—' },
                  { l: 'Total After',     v: fmtN(current.totalTokens, 4) + ' tokens' },
                  { l: 'Lock-up',         v: lock > 0 ? lock + ' days' : 'None' },
                ].map(m => (
                  <div key={m.l}>
                    <p className="text-xs text-zinc-400 mb-0.5">{m.l}</p>
                    <p className="text-sm font-bold font-mono">{m.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="APY Breakdown" items={[
                { label: 'Gross APY',      value: fmtPct(grossApy) },
                { label: 'Validator Fee',  value: fmtPct(fee) },
                { label: 'Net APY',        value: fmtPct(netApy), highlight: true },
                { label: 'Daily Rate',     value: (netApy / 365).toFixed(4) + '%' },
                { label: 'Weekly Rate',    value: (netApy / 52).toFixed(4) + '%' },
                { label: 'Monthly Rate',   value: (netApy / 12).toFixed(4) + '%' },
              ]} />
              <InfoCard title="Quick Earnings" items={[
                { label: 'Daily',   value: fmtN(staked * netApy / 100 / 365, 4) + (price > 0 ? ' ≈ ' + fmt$(staked * netApy / 100 / 365 * price) : '') },
                { label: 'Weekly',  value: fmtN(staked * netApy / 100 / 52,  4) + (price > 0 ? ' ≈ ' + fmt$(staked * netApy / 100 / 52  * price) : '') },
                { label: 'Monthly', value: fmtN(staked * netApy / 100 / 12,  4) + (price > 0 ? ' ≈ ' + fmt$(staked * netApy / 100 / 12  * price) : '') },
                { label: 'Yearly',  value: fmtN(staked * netApy / 100,       4) + (price > 0 ? ' ≈ ' + fmt$(staked * netApy / 100       * price) : ''), highlight: true },
              ]} />
            </div>

            {/* Timeline table */}
            <ToolSection title="Rewards Timeline">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Period','Reward Tokens','Reward USD','Total Tokens','Total USD','ROI'].map(h => (
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map(row => {
                      const roi = staked > 0 ? (row.tokens / staked) * 100 : 0
                      const isCurrent = Math.abs(row.days - d) < 1
                      return (
                        <tr key={row.label} className={`border-b border-[var(--border)] last:border-0 transition-colors ${isCurrent ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                          <td className="py-3 pr-4 font-medium text-black">
                            {row.label}{isCurrent && <span className="ml-1.5 badge-default text-[9px]">selected</span>}
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs">+{fmtN(row.tokens, 4)}</td>
                          <td className="py-3 pr-4 font-mono text-xs">{price > 0 ? '+' + fmt$(row.usd) : '—'}</td>
                          <td className="py-3 pr-4 font-mono text-xs font-semibold">{fmtN(row.totalTokens, 4)}</td>
                          <td className="py-3 pr-4 font-mono text-xs">{price > 0 ? fmt$(row.totalUsd) : '—'}</td>
                          <td className="py-3 font-mono text-xs font-bold">+{fmtPct(roi)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ToolSection>
          </>
        )}

        {lock > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-zinc-50">
            <Lock size={15} className="text-zinc-500 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-600">
              <strong className="text-black">{lock}-day lock-up period.</strong> Rewards accrue during lock-up but cannot be withdrawn until the unbonding period ends.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}