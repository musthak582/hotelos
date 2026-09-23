'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, ArrowUpDown, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { ResultDisplay } from '@/components/shared/ResultDisplay'
import { CopyButton } from '@/components/shared/CopyButton'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Types ──────────────────────────────────────────────────────────────────
type Mode = 'price-from-mcap' | 'mcap-from-price'

// ── Helpers ────────────────────────────────────────────────────────────────
function parseNumber(val: string): number {
  // Accept shorthand: 1M, 500K, 2B
  const clean = val.trim().replace(/,/g, '')
  const multipliers: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
  const match = clean.match(/^([\d.]+)\s*([kmbt])$/i)
  if (match) return parseFloat(match[1]) * (multipliers[match[2].toLowerCase()] ?? 1)
  return parseFloat(clean)
}

function formatLargeNumber(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(3) + 'T'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(3)  + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(3)  + 'M'
  if (n >= 1e3)  return '$' + (n / 1e3).toFixed(3)  + 'K'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

function formatPrice(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1)    return '$' + n.toFixed(4)
  if (n >= 0.01) return '$' + n.toFixed(6)
  return '$' + n.toExponential(4)
}

function formatSupply(n: number): string {
  if (!isFinite(n) || n === 0) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(2)  + 'K'
  return n.toLocaleString('en-US')
}

// Price target multipliers for scenario analysis
const MULTIPLIERS = [0.5, 2, 5, 10, 25, 50, 100]

// Well-known reference market caps
const REFERENCE_MCAPS = [
  { label: 'BTC',    value: 1_300_000_000_000, note: '~$1.3T' },
  { label: 'ETH',    value: 400_000_000_000,   note: '~$400B' },
  { label: 'Top 10', value: 50_000_000_000,    note: '~$50B'  },
  { label: 'Top 50', value: 5_000_000_000,     note: '~$5B'   },
  { label: 'Mid',    value: 500_000_000,        note: '~$500M' },
  { label: 'Small',  value: 50_000_000,         note: '~$50M'  },
]

