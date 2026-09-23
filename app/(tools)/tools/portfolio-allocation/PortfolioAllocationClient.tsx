'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function uid() { return Math.random().toString(36).slice(2, 9) }
function fmt$(n: number): string {
  if (!isFinite(n) || !n) return '$0'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(3) + 'M'
  if (n >= 1e3) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return '$' + n.toFixed(2)
}

type RiskProfile = 'conservative' | 'balanced' | 'aggressive' | 'custom'

interface Holding {
  id: string
  asset: string
  currentPct: number | ''
  targetPct: number | ''
  currentValue: number | ''
  riskLevel: 'low' | 'medium' | 'high'
}

const RISK_PROFILES: Record<RiskProfile, { label: string; description: string; presets: Omit<Holding, 'id'>[] }> = {
  conservative: {
    label: 'Conservative',
    description: 'Capital preservation focus — mostly BTC/ETH with stable assets',
    presets: [
      { asset: 'BTC',   currentPct: 35, targetPct: 40, currentValue: 35000, riskLevel: 'low' },
      { asset: 'ETH',   currentPct: 30, targetPct: 30, currentValue: 30000, riskLevel: 'low' },
      { asset: 'USDC',  currentPct: 25, targetPct: 20, currentValue: 25000, riskLevel: 'low' },
      { asset: 'SOL',   currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'medium' },
    ],
  },
  balanced: {
    label: 'Balanced',
    description: 'Mix of blue chips, mid caps, and small caps',
    presets: [
      { asset: 'BTC',   currentPct: 30, targetPct: 30, currentValue: 30000, riskLevel: 'low' },
      { asset: 'ETH',   currentPct: 25, targetPct: 25, currentValue: 25000, riskLevel: 'low' },
      { asset: 'SOL',   currentPct: 15, targetPct: 15, currentValue: 15000, riskLevel: 'medium' },
      { asset: 'AVAX',  currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'medium' },
      { asset: 'LINK',  currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'medium' },
      { asset: 'USDC',  currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'low' },
    ],
  },
  aggressive: {
    label: 'Aggressive',
    description: 'High-growth focus — altcoins, DeFi, and emerging L1s',
    presets: [
      { asset: 'BTC',   currentPct: 20, targetPct: 20, currentValue: 20000, riskLevel: 'low' },
      { asset: 'ETH',   currentPct: 20, targetPct: 20, currentValue: 20000, riskLevel: 'low' },
      { asset: 'SOL',   currentPct: 15, targetPct: 15, currentValue: 15000, riskLevel: 'medium' },
      { asset: 'AVAX',  currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'medium' },
      { asset: 'INJ',   currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'high' },
      { asset: 'ARB',   currentPct: 10, targetPct: 10, currentValue: 10000, riskLevel: 'high' },
      { asset: 'PEPE',  currentPct: 15, targetPct: 15, currentValue: 15000, riskLevel: 'high' },
    ],
  },
  custom: {
    label: 'Custom',
    description: 'Build your own allocation',
    presets: [
      { asset: 'BTC',   currentPct: 50, targetPct: 50, currentValue: 5000, riskLevel: 'low' },
      { asset: 'ETH',   currentPct: 30, targetPct: 30, currentValue: 3000, riskLevel: 'low' },
      { asset: 'Other', currentPct: 20, targetPct: 20, currentValue: 2000, riskLevel: 'medium' },
    ],
  },
}

const SHADES = ['bg-black','bg-zinc-700','bg-zinc-600','bg-zinc-500','bg-zinc-400','bg-zinc-300','bg-zinc-200']
const RISK_BADGE: Record<string, string> = {
  low:    'bg-zinc-100 text-zinc-600',
  medium: 'bg-zinc-200 text-zinc-700',
  high:   'bg-black text-white',
}

