'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, AlertTriangle, TrendingDown, TrendingUp, Info, ShieldAlert } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Helpers ────────────────────────────────────────────────────────────────
function parseNum(val: string): number {
  const clean = val.trim().replace(/,/g, '')
  const mult: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
  const match = clean.match(/^([\d.]+)\s*([kmbt])$/i)
  if (match) return parseFloat(match[1]) * (mult[match[2].toLowerCase()] ?? 1)
  return parseFloat(clean) || 0
}

function fmt$(n: number, decimals = 3): string {
  if (!n || !isFinite(n)) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(decimals) + 'T'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(decimals)  + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(decimals)  + 'M'
  if (n >= 1e3)  return '$' + (n / 1e3).toFixed(decimals)  + 'K'
  return '$' + n.toFixed(2)
}

function fmtPrice(n: number): string {
  if (!n || !isFinite(n)) return '—'
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1)    return '$' + n.toFixed(4)
  if (n >= 0.01) return '$' + n.toFixed(6)
  return '$' + n.toExponential(4)
}

function fmtSupply(n: number): string {
  if (!n) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(2)  + 'K'
  return n.toLocaleString('en-US')
}

// ── Risk thresholds ────────────────────────────────────────────────────────
function getFdvRisk(ratio: number): { level: 'low' | 'medium' | 'high' | 'extreme'; label: string; description: string } {
  if (ratio <= 1.5)  return { level: 'low',     label: 'Low Risk',     description: 'FDV is close to market cap. Most supply is already circulating — limited future dilution.' }
  if (ratio <= 3)    return { level: 'medium',   label: 'Medium Risk',  description: 'Moderate dilution ahead. Watch unlock schedules and vesting events carefully.' }
  if (ratio <= 10)   return { level: 'high',     label: 'High Risk',    description: 'Significant dilution ahead. Large token unlocks could create heavy sell pressure.' }
  return               { level: 'extreme',  label: 'Extreme Risk', description: 'Extreme dilution risk. Most supply is locked — future unlocks may severely impact price.' }
}

// ── Reference FDV benchmarks ───────────────────────────────────────────────
const REFERENCE_FDVS = [
  { name: 'Bitcoin',  ticker: 'BTC', fdv: 1_300_000_000_000 },
  { name: 'Ethereum', ticker: 'ETH', fdv: 420_000_000_000   },
  { name: 'Solana',   ticker: 'SOL', fdv: 95_000_000_000    },
  { name: '$10B',     ticker: '',    fdv: 10_000_000_000     },
  { name: '$1B',      ticker: '',    fdv: 1_000_000_000      },
  { name: '$100M',    ticker: '',    fdv: 100_000_000        },
]

// Unlock impact scenarios (% of remaining locked supply unlocked at once)
const UNLOCK_SCENARIOS = [5, 10, 20, 30, 50, 100]