// ── Component ──────────────────────────────────────────────────────────────
export function TokenPriceCalculatorClient() {
  const tool = getToolBySlug('token-price-calculator')!

  const [mode, setMode] = useState<Mode>('price-from-mcap')

  // Inputs — mode A: price from mcap
  const [marketCap,         setMarketCap]         = useState('100000000')   // $100M
  const [circulatingSupply, setCirculatingSupply] = useState('1000000000')  // 1B tokens
  const [maxSupply,         setMaxSupply]         = useState('2000000000')  // 2B tokens

  // Inputs — mode B: mcap from price
  const [tokenPrice,        setTokenPrice]        = useState('0.1')
  const [supplyForMcap,     setSupplyForMcap]     = useState('1000000000')

  // Derived — Mode A
  const mktCapNum    = useMemo(() => parseNumber(marketCap),         [marketCap])
  const circSupplyNum= useMemo(() => parseNumber(circulatingSupply), [circulatingSupply])
  const maxSupplyNum = useMemo(() => parseNumber(maxSupply),         [maxSupply])

  const priceFromMcap = useMemo(() => {
    if (!mktCapNum || !circSupplyNum) return 0
    return mktCapNum / circSupplyNum
  }, [mktCapNum, circSupplyNum])

  const fdv = useMemo(() => {
    if (!priceFromMcap || !maxSupplyNum) return 0
    return priceFromMcap * maxSupplyNum
  }, [priceFromMcap, maxSupplyNum])

  const circulationPct = useMemo(() => {
    if (!circSupplyNum || !maxSupplyNum) return 0
    return (circSupplyNum / maxSupplyNum) * 100
  }, [circSupplyNum, maxSupplyNum])

  // Derived — Mode B
  const priceNum       = useMemo(() => parseNumber(tokenPrice),    [tokenPrice])
  const supplyNumB     = useMemo(() => parseNumber(supplyForMcap), [supplyForMcap])
  const mcapFromPrice  = useMemo(() => {
    if (!priceNum || !supplyNumB) return 0
    return priceNum * supplyNumB
  }, [priceNum, supplyNumB])

  // Price scenarios (mode A)
  const priceScenarios = useMemo(() => {
    if (!priceFromMcap) return []
    return MULTIPLIERS.map(m => ({
      label:  m < 1 ? `${m}×` : `${m}×`,
      mult:   m,
      price:  priceFromMcap * m,
      mcap:   mktCapNum * m,
    }))
  }, [priceFromMcap, mktCapNum])

  // Reference comparisons (mode A)
  const refComparisons = useMemo(() => {
    if (!circSupplyNum) return []
    return REFERENCE_MCAPS.map(ref => ({
      ...ref,
      price: ref.value / circSupplyNum,
      mult:  mktCapNum > 0 ? ref.value / mktCapNum : 0,
    }))
  }, [circSupplyNum, mktCapNum])

  const handleReset = () => {
    setMarketCap('100000000')
    setCirculatingSupply('1000000000')
    setMaxSupply('2000000000')
    setTokenPrice('0.1')
    setSupplyForMcap('1000000000')
  }

  const isValidA = mktCapNum > 0 && circSupplyNum > 0
  const isValidB = priceNum  > 0 && supplyNumB   > 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Mode toggle ─── */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] w-fit">
          {([
            { key: 'price-from-mcap', label: 'Price from Market Cap' },
            { key: 'mcap-from-price', label: 'Market Cap from Price' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                ${mode === opt.key
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ─── MODE A: Price from Market Cap ─── */}
        {mode === 'price-from-mcap' && (
          <>
            <ToolSection
              title="Calculate Token Price"
              description="Enter the market cap and supply to derive the implied token price"
            >
              <div className="space-y-4">
                <InputGroup
                  label="Market Cap (USD)"
                  hint="Total market cap in USD — supports shorthand: 100M, 1B, 500K"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input
                      type="text"
                      value={marketCap}
                      onChange={e => setMarketCap(e.target.value)}
                      placeholder="e.g. 100M or 100000000"
                      className="tool-input pl-7 font-mono"
                    />
                  </div>
                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      ['$10M', '10000000'], ['$50M', '50000000'], ['$100M', '100000000'],
                      ['$500M', '500000000'], ['$1B', '1000000000'], ['$10B', '10000000000'],
                    ].map(([lbl, val]) => (
                      <button
                        key={val}
                        onClick={() => setMarketCap(val)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                          ${marketCap === val
                            ? 'bg-black text-white border-black'
                            : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'
                          }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <InputGroup
                  label="Circulating Supply"
                  hint="Number of tokens currently in circulation — supports 1B, 500M, etc."
                >
                  <input
                    type="text"
                    value={circulatingSupply}
                    onChange={e => setCirculatingSupply(e.target.value)}
                    placeholder="e.g. 1B or 1000000000"
                    className="tool-input font-mono"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      ['100M', '100000000'], ['500M', '500000000'], ['1B', '1000000000'],
                      ['5B', '5000000000'], ['10B', '10000000000'], ['21M', '21000000'],
                    ].map(([lbl, val]) => (
                      <button
                        key={val}
                        onClick={() => setCirculatingSupply(val)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                          ${circulatingSupply === val
                            ? 'bg-black text-white border-black'
                            : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'
                          }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <InputGroup
                  label="Max / Total Supply"
                  hint="Total tokens that will ever exist (for FDV calculation)"
                >
                  <input
                    type="text"
                    value={maxSupply}
                    onChange={e => setMaxSupply(e.target.value)}
                    placeholder="e.g. 2B or 2000000000"
                    className="tool-input font-mono"
                  />
                </InputGroup>
              </div>
            </ToolSection>

            {/* Results */}
            {isValidA ? (
              <>
                <ToolSection title="Results">
                  <div className="space-y-4">
                    {/* Primary result */}
                    <div className="p-5 rounded-xl border-2 border-black bg-black text-white">
                      <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">Implied Token Price</p>
                      <p className="text-4xl font-bold font-mono tracking-tight">
                        {formatPrice(priceFromMcap)}
                      </p>
                      <p className="text-xs text-zinc-400 mt-2">
                        At {formatLargeNumber(mktCapNum)} market cap with {formatSupply(circSupplyNum)} circulating supply
                      </p>
                    </div>

                    <InfoCard
                      title="Token Metrics"
                      items={[
                        { label: 'Token Price',          value: formatPrice(priceFromMcap),    highlight: false },
                        { label: 'Market Cap',           value: formatLargeNumber(mktCapNum) },
                        { label: 'Circulating Supply',   value: formatSupply(circSupplyNum) },
                        { label: 'Max Supply',           value: formatSupply(maxSupplyNum) },
                        { label: 'Circulation %',        value: circulationPct > 0 ? circulationPct.toFixed(1) + '%' : '—' },
                        { label: 'Fully Diluted Value',  value: formatLargeNumber(fdv), highlight: true },
                      ]}
                    />
                  </div>
                </ToolSection>

                {/* Price scenarios */}
                <ToolSection
                  title="Price Scenarios"
                  description="What price would this token reach at different market cap multiples?"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Multiple</th>
                          <th className="text-right py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Token Price</th>
                          <th className="text-right py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceScenarios.map(s => {
                          const isDown = s.mult < 1
                          return (
                            <tr key={s.mult} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50">
                              <td className="py-2.5 pr-4">
                                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                                  isDown ? 'text-zinc-500' : 'text-black'
                                }`}>
                                  {isDown
                                    ? <TrendingDown size={13} className="text-zinc-400" />
                                    : <TrendingUp   size={13} className="text-zinc-700" />
                                  }
                                  {s.mult}×
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 text-right font-mono font-semibold text-black">
                                {formatPrice(s.price)}
                              </td>
                              <td className="py-2.5 text-right font-mono text-zinc-600">
                                {formatLargeNumber(s.mcap)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </ToolSection>

                {/* Reference comparisons */}
                <ToolSection
                  title="Market Cap Comparisons"
                  description="What would this token be priced at if it reached these reference market caps?"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {refComparisons.map(ref => {
                      const isHigher = ref.value > mktCapNum
                      return (
                        <div key={ref.label} className="p-4 rounded-xl border border-[var(--border)] hover:border-zinc-300 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                              {ref.label}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              isHigher
                                ? 'bg-zinc-100 text-zinc-600'
                                : 'bg-zinc-900 text-white'
                            }`}>
                              {isHigher ? '↑' : '↓'} {ref.mult > 0 ? ref.mult.toFixed(1) + '×' : '—'}
                            </span>
                          </div>
                          <p className="text-lg font-bold font-mono text-black">
                            {formatPrice(ref.price)}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">{ref.note} mcap</p>
                        </div>
                      )
                    })}
                  </div>
                </ToolSection>
              </>
            ) : (
              <div className="flex items-center gap-3 p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                <Info size={16} className="text-zinc-400 shrink-0" />
                <p className="text-sm text-zinc-500">Enter a market cap and circulating supply to calculate the token price.</p>
              </div>
            )}
          </>
        )}

        {/* ─── MODE B: Market Cap from Price ─── */}
        {mode === 'mcap-from-price' && (
          <>
            <ToolSection
              title="Calculate Market Cap"
              description="Enter token price and supply to derive the implied market cap"
            >
              <div className="space-y-4">
                <InputGroup label="Token Price (USD)" hint="Current or target token price">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input
                      type="text"
                      value={tokenPrice}
                      onChange={e => setTokenPrice(e.target.value)}
                      placeholder="e.g. 0.05"
                      className="tool-input pl-7 font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      ['$0.001', '0.001'], ['$0.01', '0.01'], ['$0.1', '0.1'],
                      ['$1', '1'], ['$10', '10'], ['$100', '100'], ['$1000', '1000'],
                    ].map(([lbl, val]) => (
                      <button
                        key={val}
                        onClick={() => setTokenPrice(val)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                          ${tokenPrice === val
                            ? 'bg-black text-white border-black'
                            : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'
                          }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <InputGroup
                  label="Circulating Supply"
                  hint="Number of tokens in circulation — supports shorthand: 1B, 500M"
                >
                  <input
                    type="text"
                    value={supplyForMcap}
                    onChange={e => setSupplyForMcap(e.target.value)}
                    placeholder="e.g. 1B or 1000000000"
                    className="tool-input font-mono"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      ['100M', '100000000'], ['500M', '500000000'], ['1B', '1000000000'],
                      ['5B', '5000000000'], ['10B', '10000000000'],
                    ].map(([lbl, val]) => (
                      <button
                        key={val}
                        onClick={() => setSupplyForMcap(val)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                          ${supplyForMcap === val
                            ? 'bg-black text-white border-black'
                            : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'
                          }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>
            </ToolSection>

            {isValidB ? (
              <ToolSection title="Results">
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border-2 border-black bg-black text-white">
                    <p className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">Implied Market Cap</p>
                    <p className="text-4xl font-bold font-mono tracking-tight">
                      {formatLargeNumber(mcapFromPrice)}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2">
                      At {formatPrice(priceNum)} with {formatSupply(supplyNumB)} circulating supply
                    </p>
                  </div>

                  <InfoCard
                    title="Calculation"
                    items={[
                      { label: 'Token Price',        value: formatPrice(priceNum) },
                      { label: 'Circulating Supply', value: formatSupply(supplyNumB) },
                      { label: 'Market Cap',         value: formatLargeNumber(mcapFromPrice), highlight: true },
                    ]}
                  />

                  {/* Context */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REFERENCE_MCAPS.map(ref => {
                      const pct = (mcapFromPrice / ref.value) * 100
                      return (
                        <div key={ref.label} className="p-3 rounded-lg border border-[var(--border)] text-center">
                          <p className="text-xs text-zinc-500 mb-1">{ref.label} ({ref.note})</p>
                          <p className="text-sm font-bold font-mono">
                            {pct < 100 ? pct.toFixed(1) + '%' : (pct / 100).toFixed(1) + '×'}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {pct < 100 ? 'of that mcap' : 'that mcap'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </ToolSection>
            ) : (
              <div className="flex items-center gap-3 p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                <Info size={16} className="text-zinc-400 shrink-0" />
                <p className="text-sm text-zinc-500">Enter a token price and supply to calculate the market cap.</p>
              </div>
            )}
          </>
        )}

        {/* ─── Formula ─── */}
        <ToolSection title="Formulas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-sm">
              <p className="text-zinc-500 text-xs mb-1">Price from Market Cap</p>
              <p className="font-semibold text-black">Price = Market Cap ÷ Circulating Supply</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-sm">
              <p className="text-zinc-500 text-xs mb-1">Fully Diluted Valuation</p>
              <p className="font-semibold text-black">FDV = Price × Max Supply</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-3 flex items-start gap-2">
            <Info size={13} className="shrink-0 mt-0.5" />
            Shorthand input supported: enter <code className="bg-zinc-100 px-1 rounded">100M</code>, <code className="bg-zinc-100 px-1 rounded">1.5B</code>, <code className="bg-zinc-100 px-1 rounded">500K</code> for large numbers.
          </p>
        </ToolSection>

        {/* Reset */}
        <div className="flex justify-end">
          <button onClick={handleReset} className="btn-secondary gap-2 text-xs">
            <RefreshCw size={12} />
            Reset
          </button>
        </div>

      </div>
    </ToolLayout>
  )
}