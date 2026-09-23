'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2, Info, AlertTriangle } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Types ──────────────────────────────────────────────────────────────────
interface AllocationRow {
  id: string
  label: string
  percentage: number | ''
  lockMonths: number
  vestMonths: number
}

// ── Helpers ──────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function parseNum(val: string): number {
  const clean = val.trim().replace(/,/g, '')
  const mult: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
  const match = clean.match(/^([\d.]+)\s*([kmbt])$/i)
  if (match) return parseFloat(match[1]) * (mult[match[2].toLowerCase()] ?? 1)
  return parseFloat(clean) || 0
}

function formatSupply(n: number): string {
  if (!n) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(3) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(3)  + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(3)  + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(3)  + 'K'
  return n.toLocaleString('en-US')
}

function formatPct(n: number): string {
  return n.toFixed(2) + '%'
}

// ── Default allocations ─────────────────────────────────────────────────
const DEFAULT_ALLOCATIONS: AllocationRow[] = [
  { id: uid(), label: 'Public Sale',       percentage: 15, lockMonths: 0,  vestMonths: 6  },
  { id: uid(), label: 'Team & Advisors',   percentage: 20, lockMonths: 12, vestMonths: 24 },
  { id: uid(), label: 'Ecosystem & Grants',percentage: 25, lockMonths: 0,  vestMonths: 36 },
  { id: uid(), label: 'Treasury',          percentage: 20, lockMonths: 6,  vestMonths: 24 },
  { id: uid(), label: 'Liquidity',         percentage: 10, lockMonths: 0,  vestMonths: 0  },
  { id: uid(), label: 'Seed / Private',    percentage: 10, lockMonths: 6,  vestMonths: 18 },
]

// Colour palette for chart bars (greyscale)
const BAR_SHADES = [
  'bg-black',
  'bg-zinc-700',
  'bg-zinc-500',
  'bg-zinc-400',
  'bg-zinc-300',
  'bg-zinc-200',
  'bg-zinc-100',
]

