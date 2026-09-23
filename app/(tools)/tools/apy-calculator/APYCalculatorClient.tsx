'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, Info, TrendingUp } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Types ──────────────────────────────────────────────────────────────────
interface CompoundFreq {
  label:      string
  sublabel:   string
  n:          number   // compounds per year
}

// ── Constants ──────────────────────────────────────────────────────────────
const COMPOUND_FREQS: CompoundFreq[] = [
  { label: 'Continuous', sublabel: 'e^r',        n: Infinity },
  { label: 'Daily',      sublabel: '365×/yr',     n: 365      },
  { label: 'Weekly',     sublabel: '52×/yr',      n: 52       },
  { label: 'Bi-weekly',  sublabel: '26×/yr',      n: 26       },
  { label: 'Monthly',    sublabel: '12×/yr',      n: 12       },
  { label: 'Quarterly',  sublabel: '4×/yr',       n: 4        },
  { label: 'Semi-annual',sublabel: '2×/yr',       n: 2        },
  { label: 'Annual',     sublabel: '1×/yr',       n: 1        },
]

const TIME_PERIODS = [
  { label: '1 Week',    days: 7   },
  { label: '1 Month',   days: 30  },
  { label: '3 Months',  days: 90  },
  { label: '6 Months',  days: 180 },
  { label: '1 Year',    days: 365 },
  { label: '2 Years',   days: 730 },
  { label: '3 Years',   days: 1095},
  { label: '5 Years',   days: 1825},
]

// ── Helpers ────────────────────────────────────────────────────────────────
/** APY from APR given n compounding periods per year */
function aprToApy(apr: number, n: number): number {
  if (n === Infinity) return Math.exp(apr / 100) - 1  // continuous
  return Math.pow(1 + apr / 100 / n, n) - 1
}

/** Future value: principal * (1 + periodic_rate)^(n * years) */
function futureValue(principal: number, apr: number, n: number, days: number): number {
  const years = days / 365
  if (n === Infinity) return principal * Math.exp((apr / 100) * years)
  return principal * Math.pow(1 + apr / 100 / n, n * years)
}

function fmt$(n: number): string {
  if (!isFinite(n)) return '—'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(3)  + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(3)  + 'M'
  if (n >= 1e3)  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return '$' + n.toFixed(2)
}

function fmtPct(n: number, decimals = 2): string {
  if (!isFinite(n)) return '—'
  return n.toFixed(decimals) + '%'
}