// ── Component ──────────────────────────────────────────────────────────────
export function FDVCalculatorClient() {
  const tool = getToolBySlug('fdv-calculator')!

  const [priceRaw,       setPriceRaw]       = useState('2.00')
  const [circSupplyRaw,  setCircSupplyRaw]  = useState('500000000')
  const [maxSupplyRaw,   setMaxSupplyRaw]   = useState('2000000000')
  const [sellPressure,   setSellPressure]   = useState('30')   // % of newly unlocked tokens that get sold

  // Derived
  const price      = useMemo(() => parseNum(priceRaw),      [priceRaw])
  const circSupply = useMemo(() => parseNum(circSupplyRaw), [circSupplyRaw])
  const maxSupply  = useMemo(() => parseNum(maxSupplyRaw),  [maxSupplyRaw])
  const sellPct    = useMemo(() => parseFloat(sellPressure) / 100 || 0.3, [sellPressure])

  const mcap       = price * circSupply
  const fdv        = price * maxSupply
  const locked     = Math.max(0, maxSupply - circSupply)
  const circPct    = maxSupply > 0 ? (circSupply / maxSupply) * 100 : 0
  const fdvRatio   = mcap > 0 ? fdv / mcap : 0
  const risk       = fdvRatio > 0 ? getFdvRisk(fdvRatio) : null

  const isValid    = price > 0 && circSupply > 0 && maxSupply > 0

  // Price impact of unlock scenarios
  // Simple model: new tokens unlocked → sell pressure → price impact
  // Price impact ≈ (newly sold tokens / (circulating + newly sold)) × sell pressure factor
  const unlockImpacts = useMemo(() => {
    if (!isValid || locked <= 0) return []
    return UNLOCK_SCENARIOS.map(pct => {
      const newTokens   = locked * (pct / 100)
      const sold        = newTokens * sellPct
      const newCirc     = circSupply + newTokens
      // Basic supply-demand impact: additional supply dilutes existing holders
      const dilutionPct = (sold / newCirc) * 100
      const newPrice    = price * (1 - dilutionPct / 100)
      const newMcap     = newPrice * (circSupply + newTokens)
      return {
        pct,
        newTokens,
        sold,
        dilutionPct,
        newPrice,
        newMcap,
        priceDelta: ((newPrice - price) / price) * 100,
      }
    })
  }, [isValid, locked, circSupply, price, sellPct])

  const reset = () => {
    setPriceRaw('2.00')
    setCircSupplyRaw('500000000')
    setMaxSupplyRaw('2000000000')
    setSellPressure('30')
  }

  const riskColors: Record<string, string> = {
    low:     'border-zinc-300 bg-zinc-50 text-zinc-700',
    medium:  'border-zinc-400 bg-zinc-100 text-zinc-800',
    high:    'border-zinc-600 bg-zinc-200 text-zinc-900',
    extreme: 'border-black bg-black text-white',
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Inputs ─── */}
        <ToolSection
          title="Token Parameters"
          description="Enter price and supply details to calculate FDV and dilution risk"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <InputGroup label="Token Price (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="text"
                  value={priceRaw}
                  onChange={e => setPriceRaw(e.target.value)}
                  placeholder="2.00"
                  className="tool-input pl-7 font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$0.1','0.1'],['$1','1'],['$5','5'],['$10','10'],['$50','50'],['$100','100']].map(([l,v]) => (
                  <button key={v} onClick={() => setPriceRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${priceRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Circulating Supply" hint="Tokens currently in circulation">
              <input
                type="text"
                value={circSupplyRaw}
                onChange={e => setCircSupplyRaw(e.target.value)}
                placeholder="500M"
                className="tool-input font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['100M','100000000'],['250M','250000000'],['500M','500000000'],['1B','1000000000']].map(([l,v]) => (
                  <button key={v} onClick={() => setCircSupplyRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${circSupplyRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Max / Total Supply" hint="All tokens that will ever exist">
              <input
                type="text"
                value={maxSupplyRaw}
                onChange={e => setMaxSupplyRaw(e.target.value)}
                placeholder="2B"
                className="tool-input font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['500M','500000000'],['1B','1000000000'],['2B','2000000000'],['10B','10000000000'],['100B','100000000000']].map(([l,v]) => (
                  <button key={v} onClick={() => setMaxSupplyRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${maxSupplyRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup
              label="Sell Pressure Assumption (%)"
              hint="Estimated % of newly unlocked tokens that get sold immediately"
            >
              <input
                type="number"
                value={sellPressure}
                onChange={e => setSellPressure(e.target.value)}
                min={0} max={100}
                placeholder="30"
                className="tool-input font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['10','20','30','50','70','100'].map(v => (
                  <button key={v} onClick={() => setSellPressure(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${sellPressure === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {v}%
                  </button>
                ))}
              </div>
            </InputGroup>

          </div>
        </ToolSection>

        {isValid && (
          <>
            {/* ─── Hero FDV Result ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FDV Card */}
              <div className="p-6 rounded-xl border-2 border-black bg-black text-white">
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Fully Diluted Valuation</p>
                <p className="text-4xl sm:text-5xl font-bold font-mono tracking-tight">{fmt$(fdv)}</p>
                <p className="text-xs text-zinc-400 mt-3">
                  {fmtPrice(price)} × {fmtSupply(maxSupply)} max supply
                </p>
              </div>

              {/* MCap vs FDV */}
              <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">MCap vs FDV</p>

                {/* Visual ratio bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                    <span>Market Cap ({circPct.toFixed(0)}%)</span>
                    <span>Locked ({(100 - circPct).toFixed(0)}%)</span>
                  </div>
                  <div className="h-4 rounded-full bg-zinc-200 overflow-hidden flex">
                    <div
                      className="h-full bg-black rounded-l-full transition-all"
                      style={{ width: `${Math.min(circPct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono">{fmt$(mcap)}</span>
                  <span className="text-xs text-zinc-400">market cap</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-semibold font-mono text-zinc-500">{fmt$(fdv)}</span>
                  <span className="text-xs text-zinc-400">FDV</span>
                </div>
                <div className="mt-2 text-sm font-bold">
                  FDV/MCap: <span className="font-mono">{fdvRatio.toFixed(2)}×</span>
                </div>
              </div>
            </div>

            {/* ─── Risk Assessment ─── */}
            {risk && (
              <div className={`p-5 rounded-xl border-2 ${riskColors[risk.level]}`}>
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm">{risk.label}</p>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border
                        ${risk.level === 'extreme' ? 'border-white/30 bg-white/10' : 'border-current bg-white/50'}`}>
                        {fdvRatio.toFixed(2)}× FDV/MCap
                      </span>
                    </div>
                    <p className="text-sm opacity-80">{risk.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Key Metrics ─── */}
            <ToolSection title="Full Metrics">
              <InfoCard
                title="FDV Analysis"
                items={[
                  { label: 'Token Price',          value: fmtPrice(price) },
                  { label: 'Circulating Supply',   value: fmtSupply(circSupply) },
                  { label: 'Locked Supply',         value: fmtSupply(locked) },
                  { label: 'Max Supply',            value: fmtSupply(maxSupply) },
                  { label: 'Circulation %',         value: circPct.toFixed(2) + '%' },
                  { label: 'Market Cap',            value: fmt$(mcap) },
                  { label: 'Fully Diluted Value',   value: fmt$(fdv), highlight: true },
                  { label: 'FDV / Market Cap',      value: fdvRatio.toFixed(2) + '×' },
                  { label: 'Locked Value (USD)',    value: fmt$(locked * price) },
                ]}
              />
            </ToolSection>

            {/* ─── FDV vs Reference ─── */}
            <ToolSection
              title="FDV Benchmarks"
              description="How this token's FDV compares to top crypto assets"
            >
              <div className="space-y-2">
                {REFERENCE_FDVS.map(ref => {
                  const ratio   = fdv / ref.fdv
                  const isAbove = fdv >= ref.fdv
                  const barW    = isAbove ? 100 : (fdv / ref.fdv) * 100

                  return (
                    <div key={ref.name} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-zinc-300 transition-colors">
                      <div className="w-24 shrink-0">
                        <p className="text-xs font-semibold text-black">{ref.name}</p>
                        {ref.ticker && <p className="text-[10px] text-zinc-400">{ref.ticker}</p>}
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isAbove ? 'bg-black' : 'bg-zinc-400'}`}
                          style={{ width: `${Math.min(barW, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-400 w-20 text-right shrink-0">{fmt$(ref.fdv)}</span>
                      <span className={`text-xs font-bold font-mono w-16 text-right shrink-0 ${isAbove ? 'text-black' : 'text-zinc-400'}`}>
                        {isAbove ? ratio.toFixed(2) + '×' : (ratio * 100).toFixed(1) + '%'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </ToolSection>

            {/* ─── Unlock Impact Simulator ─── */}
            {locked > 0 && (
              <ToolSection
                title="Unlock Impact Simulator"
                description={`Estimated price impact if a % of locked supply (${fmtSupply(locked)}) is unlocked at once. Assumes ${sellPressure}% sell pressure.`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black">
                        {['Unlock %', 'Tokens Released', 'Tokens Sold', 'Est. New Price', 'Price Impact', 'New MCap'].map(h => (
                          <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {unlockImpacts.map(row => (
                        <tr key={row.pct} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50 transition-colors">
                          <td className="py-3 pr-4 font-semibold text-black">{row.pct}%</td>
                          <td className="py-3 pr-4 font-mono text-zinc-600 text-xs">{fmtSupply(row.newTokens)}</td>
                          <td className="py-3 pr-4 font-mono text-zinc-600 text-xs">{fmtSupply(row.sold)}</td>
                          <td className="py-3 pr-4 font-mono font-semibold text-black">{fmtPrice(row.newPrice)}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold font-mono
                              ${row.priceDelta < 0 ? 'text-zinc-600' : 'text-zinc-400'}`}>
                              <TrendingDown size={11} />
                              {row.priceDelta.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 font-mono text-zinc-600 text-xs">{fmt$(row.newMcap)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-zinc-400 mt-3 flex items-start gap-1.5">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  This is a simplified model. Real-world impact depends on liquidity depth, market conditions, and vesting cliff timing. Use as a directional guide only.
                </p>
              </ToolSection>
            )}

            {/* ─── Price to hit FDV parity ─── */}
            <ToolSection
              title="Supply Scenarios"
              description="What price keeps FDV constant as more supply enters circulation?"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Circ. Supply</th>
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">% of Max</th>
                      <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Price (FDV held)</th>
                      <th className="text-left py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Price Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[10,25,50,75,100].map(pct => {
                      const supplyAtPct = maxSupply * (pct / 100)
                      const priceAtPct  = fdv / supplyAtPct
                      const delta       = ((priceAtPct - price) / price) * 100
                      const isCurrent   = Math.abs(supplyAtPct - circSupply) / maxSupply < 0.02
                      return (
                        <tr key={pct} className={`border-b border-[var(--border)] last:border-0 transition-colors
                          ${isCurrent ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                          <td className="py-3 pr-4 font-mono text-black font-semibold">{fmtSupply(supplyAtPct)}</td>
                          <td className="py-3 pr-4 font-mono text-zinc-500">{pct}%</td>
                          <td className="py-3 pr-4 font-mono font-bold text-black">{fmtPrice(priceAtPct)}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold
                              ${delta > 0 ? 'text-zinc-700' : delta < 0 ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                              {isCurrent && <span className="badge-default ml-1 text-[9px]">now</span>}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
                <Info size={12} />
                Shows what token price must be to maintain current FDV as circulating supply increases.
              </p>
            </ToolSection>
          </>
        )}

        {/* ─── Formula ─── */}
        <ToolSection title="What is FDV?">
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-sm">
              <p className="text-zinc-500 text-xs mb-1">Formula</p>
              <p className="font-semibold text-black">FDV = Current Price × Maximum Token Supply</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600">
              {[
                { t: 'FDV vs MCap',      b: 'FDV assumes all tokens are in circulation at today\'s price. A high FDV/MCap ratio signals future dilution risk from vesting unlocks.' },
                { t: 'FDV/MCap Ratio',   b: 'Ratio of 1× = fully diluted already. 2–3× = moderate. 5×+ = significant locked supply still to unlock. 10×+ = extreme dilution ahead.' },
                { t: 'Dilution Risk',    b: 'As locked tokens vest and enter circulation, holders face dilution. If demand doesn\'t grow proportionally, price tends to decrease.' },
              ].map(item => (
                <div key={item.t} className="p-3 rounded-lg border border-[var(--border)]">
                  <p className="font-semibold text-black mb-1">{item.t}</p>
                  <p className="leading-relaxed">{item.b}</p>
                </div>
              ))}
            </div>
          </div>
        </ToolSection>

        {/* Reset */}
        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs">
            <RefreshCw size={12} />
            Reset
          </button>
        </div>

      </div>
    </ToolLayout>
  )
}