// ── Component ──────────────────────────────────────────────────────────────
export function TokenSupplyCalculatorClient() {
  const tool = getToolBySlug('token-supply-calculator')!

  // Global supply inputs
  const [maxSupplyRaw,          setMaxSupplyRaw]          = useState('1000000000')
  const [circulatingRaw,        setCirculatingRaw]        = useState('250000000')
  const [annualEmissionRaw,     setAnnualEmissionRaw]     = useState('50000000')
  const [tokenPrice,            setTokenPrice]            = useState('0.5')

  // Allocation rows
  const [allocs, setAllocs] = useState<AllocationRow[]>(DEFAULT_ALLOCATIONS)

  // Derived numbers
  const maxSupply      = useMemo(() => parseNum(maxSupplyRaw),      [maxSupplyRaw])
  const circulating    = useMemo(() => parseNum(circulatingRaw),    [circulatingRaw])
  const annualEmission = useMemo(() => parseNum(annualEmissionRaw), [annualEmissionRaw])
  const price          = useMemo(() => parseFloat(tokenPrice) || 0, [tokenPrice])

  const locked         = useMemo(() => Math.max(0, maxSupply - circulating), [maxSupply, circulating])
  const circulationPct = useMemo(() => maxSupply > 0 ? (circulating / maxSupply) * 100 : 0, [circulating, maxSupply])
  const lockedPct      = useMemo(() => 100 - circulationPct, [circulationPct])

  // Market cap & FDV
  const marketCap      = useMemo(() => circulating * price, [circulating, price])
  const fdv            = useMemo(() => maxSupply    * price, [maxSupply, price])

  // Inflation rate = new tokens / current circulating
  const inflationRate  = useMemo(() =>
    circulating > 0 ? (annualEmission / circulating) * 100 : 0,
  [annualEmission, circulating])

  // Years to full dilution
  const yearsToFull    = useMemo(() => {
    if (annualEmission <= 0 || locked <= 0) return null
    return locked / annualEmission
  }, [annualEmission, locked])

  // Allocation total
  const allocTotal     = useMemo(() =>
    allocs.reduce((s, a) => s + (Number(a.percentage) || 0), 0),
  [allocs])
  const allocValid     = Math.abs(allocTotal - 100) < 0.01

  // Allocation derived amounts
  const allocRows = useMemo(() =>
    allocs.map(a => ({
      ...a,
      amount: maxSupply * (Number(a.percentage) / 100),
      value:  maxSupply * (Number(a.percentage) / 100) * price,
    })),
  [allocs, maxSupply, price])

  // Unlock schedule — simple model: each row unlocks linearly after lockup
  const unlockSchedule = useMemo(() => {
    const months = Array.from({ length: 37 }, (_, i) => i)  // 0..36 months
    return months.map(m => {
      let totalUnlocked = 0
      allocRows.forEach(row => {
        const pct  = Number(row.percentage) / 100
        const amt  = maxSupply * pct
        const lock = row.lockMonths
        const vest = row.vestMonths
        if (vest === 0) {
          // instant unlock after lock
          if (m >= lock) totalUnlocked += amt
        } else {
          if (m <= lock) {
            totalUnlocked += 0
          } else {
            const vestedMonths = Math.min(m - lock, vest)
            totalUnlocked += amt * (vestedMonths / vest)
          }
        }
      })
      return { month: m, unlocked: totalUnlocked }
    })
  }, [allocRows, maxSupply])

  // Row operations
  const addRow = () => setAllocs(prev => [...prev, {
    id: uid(), label: 'New Category', percentage: 0, lockMonths: 0, vestMonths: 12,
  }])

  const removeRow = (id: string) => setAllocs(prev => prev.filter(r => r.id !== id))

  const updateRow = (id: string, field: keyof AllocationRow, value: string | number) =>
    setAllocs(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))

  const reset = () => {
    setMaxSupplyRaw('1000000000')
    setCirculatingRaw('250000000')
    setAnnualEmissionRaw('50000000')
    setTokenPrice('0.5')
    setAllocs(DEFAULT_ALLOCATIONS)
  }

  function formatMoney(n: number): string {
    if (!n) return '—'
    if (n >= 1e9)  return '$' + (n / 1e9).toFixed(3)  + 'B'
    if (n >= 1e6)  return '$' + (n / 1e6).toFixed(3)  + 'M'
    if (n >= 1e3)  return '$' + (n / 1e3).toFixed(3)  + 'K'
    return '$' + n.toFixed(2)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Supply Inputs ─── */}
        <ToolSection title="Supply Configuration" description="Define your token's supply parameters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Max / Total Supply" hint="Total tokens that will ever exist (supports 1B, 500M)">
              <input
                type="text"
                value={maxSupplyRaw}
                onChange={e => setMaxSupplyRaw(e.target.value)}
                placeholder="e.g. 1B"
                className="tool-input font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['21M','21000000'],['100M','100000000'],['1B','1000000000'],['10B','10000000000'],['100B','100000000000']].map(([l,v])=>(
                  <button key={v} onClick={()=>setMaxSupplyRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${maxSupplyRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Circulating Supply" hint="Tokens currently in circulation">
              <input
                type="text"
                value={circulatingRaw}
                onChange={e => setCirculatingRaw(e.target.value)}
                placeholder="e.g. 250M"
                className="tool-input font-mono"
              />
            </InputGroup>

            <InputGroup label="Annual Emission / Unlock" hint="New tokens entering circulation per year">
              <input
                type="text"
                value={annualEmissionRaw}
                onChange={e => setAnnualEmissionRaw(e.target.value)}
                placeholder="e.g. 50M"
                className="tool-input font-mono"
              />
            </InputGroup>

            <InputGroup label="Token Price (USD)" hint="Current market price per token">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="number"
                  value={tokenPrice}
                  onChange={e => setTokenPrice(e.target.value)}
                  placeholder="0.50"
                  className="tool-input pl-7 font-mono"
                />
              </div>
            </InputGroup>
          </div>
        </ToolSection>

        {/* ─── Supply Metrics ─── */}
        {maxSupply > 0 && (
          <ToolSection title="Supply Metrics">
            <div className="space-y-5">
              {/* Visual supply bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500">Supply Distribution</span>
                  <span className="text-xs font-mono text-zinc-500">
                    {formatPct(circulationPct)} circulating
                  </span>
                </div>
                <div className="h-5 rounded-full overflow-hidden bg-zinc-100 border border-[var(--border)] flex">
                  <div
                    className="h-full bg-black transition-all duration-500 rounded-l-full"
                    style={{ width: `${Math.min(circulationPct, 100)}%` }}
                  />
                  <div
                    className="h-full bg-zinc-300 flex-1 rounded-r-full"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-black inline-block" /> Circulating ({formatSupply(circulating)})
                  </span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" /> Locked ({formatSupply(locked)})
                  </span>
                </div>
              </div>

              <InfoCard
                title="Key Metrics"
                items={[
                  { label: 'Max Supply',          value: formatSupply(maxSupply) },
                  { label: 'Circulating Supply',  value: formatSupply(circulating) },
                  { label: 'Locked Supply',        value: formatSupply(locked) },
                  { label: 'Circulation %',        value: formatPct(circulationPct) },
                  { label: 'Locked %',             value: formatPct(lockedPct) },
                  { label: 'Annual Emission',      value: formatSupply(annualEmission) },
                  { label: 'Inflation Rate',       value: inflationRate > 0 ? formatPct(inflationRate) + '/yr' : '—' },
                  { label: 'Years to Full Supply', value: yearsToFull != null ? yearsToFull.toFixed(1) + ' yrs' : '—' },
                ]}
              />

              {price > 0 && (
                <InfoCard
                  title="Valuation"
                  items={[
                    { label: 'Token Price',  value: '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) },
                    { label: 'Market Cap',   value: formatMoney(marketCap) },
                    { label: 'FDV',          value: formatMoney(fdv), highlight: true },
                    { label: 'FDV / MCap',   value: marketCap > 0 ? (fdv / marketCap).toFixed(2) + '×' : '—' },
                  ]}
                />
              )}

              {/* Inflation warning */}
              {inflationRate > 20 && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                  <AlertTriangle size={15} className="text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-black">High Inflation Rate ({formatPct(inflationRate)}/yr)</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Annual emission exceeds 20% of circulating supply. This level of dilution can create significant sell pressure on token price.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ToolSection>
        )}

        {/* ─── Allocation Table ─── */}
        <ToolSection
          title="Token Allocation"
          description="Define stakeholder allocations with vesting schedules — must total 100%"
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_90px_90px_90px_36px] gap-3 px-1">
              {['Category', '% Alloc', 'Lock (mo)', 'Vest (mo)', ''].map(h => (
                <span key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {allocs.map((row, i) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_90px_90px_90px_36px] gap-3 p-3 rounded-lg border border-[var(--border)] bg-white hover:border-zinc-300 transition-colors"
              >
                {/* Colour indicator + label */}
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${BAR_SHADES[i % BAR_SHADES.length]}`} />
                  <input
                    type="text"
                    value={row.label}
                    onChange={e => updateRow(row.id, 'label', e.target.value)}
                    className="tool-input text-sm font-medium"
                    placeholder="Category name"
                  />
                </div>
                <input
                  type="number"
                  value={row.percentage}
                  min={0} max={100}
                  onChange={e => updateRow(row.id, 'percentage', e.target.value === '' ? '' : Number(e.target.value))}
                  className="tool-input text-center font-mono"
                  placeholder="0"
                />
                <input
                  type="number"
                  value={row.lockMonths}
                  min={0}
                  onChange={e => updateRow(row.id, 'lockMonths', Math.max(0, parseInt(e.target.value)||0))}
                  className="tool-input text-center font-mono"
                />
                <input
                  type="number"
                  value={row.vestMonths}
                  min={0}
                  onChange={e => updateRow(row.id, 'vestMonths', Math.max(0, parseInt(e.target.value)||0))}
                  className="tool-input text-center font-mono"
                />
                <button
                  onClick={() => removeRow(row.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all self-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Total row */}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border font-mono text-sm
              ${allocValid ? 'border-black bg-black text-white' : 'border-red-300 bg-red-50 text-red-700'}`}>
              <span className="font-semibold">Total Allocation</span>
              <span className="font-bold text-base">
                {allocTotal.toFixed(2)}%
                {!allocValid && ' ⚠ must equal 100%'}
              </span>
            </div>

            <button onClick={addRow} className="btn-secondary text-xs gap-1.5 mt-1">
              <Plus size={12} />
              Add Category
            </button>
          </div>
        </ToolSection>

        {/* ─── Allocation Breakdown ─── */}
        {allocValid && maxSupply > 0 && (
          <ToolSection
            title="Allocation Breakdown"
            description="Token amounts and values per stakeholder category"
          >
            <div className="space-y-4">
              {/* Stacked bar chart */}
              <div>
                <div className="flex h-8 rounded-xl overflow-hidden border border-[var(--border)]">
                  {allocRows.map((row, i) => (
                    <div
                      key={row.id}
                      title={`${row.label}: ${row.percentage}%`}
                      className={`h-full ${BAR_SHADES[i % BAR_SHADES.length]} transition-all`}
                      style={{ width: `${Number(row.percentage)}%` }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                  {allocRows.map((row, i) => (
                    <span key={row.id} className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${BAR_SHADES[i % BAR_SHADES.length]}`} />
                      {row.label} ({row.percentage}%)
                    </span>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Category', 'Allocation', 'Token Amount', 'Value (USD)', 'Lock', 'Vest'].map(h => (
                        <th key={h} className="text-left py-2.5 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allocRows.map((row, i) => (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${BAR_SHADES[i % BAR_SHADES.length]}`} />
                            <span className="font-medium text-black">{row.label}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-zinc-700">{row.percentage}%</td>
                        <td className="py-3 pr-4 font-mono text-black font-semibold">{formatSupply(row.amount)}</td>
                        <td className="py-3 pr-4 font-mono text-zinc-700">
                          {price > 0 ? formatMoney(row.value) : '—'}
                        </td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">
                          {row.lockMonths > 0 ? `${row.lockMonths} mo` : 'None'}
                        </td>
                        <td className="py-3 text-zinc-500 text-xs">
                          {row.vestMonths > 0 ? `${row.vestMonths} mo` : 'Instant'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ToolSection>
        )}

        {/* ─── Unlock Schedule ─── */}
        {allocValid && maxSupply > 0 && (
          <ToolSection
            title="36-Month Unlock Schedule"
            description="Estimated circulating supply over time based on vesting parameters"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-3 font-semibold text-zinc-500 uppercase tracking-wide">Month</th>
                    <th className="text-left py-2 pr-3 font-semibold text-zinc-500 uppercase tracking-wide">Unlocked</th>
                    <th className="text-left py-2 pr-3 font-semibold text-zinc-500 uppercase tracking-wide">% of Max</th>
                    <th className="text-left py-2 font-semibold text-zinc-500 uppercase tracking-wide">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {unlockSchedule
                    .filter(r => [0,3,6,9,12,18,24,30,36].includes(r.month))
                    .map(row => {
                      const pct = maxSupply > 0 ? (row.unlocked / maxSupply) * 100 : 0
                      return (
                        <tr key={row.month} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50">
                          <td className="py-2.5 pr-3 font-medium text-zinc-700">
                            {row.month === 0 ? 'TGE' : `M${row.month}`}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-black font-semibold">{formatSupply(row.unlocked)}</td>
                          <td className="py-2.5 pr-3 font-mono text-zinc-600">{pct.toFixed(1)}%</td>
                          <td className="py-2.5 w-40">
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className="h-full bg-black rounded-full transition-all"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <Info size={12} />
              TGE = Token Generation Event (month 0). Schedule assumes linear vesting after cliff period.
            </p>
          </ToolSection>
        )}

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