// ── Component ──────────────────────────────────────────────────────────────
export function APYCalculatorClient() {
  const tool = getToolBySlug('apy-calculator')!

  const [aprRaw,      setAprRaw]      = useState('12')
  const [principalRaw,setPrincipalRaw]= useState('10000')
  const [freqIdx,     setFreqIdx]     = useState(1)   // Daily by default
  const [daysRaw,     setDaysRaw]     = useState('365')
  const [reinvest,    setReinvest]    = useState(true)

  // Derived
  const apr       = useMemo(() => parseFloat(aprRaw)       || 0, [aprRaw])
  const principal = useMemo(() => parseFloat(principalRaw.replace(/,/g, '')) || 0, [principalRaw])
  const days      = useMemo(() => parseInt(daysRaw)        || 365, [daysRaw])
  const freq      = COMPOUND_FREQS[freqIdx]

  // Core calculations
  const apy = useMemo(() => {
    if (!apr) return 0
    return aprToApy(apr, freq.n) * 100
  }, [apr, freq])

  const fv = useMemo(() => {
    if (!principal || !apr) return 0
    if (reinvest) {
      return futureValue(principal, apr, freq.n, days)
    } else {
      // Simple interest (no compounding)
      return principal * (1 + (apr / 100) * (days / 365))
    }
  }, [principal, apr, freq, days, reinvest])

  const totalEarned  = fv - principal
  const roiPct       = principal > 0 ? (totalEarned / principal) * 100 : 0

  // Daily / weekly / monthly earnings
  const dailyEarning   = principal > 0 && apr > 0
    ? futureValue(principal, apr, freq.n, 1)  - principal : 0
  const weeklyEarning  = principal > 0 && apr > 0
    ? futureValue(principal, apr, freq.n, 7)  - principal : 0
  const monthlyEarning = principal > 0 && apr > 0
    ? futureValue(principal, apr, freq.n, 30) - principal : 0

  // Comparison across all compound freqs at same APR
  const freqComparison = useMemo(() =>
    COMPOUND_FREQS.map(f => ({
      ...f,
      apy: aprToApy(apr, f.n) * 100,
      fv:  futureValue(principal, apr, f.n, days),
    })),
  [apr, principal, days])

  // Growth over time (for current settings)
  const growthTimeline = useMemo(() =>
    TIME_PERIODS.map(p => ({
      ...p,
      fv:      futureValue(principal, apr, freq.n, p.days),
      earned:  futureValue(principal, apr, freq.n, p.days) - principal,
      roiPct:  ((futureValue(principal, apr, freq.n, p.days) - principal) / principal) * 100,
    })),
  [principal, apr, freq])

  // APR presets
  const aprPresets = ['1','3','5','8','10','12','15','20','30','50','100']

  const reset = () => {
    setAprRaw('12')
    setPrincipalRaw('10000')
    setFreqIdx(1)
    setDaysRaw('365')
    setReinvest(true)
  }

  const isValid = apr > 0 && principal > 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Inputs ─── */}
        <ToolSection title="Parameters" description="Configure your APR, principal, and compounding frequency">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* APR */}
            <InputGroup label="Annual Percentage Rate (APR)" hint="The base interest rate before compounding">
              <div className="relative">
                <input type="number" value={aprRaw} onChange={e => setAprRaw(e.target.value)}
                  placeholder="12" step="0.1" className="tool-input pr-8 font-mono" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {aprPresets.map(v => (
                  <button key={v} onClick={() => setAprRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${aprRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {v}%
                  </button>
                ))}
              </div>
            </InputGroup>

            {/* Principal */}
            <InputGroup label="Initial Investment (USD)" hint="Starting amount to invest">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="text" value={principalRaw} onChange={e => setPrincipalRaw(e.target.value)}
                  placeholder="10000" className="tool-input pl-7 font-mono" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$1K','1000'],['$5K','5000'],['$10K','10000'],['$50K','50000'],['$100K','100000']].map(([l,v]) => (
                  <button key={v} onClick={() => setPrincipalRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${principalRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            {/* Duration */}
            <InputGroup label="Duration (Days)" hint="Investment time horizon">
              <input type="number" value={daysRaw} onChange={e => setDaysRaw(e.target.value)}
                placeholder="365" className="tool-input font-mono" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['7d','7'],['30d','30'],['90d','90'],['180d','180'],['1yr','365'],['2yr','730'],['3yr','1095']].map(([l,v]) => (
                  <button key={v} onClick={() => setDaysRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                      ${daysRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </InputGroup>

            {/* Reinvest toggle */}
            <InputGroup label="Compounding Mode">
              <div className="flex gap-2">
                <button onClick={() => setReinvest(true)}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer
                    ${reinvest ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                  🔁 Compound (reinvest)
                </button>
                <button onClick={() => setReinvest(false)}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer
                    ${!reinvest ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                  📤 Simple interest
                </button>
              </div>
            </InputGroup>
          </div>
        </ToolSection>

        {/* Compounding frequency */}
        <ToolSection title="Compounding Frequency" description="How often interest is compounded and reinvested">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {COMPOUND_FREQS.map((f, i) => (
              <button key={f.label} onClick={() => setFreqIdx(i)}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all cursor-pointer
                  ${freqIdx === i ? 'bg-black text-white border-black' : 'bg-white border-[var(--border)] text-zinc-700 hover:border-zinc-400'}`}>
                <span className="text-xs font-semibold">{f.label}</span>
                <span className={`text-[10px] ${freqIdx === i ? 'text-zinc-400' : 'text-zinc-400'}`}>{f.sublabel}</span>
              </button>
            ))}
          </div>
        </ToolSection>

        {/* ─── Results ─── */}
        {isValid && (
          <>
            {/* Hero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-6 rounded-xl border-2 border-black bg-black text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">APY ({freq.label} compounding)</p>
                    <p className="text-5xl font-bold font-mono tracking-tight">{fmtPct(apy)}</p>
                    <p className="text-xs text-zinc-400 mt-2">{fmtPct(apr)} APR → {fmtPct(apy)} APY</p>
                  </div>
                  <TrendingUp size={28} className="text-zinc-600 mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Final Value</p>
                    <p className="text-lg font-bold font-mono">{fmt$(fv)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Total Earned</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">+{fmt$(totalEarned)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">ROI</p>
                    <p className="text-lg font-bold font-mono">+{fmtPct(roiPct)}</p>
                  </div>
                </div>
              </div>

              {/* Quick earnings */}
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Daily',   value: dailyEarning   },
                  { label: 'Weekly',  value: weeklyEarning  },
                  { label: 'Monthly', value: monthlyEarning },
                ].map(e => (
                  <div key={e.label} className="flex-1 p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">{e.label}</span>
                    <span className="text-sm font-bold font-mono text-black">+{fmt$(e.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* APR / APY detail */}
            <ToolSection title="APR → APY Conversion">
              <InfoCard
                title="Conversion Details"
                items={[
                  { label: 'Input APR',             value: fmtPct(apr) },
                  { label: 'Compounding Frequency', value: freq.label + ' (' + freq.sublabel + ')' },
                  { label: 'Calculated APY',         value: fmtPct(apy), highlight: true },
                  { label: 'APY − APR Difference',  value: '+' + fmtPct(apy - apr) },
                  { label: 'Mode',                   value: reinvest ? 'Compound (reinvest)' : 'Simple interest' },
                ]}
              />
            </ToolSection>

            {/* Growth timeline */}
            <ToolSection
              title="Growth Timeline"
              description={`How ${fmt$(principal)} grows at ${fmtPct(apr)} APR with ${freq.label.toLowerCase()} compounding`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Period', 'Final Value', 'Total Earned', 'ROI', 'Progress'].map(h => (
                        <th key={h} className="text-left py-3 pr-6 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {growthTimeline.map(row => {
                      // Max ROI for bar scaling
                      const maxRoi = growthTimeline[growthTimeline.length - 1].roiPct
                      const barPct = maxRoi > 0 ? (row.roiPct / maxRoi) * 100 : 0
                      const isCurrent = Math.abs(row.days - days) < 1

                      return (
                        <tr key={row.label} className={`border-b border-[var(--border)] last:border-0 transition-colors
                          ${isCurrent ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                          <td className="py-3 pr-6">
                            <span className={`text-sm font-medium ${isCurrent ? 'text-black' : 'text-zinc-700'}`}>
                              {row.label}
                              {isCurrent && <span className="ml-2 badge-default text-[9px]">selected</span>}
                            </span>
                          </td>
                          <td className="py-3 pr-6 font-mono font-semibold text-black">{fmt$(row.fv)}</td>
                          <td className="py-3 pr-6 font-mono text-zinc-700">+{fmt$(row.earned)}</td>
                          <td className="py-3 pr-6 font-mono font-bold">+{fmtPct(row.roiPct)}</td>
                          <td className="py-3 w-28">
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                              <div className="h-full bg-black rounded-full" style={{ width: `${barPct}%` }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ToolSection>

            {/* Frequency comparison */}
            <ToolSection
              title="Compounding Frequency Comparison"
              description={`Effect of compounding frequency on APY and final value at ${fmtPct(apr)} APR over ${days} days`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Frequency', 'Compounds/yr', 'APY', 'Final Value', 'Total Earned'].map(h => (
                        <th key={h} className="text-left py-3 pr-6 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {freqComparison.map((row, i) => {
                      const isSelected = i === freqIdx
                      return (
                        <tr key={row.label}
                          className={`border-b border-[var(--border)] last:border-0 transition-colors cursor-pointer
                            ${isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
                          onClick={() => setFreqIdx(i)}>
                          <td className="py-3 pr-6">
                            <span className={`font-medium ${isSelected ? 'text-black' : 'text-zinc-600'}`}>
                              {row.label}
                              {isSelected && <span className="ml-2 badge-default text-[9px]">selected</span>}
                            </span>
                          </td>
                          <td className="py-3 pr-6 font-mono text-zinc-500 text-xs">
                            {row.n === Infinity ? '∞' : row.n.toLocaleString()}
                          </td>
                          <td className="py-3 pr-6 font-mono font-bold text-black">{fmtPct(row.apy)}</td>
                          <td className="py-3 pr-6 font-mono font-semibold">{fmt$(row.fv)}</td>
                          <td className="py-3 font-mono text-zinc-700">+{fmt$(row.fv - principal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
                  <Info size={12} />
                  Click any row to select that compounding frequency.
                </p>
              </div>
            </ToolSection>
          </>
        )}

        {/* ─── Formula ─── */}
        <ToolSection title="Formulas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
              <p className="text-zinc-500 mb-1">APY (n compounds/yr)</p>
              <p className="font-semibold text-black">APY = (1 + APR/n)ⁿ − 1</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
              <p className="text-zinc-500 mb-1">Continuous compounding</p>
              <p className="font-semibold text-black">APY = e^APR − 1</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-xs">
              <p className="text-zinc-500 mb-1">Future Value</p>
              <p className="font-semibold text-black">FV = P × (1 + APR/n)^(n×t)</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs text-zinc-600">
            {[
              { t: 'APR vs APY', b: 'APR is the simple annual rate. APY accounts for compounding — the more frequent the compounding, the higher the APY relative to APR.' },
              { t: 'DeFi Rates',  b: 'Most DeFi protocols advertise APY assuming daily or continuous compounding. Always verify how returns are calculated before investing.' },
            ].map(item => (
              <div key={item.t} className="p-3 rounded-lg border border-[var(--border)]">
                <p className="font-semibold text-black mb-1">{item.t}</p>
                <p className="leading-relaxed">{item.b}</p>
              </div>
            ))}
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