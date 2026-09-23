'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Info, ArrowRight } from 'lucide-react'
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

function formatMcap(n: number): string {
  if (!n || !isFinite(n)) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(3) + 'T'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(3)  + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(3)  + 'M'
  if (n >= 1e3)  return '$' + (n / 1e3).toFixed(3)  + 'K'
  return '$' + n.toFixed(2)
}

function formatPrice(n: number): string {
  if (!n || !isFinite(n)) return '—'
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1)    return '$' + n.toFixed(4)
  if (n >= 0.01) return '$' + n.toFixed(6)
  return '$' + n.toExponential(4)
}

function formatSupply(n: number): string {
  if (!n) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(2)  + 'K'
  return n.toLocaleString('en-US')
}

// ── Reference assets (approximate, for comparison) ──────────────────────
const REFERENCE_ASSETS = [
  { rank: 1,   name: 'Bitcoin',   ticker: 'BTC', mcap: 1_300_000_000_000, color: 'bg-zinc-900' },
  { rank: 2,   name: 'Ethereum',  ticker: 'ETH', mcap: 420_000_000_000,   color: 'bg-zinc-700' },
  { rank: 5,   name: 'Solana',    ticker: 'SOL', mcap: 80_000_000_000,    color: 'bg-zinc-600' },
  { rank: 10,  name: 'Top 10',    ticker: '',    mcap: 30_000_000_000,    color: 'bg-zinc-500' },
  { rank: 20,  name: 'Top 20',    ticker: '',    mcap: 10_000_000_000,    color: 'bg-zinc-400' },
  { rank: 50,  name: 'Top 50',    ticker: '',    mcap: 3_000_000_000,     color: 'bg-zinc-300' },
  { rank: 100, name: 'Top 100',   ticker: '',    mcap: 1_000_000_000,     color: 'bg-zinc-200' },
  { rank: 200, name: 'Top 200',   ticker: '',    mcap: 300_000_000,       color: 'bg-zinc-100' },
]

// Scenario multiples
const SCENARIO_MULTIPLES = [0.25, 0.5, 2, 5, 10, 25, 50, 100]

