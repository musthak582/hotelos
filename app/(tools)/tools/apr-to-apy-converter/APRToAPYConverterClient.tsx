'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, ArrowUpDown, ArrowRight, Info, Plus, Trash2 } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup } from '@/components/shared/ToolSection'
import { CopyButton } from '@/components/shared/CopyButton'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Types ──────────────────────────────────────────────────────────────────
type Direction = 'apr-to-apy' | 'apy-to-apr'

interface CompareRow {
  id:    string
  label: string
  apr:   number | ''
  freq:  number           // compounds per year
}

// ── Constants ──────────────────────────────────────────────────────────────
const FREQS = [
  { label: 'Continuous', n: Infinity, short: '∞'   },
  { label: 'Daily',      n: 365,      short: '365' },
  { label: 'Weekly',     n: 52,       short: '52'  },
  { label: 'Monthly',    n: 12,       short: '12'  },
  { label: 'Quarterly',  n: 4,        short: '4'   },
  { label: 'Semi-ann.',  n: 2,        short: '2'   },
  { label: 'Annually',   n: 1,        short: '1'   },
]

// Well-known DeFi protocol example rates
const PROTOCOL_PRESETS: CompareRow[] = [
  { id: 'a', label: 'Aave USDC',          apr: 4.2,  freq: 365  },
  { id: 'b', label: 'Compound ETH',        apr: 2.8,  freq: 365  },
  { id: 'c', label: 'Lido stETH',          apr: 3.9,  freq: 365  },
  { id: 'd', label: 'Curve 3pool',         apr: 5.1,  freq: 365  },
  { id: 'e', label: 'Uniswap V3 USDC/ETH', apr: 12.4, freq: 365  },
  { id: 'f', label: 'Yearn USDC Vault',    apr: 8.7,  freq: 365  },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

function aprToApy(apr: number, n: number): number {
  if (!apr || !isFinite(apr)) return 0
  if (n === Infinity) return (Math.exp(apr / 100) - 1) * 100
  return (Math.pow(1 + apr / 100 / n, n) - 1) * 100
}

function apyToApr(apy: number, n: number): number {
  if (!apy || !isFinite(apy)) return 0
  if (n === Infinity) return Math.log(1 + apy / 100) * 100
  return (Math.pow(1 + apy / 100, 1 / n) - 1) * n * 100
}

function fmtPct(n: number, dec = 4): string {
  if (!isFinite(n) || n === 0) return '—'
  return n.toFixed(dec) + '%'
}

function fmtDiff(n: number): string {
  if (!n || !isFinite(n)) return '—'
  return (n > 0 ? '+' : '') + n.toFixed(4) + '%'
}

// ── Component ──────────────────────────────────────────────────────────────
export function APRToAPYConverterClient() {
  const tool = getToolBySlug('apr-to-apy-converter')!

  const [direction, setDirection] = useState<Direction>('apr-to-apy')
  const [inputRate, setInputRate] = useState('12')
  const [freqIdx,   setFreqIdx]   = useState(1)   // Daily

  // Comparison table
  const [compareRows, setCompareRows] = useState<CompareRow[]>([
    { id: uid(), label: 'Protocol A', apr: 10,  freq: 365 },
    { id: uid(), label: 'Protocol B', apr: 10,  freq: 12  },
    { id: uid(), label: 'Protocol C', apr: 10,  freq: 1   },
  ])

  const [showProtocols, setShowProtocols] = useState(false)

  // Derived — single converter
  const rate    = useMemo(() => parseFloat(inputRate) || 0, [inputRate])
  const freq    = FREQS[freqIdx]

  const result  = useMemo(() => {
    if (direction === 'apr-to-apy') return aprToApy(rate, freq.n)
    return apyToApr(rate, freq.n)
  }, [rate, freq, direction])

  const inputLabel  = direction === 'apr-to-apy' ? 'APR' : 'APY'
  const outputLabel = direction === 'apr-to-apy' ? 'APY' : 'APR'
  const diff        = direction === 'apr-to-apy' ? result - rate : rate - result

  // Full conversion table (all freqs for current input rate)
  const fullTable = useMemo(() =>
    FREQS.map(f => ({
      ...f,
      apy:  aprToApy(rate, f.n),
      apr:  apyToApr(rate, f.n),
    })),
  [rate])

  // Comparison rows result
  const compareResults = useMemo(() =>
    compareRows.map(r => ({
      ...r,
      apy:    aprToApy(Number(r.apr), r.freq),
      spread: aprToApy(Number(r.apr), r.freq) - Number(r.apr),
    })),
  [compareRows])

  // Row ops
  const addRow = () => setCompareRows(p => [...p, { id: uid(), label: 'New Protocol', apr: 5, freq: 365 }])
  const removeRow = (id: string) => setCompareRows(p => p.filter(r => r.id !== id))
  const updateRow = (id: string, field: keyof CompareRow, val: string | number) =>
    setCompareRows(p => p.map(r => r.id === id ? { ...r, [field]: val } : r))

  const reset = () => {
    setInputRate('12')
    setFreqIdx(1)
    setDirection('apr-to-apy')
    setCompareRows([
      { id: uid(), label: 'Protocol A', apr: 10, freq: 365 },
      { id: uid(), label: 'Protocol B', apr: 10, freq: 12  },
      { id: uid(), label: 'Protocol C', apr: 10, freq: 1   },
    ])
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Direction Toggle ─── */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] w-fit">
          {([
            { key: 'apr-to-apy', label: 'APR → APY' },
            { key: 'apy-to-apr', label: 'APY → APR' },
          ] as const).map(opt => (
            <button key={opt.key} onClick={() => setDirection(opt.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                ${direction === opt.key ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* ─── Main Converter ─── */}
        <ToolSection
          title={`${inputLabel} to ${outputLabel} Converter`}
          description={`Enter a ${inputLabel} rate and select compounding frequency to get the equivalent ${outputLabel}`}
        >
          <div className="space-y-5">
            {/* Rate input */}
            <InputGroup label={`${inputLabel} Rate (%)`} hint={`Enter the ${direction === 'apr-to-apy' ? 'nominal annual' : 'effective annual'} rate`}>
              <div className="relative">
                <input
                  type="number" value={inputRate}
                  onChange={e => setInputRate(e.target.value)}
                  placeholder="12" step="0.01"
                  className="tool-input pr-8 font-mono text-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">%</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['1','2','3','5','8','10','12','15','20','25','30','50','100'].map(v => (
                  <button key={v} onClick={() => setInputRate(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${inputRate === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {v}%
                  </button>
                ))}
              </div>
            </InputGroup>

            {/* Frequency picker */}
            <InputGroup label="Compounding Frequency">
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {FREQS.map((f, i) => (
                  <button key={f.label} onClick={() => setFreqIdx(i)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-lg border text-center transition-all cursor-pointer
                      ${freqIdx === i ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    <span className="text-xs font-semibold leading-tight">{f.label}</span>
                    <span className={`text-[10px] ${freqIdx === i ? 'text-zinc-400' : 'text-zinc-400'}`}>{f.short}/yr</span>
                  </button>
                ))}
              </div>
            </InputGroup>

            {/* Result display */}
            {rate > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl bg-black text-white">
                {/* Input */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{inputLabel}</p>
                  <p className="text-3xl font-bold font-mono">{fmtPct(rate, 4)}</p>
                  <p className="text-xs text-zinc-500 mt-1">{freq.label} compounding</p>
                </div>

                {/* Arrow */}
                <div className="shrink-0 self-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowRight size={18} className="text-white" />
                  </div>
                </div>

                {/* Output */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{outputLabel}</p>
                  <p className="text-3xl font-bold font-mono">{fmtPct(result, 4)}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Spread: <span className="font-semibold">{fmtDiff(Math.abs(diff))}</span>
                  </p>
                </div>

                {/* Copy */}
                <div className="shrink-0">
                  <CopyButton value={result.toFixed(6) + '%'} label={`Copy ${outputLabel}`}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
                </div>
              </div>
            )}
          </div>
        </ToolSection>

        {/* ─── Full frequency table ─── */}
        {rate > 0 && (
          <ToolSection
            title="All Frequencies at a Glance"
            description={`${fmtPct(rate)} ${inputLabel} converted to ${outputLabel} across every compounding interval`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 pr-6 text-xs font-semibold text-black uppercase tracking-wide">Frequency</th>
                    <th className="text-left py-3 pr-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Compounds/yr</th>
                    <th className="text-left py-3 pr-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      {direction === 'apr-to-apy' ? 'APY' : 'APR'}
                    </th>
                    <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Spread</th>
                  </tr>
                </thead>
                <tbody>
                  {fullTable.map((row, i) => {
                    const outputVal = direction === 'apr-to-apy' ? row.apy : row.apr
                    const spread    = direction === 'apr-to-apy' ? row.apy - rate : rate - row.apr
                    const isSelected = i === freqIdx
                    return (
                      <tr key={row.label}
                        className={`border-b border-[var(--border)] last:border-0 transition-colors cursor-pointer
                          ${isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
                        onClick={() => setFreqIdx(i)}>
                        <td className="py-3 pr-6">
                          <span className={`font-semibold ${isSelected ? 'text-black' : 'text-zinc-700'}`}>
                            {row.label}
                            {isSelected && <span className="ml-2 badge-default text-[9px]">selected</span>}
                          </span>
                        </td>
                        <td className="py-3 pr-6 font-mono text-zinc-500 text-xs">
                          {row.n === Infinity ? '∞ (continuous)' : row.n.toLocaleString()}
                        </td>
                        <td className="py-3 pr-6 font-mono font-bold text-black">{fmtPct(outputVal)}</td>
                        <td className="py-3 font-mono text-xs text-zinc-500">
                          +{fmtPct(Math.abs(spread), 4)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
                <Info size={12} />
                Click any row to use that frequency in the converter above.
              </p>
            </div>
          </ToolSection>
        )}

        {/* ─── Protocol Comparison ─── */}
        <ToolSection
          title="Protocol Rate Comparator"
          description="Compare APR and resulting APY across multiple protocols side by side"
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_120px_160px_100px_36px] gap-3 px-1">
              {['Protocol', 'APR %', 'Compounding', 'APY', ''].map(h => (
                <span key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {compareResults.map(row => (
              <div key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_160px_100px_36px] gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-zinc-300 transition-colors items-center">
                <input type="text" value={row.label}
                  onChange={e => updateRow(row.id, 'label', e.target.value)}
                  className="tool-input text-sm font-medium" placeholder="Protocol name" />

                <div className="relative">
                  <input type="number" value={row.apr}
                    onChange={e => updateRow(row.id, 'apr', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5.0" step="0.1"
                    className="tool-input pr-6 font-mono text-sm" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>

                <select value={row.freq}
                  onChange={e => updateRow(row.id, 'freq', Number(e.target.value))}
                  className="tool-input text-sm bg-white appearance-none cursor-pointer">
                  {FREQS.map(f => (
                    <option key={f.label} value={f.n === Infinity ? 999999 : f.n}>
                      {f.label} ({f.short}/yr)
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-black">{fmtPct(row.apy, 3)}</span>
                  {row.spread > 0 && (
                    <span className="text-[10px] text-zinc-400 font-mono">+{row.spread.toFixed(3)}</span>
                  )}
                </div>

                <button onClick={() => removeRow(row.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all justify-self-end sm:justify-self-auto">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={addRow} className="btn-secondary text-xs gap-1.5">
                <Plus size={12} /> Add Protocol
              </button>
              <button
                onClick={() => {
                  setCompareRows(PROTOCOL_PRESETS.map(p => ({ ...p, id: uid() })))
                  setShowProtocols(false)
                }}
                className="btn-secondary text-xs gap-1.5">
                Load DeFi Examples
              </button>
            </div>

            {/* Sorted leaderboard */}
            {compareResults.length > 1 && (
              <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Ranked by APY (highest first)</p>
                <div className="space-y-2">
                  {[...compareResults]
                    .sort((a, b) => b.apy - a.apy)
                    .map((row, rank) => {
                      const maxApy = Math.max(...compareResults.map(r => r.apy))
                      const barPct = maxApy > 0 ? (row.apy / maxApy) * 100 : 0
                      return (
                        <div key={row.id} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-zinc-400 w-5 shrink-0">#{rank + 1}</span>
                          <span className="text-xs font-medium text-black w-28 truncate shrink-0">{row.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${barPct}%` }} />
                          </div>
                          <span className="text-xs font-bold font-mono text-black w-16 text-right shrink-0">
                            {fmtPct(row.apy, 2)}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </ToolSection>

        {/* ─── Formulas ─── */}
        <ToolSection title="Conversion Formulas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
                <p className="text-zinc-500 mb-1">APR → APY (n periods/year)</p>
                <p className="font-semibold text-black">APY = (1 + APR/n)ⁿ − 1</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
                <p className="text-zinc-500 mb-1">APR → APY (continuous)</p>
                <p className="font-semibold text-black">APY = e^APR − 1</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
                <p className="text-zinc-500 mb-1">APY → APR (n periods/year)</p>
                <p className="font-semibold text-black">APR = n × ((1 + APY)^(1/n) − 1)</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
                <p className="text-zinc-500 mb-1">APY → APR (continuous)</p>
                <p className="font-semibold text-black">APR = ln(1 + APY)</p>
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-lg border border-[var(--border)] flex items-start gap-2 text-xs text-zinc-600">
            <Info size={13} className="shrink-0 mt-0.5 text-zinc-400" />
            <p>Most DeFi protocols display <strong className="text-black">APY</strong> assuming daily compounding of rewards. When comparing across protocols, always check whether they advertise APR or APY and what compounding frequency they assume.</p>
          </div>
        </ToolSection>

        {/* Reset */}
        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs">
            <RefreshCw size={12} /> Reset
          </button>
        </div>

      </div>
    </ToolLayout>
  )
}