export function PortfolioAllocationClient() {
  const tool = getToolBySlug('portfolio-allocation')!

  const [profile,    setProfile]    = useState<RiskProfile>('balanced')
  const [holdings,   setHoldings]   = useState<Holding[]>(() => RISK_PROFILES.balanced.presets.map(p => ({ ...p, id: uid() })))
  const [portfolioVal, setPortfolioVal] = useState('100000')

  const totalValue   = parseFloat(portfolioVal.replace(/,/g, '')) || 0
  const currentTotal = useMemo(() => holdings.reduce((s, h) => s + (Number(h.currentValue) || 0), 0), [holdings])
  const currentPctTotal = useMemo(() => holdings.reduce((s, h) => s + (Number(h.currentPct) || 0), 0), [holdings])
  const targetPctTotal  = useMemo(() => holdings.reduce((s, h) => s + (Number(h.targetPct)  || 0), 0), [holdings])

  const rows = useMemo(() => holdings.map(h => {
    const curPct    = Number(h.currentPct)  || 0
    const tgtPct    = Number(h.targetPct)   || 0
    const curVal    = Number(h.currentValue) || 0
    const tgtVal    = totalValue * (tgtPct / 100)
    const curValPct = currentTotal > 0 ? (curVal / currentTotal) * 100 : 0
    const diff      = tgtVal - curVal
    const action    = diff > 0 ? 'Buy' : diff < 0 ? 'Sell' : 'Hold'
    return { ...h, curPct, tgtPct, curVal, tgtVal, curValPct, diff, action }
  }), [holdings, totalValue, currentTotal])

  const riskScore = useMemo(() => {
    const weights = { low: 1, medium: 2, high: 3 }
    const total = rows.reduce((s, r) => s + (Number(r.currentPct) || 0), 0)
    if (!total) return 0
    return rows.reduce((s, r) => s + (weights[r.riskLevel] || 1) * (Number(r.currentPct) / total), 0)
  }, [rows])

  const riskLabel = riskScore < 1.5 ? 'Conservative' : riskScore < 2.2 ? 'Balanced' : 'Aggressive'

  const applyProfile = (p: RiskProfile) => {
    setProfile(p)
    setHoldings(RISK_PROFILES[p].presets.map(x => ({ ...x, id: uid() })))
  }

  const addRow = () => setHoldings(p => [...p, { id: uid(), asset: 'NEW', currentPct: 0, targetPct: 0, currentValue: 0, riskLevel: 'medium' }])
  const removeRow = (id: string) => setHoldings(p => p.filter(r => r.id !== id))
  const update = (id: string, field: keyof Holding, val: string) =>
    setHoldings(p => p.map(r => r.id === id ? { ...r, [field]: ['asset', 'riskLevel'].includes(field) ? val : (val === '' ? '' : Number(val)) } : r))

  const reset = () => applyProfile('balanced')

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* Risk profile selector */}
        <ToolSection title="Risk Profile" description="Choose a preset allocation strategy or build your own">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(RISK_PROFILES) as RiskProfile[]).map(p => (
              <button key={p} onClick={() => applyProfile(p)}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all cursor-pointer
                  ${profile === p ? 'bg-black text-white border-black' : 'border-[var(--border)] hover:border-zinc-400'}`}>
                <span className="text-sm font-semibold">{RISK_PROFILES[p].label}</span>
                <span className={`text-[10px] mt-1 leading-relaxed ${profile === p ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {RISK_PROFILES[p].description}
                </span>
              </button>
            ))}
          </div>
        </ToolSection>

        {/* Total portfolio value */}
        <ToolSection title="Portfolio Value">
          <InputGroup label="Total Portfolio Value (USD)" hint="Used to calculate target USD amounts">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input type="text" value={portfolioVal} onChange={e => setPortfolioVal(e.target.value)} className="tool-input pl-7 font-mono" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[['$10K','10000'],['$50K','50000'],['$100K','100000'],['$500K','500000'],['$1M','1000000']].map(([l,v]) => (
                <button key={v} onClick={() => setPortfolioVal(v)}
                  className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${portfolioVal===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
              ))}
            </div>
          </InputGroup>
        </ToolSection>

        {/* Holdings table */}
        <ToolSection title="Holdings" description="Set current and target allocation percentages">
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[80px_100px_100px_120px_80px_36px] gap-2 px-1">
              {['Asset', 'Current %', 'Target %', 'Current Value', 'Risk', ''].map(h => (
                <span key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {holdings.map((h, i) => (
              <div key={h.id} className="grid grid-cols-1 sm:grid-cols-[80px_100px_100px_120px_80px_36px] gap-2 p-3 rounded-lg border border-[var(--border)] items-center hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${SHADES[i % SHADES.length]}`} />
                  <input type="text" value={h.asset} onChange={e => update(h.id, 'asset', e.target.value)}
                    className="tool-input text-sm font-bold uppercase" />
                </div>
                <input type="number" value={h.currentPct} onChange={e => update(h.id, 'currentPct', e.target.value)}
                  className="tool-input font-mono text-sm text-center" min={0} max={100} />
                <input type="number" value={h.targetPct} onChange={e => update(h.id, 'targetPct', e.target.value)}
                  className="tool-input font-mono text-sm text-center" min={0} max={100} />
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={h.currentValue} onChange={e => update(h.id, 'currentValue', e.target.value)}
                    className="tool-input pl-7 font-mono text-sm" /></div>
                <select value={h.riskLevel} onChange={e => update(h.id, 'riskLevel', e.target.value)}
                  className="tool-input text-xs bg-white cursor-pointer appearance-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button onClick={() => removeRow(h.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-[80px_100px_100px_120px_80px_36px] gap-2 px-3 py-2.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Total</span>
              <span className={`text-sm font-bold font-mono text-center ${Math.abs(currentPctTotal - 100) < 0.01 ? 'text-black' : 'text-red-500'}`}>{currentPctTotal.toFixed(1)}%</span>
              <span className={`text-sm font-bold font-mono text-center ${Math.abs(targetPctTotal - 100) < 0.01 ? 'text-black' : 'text-red-500'}`}>{targetPctTotal.toFixed(1)}%</span>
              <span className="text-sm font-bold font-mono pl-7">{fmt$(currentTotal)}</span>
              <span />
              <span />
            </div>

            <button onClick={addRow} className="btn-secondary text-xs gap-1.5 mt-1">
              <Plus size={12} /> Add Asset
            </button>
          </div>
        </ToolSection>

        {/* Visualization + rebalancing */}
        {rows.length > 0 && (
          <>
            {/* Current allocation bar */}
            <ToolSection title="Current Allocation">
              <div className="h-8 rounded-xl overflow-hidden border border-[var(--border)] flex mb-3">
                {rows.map((r, i) => (
                  <div key={r.id} className={`h-full ${SHADES[i % SHADES.length]} transition-all`}
                    style={{ width: `${r.curPct}%` }} title={`${r.asset}: ${r.curPct}%`} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {rows.map((r, i) => (
                  <span key={r.id} className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <span className={`w-2.5 h-2.5 rounded-full ${SHADES[i % SHADES.length]}`} />
                    <span className="font-semibold text-black">{r.asset}</span> {r.curPct}%
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${RISK_BADGE[r.riskLevel]}`}>{r.riskLevel}</span>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Portfolio Risk Score</p>
                  <p className="text-lg font-bold">{riskScore.toFixed(2)} / 3.0 — <span className="text-zinc-600">{riskLabel}</span></p>
                </div>
              </div>
            </ToolSection>

            {/* Rebalancing table */}
            <ToolSection title="Rebalancing Actions" description={`Target portfolio: ${fmt$(totalValue)}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Asset', 'Current', 'Target %', 'Target Value', 'Difference', 'Action'].map(h => (
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 pr-4 font-bold text-black">{r.asset}</td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs">{fmt$(r.curVal)}</span>
                          <span className="text-[10px] text-zinc-400 ml-1">({r.curPct}%)</span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">{r.tgtPct}%</td>
                        <td className="py-3 pr-4 font-mono text-xs font-semibold">{fmt$(r.tgtVal)}</td>
                        <td className={`py-3 pr-4 font-mono text-xs font-bold ${r.diff > 0 ? 'text-black' : r.diff < 0 ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {r.diff > 0 ? '+' : ''}{fmt$(r.diff)}
                        </td>
                        <td className="py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                            ${r.action === 'Buy' ? 'bg-black text-white' :
                              r.action === 'Sell' ? 'bg-zinc-200 text-zinc-700' :
                              'bg-zinc-100 text-zinc-500'}`}>
                            {r.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ToolSection>
          </>
        )}

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}