// ── Component ──────────────────────────────────────────────────────────────
export function MarketCapCalculatorClient() {
  const tool = getToolBySlug('market-cap-calculator')!

  const [priceRaw,    setPriceRaw]    = useState('1.50')
  const [supplyRaw,   setSupplyRaw]   = useState('1000000000')
  const [maxSupplyRaw,setMaxSupplyRaw]= useState('2000000000')
  const [targetMcap,  setTargetMcap]  = useState('')

  // Derived
  const price     = useMemo(() => parseNum(priceRaw),     [priceRaw])
  const supply    = useMemo(() => parseNum(supplyRaw),    [supplyRaw])
  const maxSupply = useMemo(() => parseNum(maxSupplyRaw), [maxSupplyRaw])
  const target    = useMemo(() => parseNum(targetMcap),   [targetMcap])

  const mcap      = useMemo(() => price * supply,    [price, supply])
  const fdv       = useMemo(() => price * maxSupply, [price, maxSupply])

  // What price would be needed to hit target mcap at current supply
  const priceForTarget = useMemo(() => {
    if (!target || !supply) return 0
    return target / supply
  }, [target, supply])

  const priceMultiple = useMemo(() => {
    if (!price || !priceForTarget) return 0
    return priceForTarget / price
  }, [price, priceForTarget])

  // Circulating %
  const circPct = useMemo(() =>
    maxSupply > 0 ? (supply / maxSupply) * 100 : 0,
  [supply, maxSupply])

  // Scenarios
  const scenarios = useMemo(() =>
    SCENARIO_MULTIPLES.map(m => ({
      multiple: m,
      mcap:     mcap * m,
      price:    price * m,
    })),
  [mcap, price])

  // Find where current mcap sits vs references
  const currentRank = useMemo(() => {
    if (!mcap) return null
    const above = REFERENCE_ASSETS.filter(r => r.mcap > mcap)
    return above.length === 0 ? 1 : above.length + 1
  }, [mcap])

  const reset = () => {
    setPriceRaw('1.50')
    setSupplyRaw('1000000000')
    setMaxSupplyRaw('2000000000')
    setTargetMcap('')
  }

  const isValid = price > 0 && supply > 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Inputs ─── */}
        <ToolSection title="Token Parameters" description="Enter price and supply to calculate market cap">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <InputGroup label="Token Price (USD)" hint="Current market price per token">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="text"
                  value={priceRaw}
                  onChange={e => setPriceRaw(e.target.value)}
                  placeholder="e.g. 1.50"
                  className="tool-input pl-7 font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$0.01','0.01'],['$0.1','0.1'],['$1','1'],['$10','10'],['$100','100'],['$1000','1000']].map(([l,v]) => (
                  <button key={v} onClick={() => setPriceRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${priceRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Circulating Supply" hint="Tokens currently in circulation (supports 1B, 500M)">
              <input
                type="text"
                value={supplyRaw}
                onChange={e => setSupplyRaw(e.target.value)}
                placeholder="e.g. 1B"
                className="tool-input font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['21M','21000000'],['100M','100000000'],['500M','500000000'],['1B','1000000000'],['10B','10000000000']].map(([l,v]) => (
                  <button key={v} onClick={() => setSupplyRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${supplyRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Max / Total Supply" hint="For FDV calculation (optional)">
              <input
                type="text"
                value={maxSupplyRaw}
                onChange={e => setMaxSupplyRaw(e.target.value)}
                placeholder="e.g. 2B"
                className="tool-input font-mono"
              />
            </InputGroup>

            <InputGroup label="Target Market Cap (USD)" hint="Optional: What price is needed to reach this mcap?">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="text"
                  value={targetMcap}
                  onChange={e => setTargetMcap(e.target.value)}
                  placeholder="e.g. 1B"
                  className="tool-input pl-7 font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$100M','100000000'],['$500M','500000000'],['$1B','1000000000'],['$10B','10000000000'],['$100B','100000000000']].map(([l,v]) => (
                  <button key={v} onClick={() => setTargetMcap(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${targetMcap === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

          </div>
        </ToolSection>

        {/* ─── Primary Result ─── */}
        {isValid && (
          <>
            {/* Hero result */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-6 rounded-xl border-2 border-black bg-black text-white">
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Market Cap</p>
                <p className="text-4xl sm:text-5xl font-bold font-mono tracking-tight">
                  {formatMcap(mcap)}
                </p>
                <p className="text-xs text-zinc-400 mt-3">
                  {formatPrice(price)} × {formatSupply(supply)} circulating supply
                </p>
                {currentRank && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                    <TrendingUp size={11} />
                    Approx. rank #{currentRank} by market cap
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl border border-[var(--border)] flex-1">
                  <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">FDV</p>
                  <p className="text-xl font-bold font-mono">{formatMcap(fdv)}</p>
                  <p className="text-xs text-zinc-400 mt-1">at max supply</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border)] flex-1">
                  <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Circ. %</p>
                  <p className="text-xl font-bold font-mono">{circPct.toFixed(1)}%</p>
                  <p className="text-xs text-zinc-400 mt-1">of max supply</p>
                </div>
              </div>
            </div>

            {/* Target price */}
            {target > 0 && priceForTarget > 0 && (
              <ToolSection title="Target Market Cap Analysis">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoCard
                    title="To Reach Target"
                    items={[
                      { label: 'Target Market Cap',  value: formatMcap(target) },
                      { label: 'Required Price',     value: formatPrice(priceForTarget), highlight: true },
                      { label: 'Price Multiple',     value: priceMultiple > 0 ? priceMultiple.toFixed(2) + '×' : '—' },
                      { label: 'From Current',       value: priceMultiple >= 1
                        ? '+' + ((priceMultiple - 1) * 100).toFixed(1) + '%'
                        : ((priceMultiple - 1) * 100).toFixed(1) + '%'
                      },
                    ]}
                  />
                  <div className="sm:col-span-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)] flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 mb-0.5">Current Price</p>
                        <p className="text-xl font-bold font-mono">{formatPrice(price)}</p>
                      </div>
                      <ArrowRight size={20} className="text-zinc-400 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500 mb-0.5">Target Price</p>
                        <p className={`text-xl font-bold font-mono ${priceForTarget > price ? 'text-black' : 'text-zinc-500'}`}>
                          {formatPrice(priceForTarget)}
                        </p>
                      </div>
                      <div className={`ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold
                        ${priceForTarget >= price ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                        {priceForTarget >= price
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />
                        }
                        {priceMultiple.toFixed(2)}×
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all"
                        style={{ width: `${Math.min((mcap / target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      {((mcap / target) * 100).toFixed(1)}% of target reached
                    </p>
                  </div>
                </div>
              </ToolSection>
            )}

            {/* ─── Reference Comparisons ─── */}
            <ToolSection
              title="Market Cap Context"
              description="How this market cap compares to the broader crypto landscape"
            >
              <div className="space-y-2">
                {REFERENCE_ASSETS.map(ref => {
                  const ratio     = mcap / ref.mcap
                  const isAbove   = mcap >= ref.mcap
                  const barWidth  = isAbove
                    ? 100
                    : (mcap / ref.mcap) * 100

                  return (
                    <div key={ref.name} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-zinc-300 transition-colors">
                      {/* Asset */}
                      <div className="w-28 shrink-0">
                        <p className="text-xs font-semibold text-black">{ref.name}</p>
                        {ref.ticker && <p className="text-[10px] text-zinc-400">{ref.ticker}</p>}
                      </div>

                      {/* Bar */}
                      <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isAbove ? 'bg-black' : 'bg-zinc-400'}`}
                          style={{ width: `${Math.min(barWidth, 100)}%` }}
                        />
                      </div>

                      {/* Ref mcap */}
                      <div className="w-20 text-right shrink-0">
                        <p className="text-xs font-mono text-zinc-500">{formatMcap(ref.mcap)}</p>
                      </div>

                      {/* Ratio badge */}
                      <div className={`w-16 text-right shrink-0`}>
                        <span className={`text-xs font-bold font-mono ${isAbove ? 'text-black' : 'text-zinc-400'}`}>
                          {isAbove
                            ? ratio.toFixed(2) + '×'
                            : (ratio * 100).toFixed(1) + '%'
                          }
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
                <Info size={12} />
                Reference market caps are approximate. Ratios show your token&apos;s mcap relative to each benchmark.
              </p>
            </ToolSection>

            {/* ─── Scenario Table ─── */}
            <ToolSection
              title="Price × Market Cap Scenarios"
              description="How market cap and price change at different multiples from current"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-3 pr-6 text-xs font-semibold text-black uppercase tracking-wide">Multiple</th>
                      <th className="text-left py-3 pr-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Token Price</th>
                      <th className="text-left py-3 pr-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Market Cap</th>
                      <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">vs BTC mcap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(s => {
                      const isDown   = s.multiple < 1
                      const isCurrent= s.multiple === 1
                      const btcRatio = s.mcap / REFERENCE_ASSETS[0].mcap
                      return (
                        <tr
                          key={s.multiple}
                          className={`border-b border-[var(--border)] last:border-0 transition-colors
                            ${isCurrent ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
                        >
                          <td className="py-3 pr-6">
                            <span className={`inline-flex items-center gap-1.5 font-semibold
                              ${isDown ? 'text-zinc-400' : 'text-black'}`}>
                              {isDown
                                ? <TrendingDown size={13} className="text-zinc-300" />
                                : <TrendingUp   size={13} />
                              }
                              {s.multiple}×
                              {isCurrent && <span className="badge-default text-[9px] font-normal">now</span>}
                            </span>
                          </td>
                          <td className="py-3 pr-6 font-mono font-semibold text-black">
                            {formatPrice(s.price)}
                          </td>
                          <td className="py-3 pr-6 font-mono text-zinc-700">
                            {formatMcap(s.mcap)}
                          </td>
                          <td className="py-3 font-mono text-xs text-zinc-400">
                            {btcRatio >= 1
                              ? btcRatio.toFixed(2) + '× BTC'
                              : (btcRatio * 100).toFixed(2) + '% of BTC'
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ToolSection>

            {/* ─── Key Metrics ─── */}
            <ToolSection title="Summary">
              <InfoCard
                title="Full Breakdown"
                items={[
                  { label: 'Token Price',         value: formatPrice(price) },
                  { label: 'Circulating Supply',  value: formatSupply(supply) },
                  { label: 'Max Supply',           value: formatSupply(maxSupply) },
                  { label: 'Circulation %',        value: circPct.toFixed(2) + '%' },
                  { label: 'Market Cap',           value: formatMcap(mcap) },
                  { label: 'FDV',                  value: formatMcap(fdv), highlight: true },
                  { label: 'FDV / MCap Ratio',     value: mcap > 0 ? (fdv / mcap).toFixed(2) + '×' : '—' },
                  ...(target > 0 ? [
                    { label: 'Target MCap',        value: formatMcap(target) },
                    { label: 'Price at Target',    value: formatPrice(priceForTarget) },
                    { label: 'Required Multiple',  value: priceMultiple.toFixed(2) + '×', highlight: false },
                  ] : []),
                ]}
              />
            </ToolSection>
          </>
        )}

        {/* ─── Formula ─── */}
        <ToolSection title="Formula">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm">
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
              <p className="text-zinc-500 text-xs mb-1">Market Cap</p>
              <p className="font-semibold text-black">MCap = Price × Circulating Supply</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
              <p className="text-zinc-500 text-xs mb-1">Fully Diluted Valuation</p>
              <p className="font-semibold text-black">FDV = Price × Max Supply</p>
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