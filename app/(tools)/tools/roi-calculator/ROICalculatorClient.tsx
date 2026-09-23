'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2, TrendingUp, TrendingDown, Info, Target } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Types ──────────────────────────────────────────────────────────────────
type Mode = 'simple' | 'dca' | 'targets'

interface DCAEntry {
  id: string
  amount: number | ''   // USD invested
  price:  number | ''   // entry price
}

// ── Helpers ────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9) }

function fmt$(n: number, dec = 2): string {
  if (!isFinite(n)) return '—'
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function fmtPrice(n: number): string {
  if (!n || !isFinite(n)) return '—'
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1)    return '$' + n.toFixed(4)
  if (n >= 0.01) return '$' + n.toFixed(6)
  return '$' + n.toExponential(4)
}

function fmtPct(n: number, sign = true): string {
  if (!isFinite(n)) return '—'
  return (sign && n > 0 ? '+' : '') + n.toFixed(2) + '%'
}

function fmtMult(n: number): string {
  if (!isFinite(n) || n <= 0) return '—'
  return n.toFixed(3) + '×'
}

// Target price multiples for scenarios
const TARGET_MULTIPLES = [0.1, 0.25, 0.5, 1.5, 2, 3, 5, 10, 20, 50, 100]

// ── Component ──────────────────────────────────────────────────────────────
export function ROICalculatorClient() {
  const tool = getToolBySlug('roi-calculator')!

  const [mode, setMode] = useState<Mode>('simple')

  // Simple mode
  const [investedRaw,   setInvestedRaw]   = useState('1000')
  const [entryPriceRaw, setEntryPriceRaw] = useState('1.00')
  const [exitPriceRaw,  setExitPriceRaw]  = useState('5.00')
  const [feesPct,       setFeesPct]       = useState('0.1')   // % fee on entry + exit

  // DCA mode
  const [dcaEntries, setDcaEntries] = useState<DCAEntry[]>([
    { id: uid(), amount: 500,  price: 1.00 },
    { id: uid(), amount: 500,  price: 0.75 },
    { id: uid(), amount: 1000, price: 0.50 },
  ])
  const [dcaExitPrice, setDcaExitPrice] = useState('2.00')

  // Derived — simple
  const invested   = useMemo(() => parseFloat(investedRaw)   || 0, [investedRaw])
  const entryPrice = useMemo(() => parseFloat(entryPriceRaw) || 0, [entryPriceRaw])
  const exitPrice  = useMemo(() => parseFloat(exitPriceRaw)  || 0, [exitPriceRaw])
  const feePct     = useMemo(() => parseFloat(feesPct)       / 100 || 0, [feesPct])

  const tokensBought  = useMemo(() => entryPrice > 0 ? invested / entryPrice : 0, [invested, entryPrice])
  const entryFee      = invested * feePct
  const exitFee       = useMemo(() => tokensBought * exitPrice * feePct, [tokensBought, exitPrice, feePct])
  const totalFees     = entryFee + exitFee
  const grossValue    = useMemo(() => tokensBought * exitPrice, [tokensBought, exitPrice])
  const netValue      = grossValue - totalFees
  const grossProfit   = grossValue - invested
  const netProfit     = netValue - invested
  const roiPct        = invested > 0 ? (netProfit / invested) * 100 : 0
  const multiple      = invested > 0 ? netValue / invested : 0
  const isProfit      = netProfit >= 0

  // Derived — DCA
  const dcaExit = useMemo(() => parseFloat(dcaExitPrice) || 0, [dcaExitPrice])

  const dcaMetrics = useMemo(() => {
    const validEntries = dcaEntries.filter(e => Number(e.amount) > 0 && Number(e.price) > 0)
    if (validEntries.length === 0) return null

    const totalInvested   = validEntries.reduce((s, e) => s + Number(e.amount), 0)
    const totalTokens     = validEntries.reduce((s, e) => s + Number(e.amount) / Number(e.price), 0)
    const avgEntryPrice   = totalInvested / totalTokens
    const currentValue    = totalTokens * dcaExit
    const profit          = currentValue - totalInvested
    const roi             = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
    const mult            = totalInvested > 0 ? currentValue / totalInvested : 0

    return { totalInvested, totalTokens, avgEntryPrice, currentValue, profit, roi, mult }
  }, [dcaEntries, dcaExit])

  // Price target scenarios (from simple mode entry)
  const targetScenarios = useMemo(() => {
    if (!invested || !entryPrice) return []
    const tokens = invested / entryPrice
    return TARGET_MULTIPLES.map(m => {
      const tPrice   = entryPrice * m
      const value    = tokens * tPrice
      const profit   = value - invested
      const roi      = (profit / invested) * 100
      return { multiple: m, price: tPrice, value, profit, roi }
    })
  }, [invested, entryPrice])

  // Break-even price
  const breakEvenPrice = useMemo(() => {
    if (!tokensBought || tokensBought === 0) return 0
    // After fees: need exit value ≥ invested + entry fee + exit fee
    // exit fee = tokens * exitP * feePct
    // exit value - invested - entryFee - (tokens * exitP * feePct) = 0
    // tokens * exitP * (1 - feePct) = invested + entryFee
    // exitP = (invested + entryFee) / (tokens * (1 - feePct))
    return (invested + entryFee) / (tokensBought * (1 - feePct))
  }, [tokensBought, invested, entryFee, feePct])

  // DCA row ops
  const addDcaRow = () => setDcaEntries(p => [...p, { id: uid(), amount: 500, price: 1.00 }])
  const removeDcaRow = (id: string) => setDcaEntries(p => p.filter(r => r.id !== id))
  const updateDca = (id: string, field: keyof DCAEntry, val: string) =>
    setDcaEntries(p => p.map(r => r.id === id ? { ...r, [field]: val === '' ? '' : Number(val) } : r))

  const reset = () => {
    setInvestedRaw('1000')
    setEntryPriceRaw('1.00')
    setExitPriceRaw('5.00')
    setFeesPct('0.1')
    setDcaEntries([
      { id: uid(), amount: 500,  price: 1.00 },
      { id: uid(), amount: 500,  price: 0.75 },
      { id: uid(), amount: 1000, price: 0.50 },
    ])
    setDcaExitPrice('2.00')
  }

  const isSimpleValid = invested > 0 && entryPrice > 0 && exitPrice > 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] w-fit">
          {([
            { key: 'simple',  label: 'Simple ROI'   },
            { key: 'dca',     label: 'DCA Average'  },
            { key: 'targets', label: 'Price Targets' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                ${mode === opt.key ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ══════════ SIMPLE ROI ══════════ */}
        {mode === 'simple' && (
          <>
            <ToolSection title="Trade Details" description="Enter your investment, entry price, and exit price">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Amount Invested (USD)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input type="number" value={investedRaw} onChange={e => setInvestedRaw(e.target.value)}
                      placeholder="1000" className="tool-input pl-7 font-mono" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['100','500','1000','5000','10000','50000'].map(v => (
                      <button key={v} onClick={() => setInvestedRaw(v)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                          ${investedRaw === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                        ${parseInt(v).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <InputGroup label="Entry Price (USD)" hint="Price per token when you bought">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input type="number" value={entryPriceRaw} onChange={e => setEntryPriceRaw(e.target.value)}
                      placeholder="1.00" className="tool-input pl-7 font-mono" step="any" />
                  </div>
                </InputGroup>

                <InputGroup label="Exit Price (USD)" hint="Price per token when you sell">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input type="number" value={exitPriceRaw} onChange={e => setExitPriceRaw(e.target.value)}
                      placeholder="5.00" className="tool-input pl-7 font-mono" step="any" />
                  </div>
                </InputGroup>

                <InputGroup label="Trading Fee (%)" hint="Per-trade fee (applied on entry and exit)">
                  <input type="number" value={feesPct} onChange={e => setFeesPct(e.target.value)}
                    placeholder="0.1" step="0.01" className="tool-input font-mono" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['0','0.1','0.25','0.3','0.5','1'].map(v => (
                      <button key={v} onClick={() => setFeesPct(v)}
                        className={`px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer
                          ${feesPct === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                        {v}%
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>
            </ToolSection>

            {isSimpleValid && (
              <>
                {/* Hero result */}
                <div className={`p-6 rounded-xl border-2 ${isProfit ? 'border-black bg-black text-white' : 'border-zinc-400 bg-zinc-100 text-zinc-900'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
                        {isProfit ? 'Net Profit' : 'Net Loss'}
                      </p>
                      <p className="text-5xl font-bold font-mono tracking-tight">
                        {isProfit ? '+' : '-'}{fmt$(Math.abs(netProfit))}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold
                      ${isProfit ? 'bg-white/15 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                      {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {fmtPct(roiPct)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs opacity-50 mb-0.5">Multiple</p>
                      <p className="text-xl font-bold font-mono">{fmtMult(multiple)}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-50 mb-0.5">Exit Value</p>
                      <p className="text-xl font-bold font-mono">{fmt$(netValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-50 mb-0.5">Tokens</p>
                      <p className="text-xl font-bold font-mono">
                        {tokensBought.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <ToolSection title="Full Breakdown">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      title="Investment"
                      items={[
                        { label: 'Amount Invested',  value: fmt$(invested) },
                        { label: 'Entry Price',       value: fmtPrice(entryPrice) },
                        { label: 'Tokens Bought',     value: tokensBought.toLocaleString('en-US', { maximumFractionDigits: 6 }) },
                        { label: 'Entry Fee',         value: fmt$(entryFee) },
                      ]}
                    />
                    <InfoCard
                      title="Exit"
                      items={[
                        { label: 'Exit Price',        value: fmtPrice(exitPrice) },
                        { label: 'Gross Value',       value: fmt$(grossValue) },
                        { label: 'Exit Fee',          value: fmt$(exitFee) },
                        { label: 'Net Value',         value: fmt$(netValue), highlight: true },
                      ]}
                    />
                    <InfoCard
                      title="Returns"
                      items={[
                        { label: 'Gross Profit',      value: (grossProfit >= 0 ? '+' : '') + fmt$(grossProfit) },
                        { label: 'Total Fees Paid',   value: fmt$(totalFees) },
                        { label: 'Net Profit / Loss', value: (netProfit >= 0 ? '+' : '-') + fmt$(Math.abs(netProfit)), highlight: true },
                        { label: 'ROI',               value: fmtPct(roiPct) },
                      ]}
                    />
                    <InfoCard
                      title="Metrics"
                      items={[
                        { label: 'Multiple',           value: fmtMult(multiple) },
                        { label: 'Break-even Price',   value: fmtPrice(breakEvenPrice) },
                        { label: 'Price Increase',     value: fmtPct(((exitPrice - entryPrice) / entryPrice) * 100) },
                        { label: 'Fee Drag',           value: '-' + fmt$(totalFees) + ' (' + ((totalFees / invested) * 100).toFixed(3) + '%)' },
                      ]}
                    />
                  </div>
                </ToolSection>
              </>
            )}
          </>
        )}

        {/* ══════════ DCA MODE ══════════ */}
        {mode === 'dca' && (
          <>
            <ToolSection
              title="DCA Entries"
              description="Add multiple buy orders to calculate your average entry price"
            >
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_36px] gap-3 px-1">
                  {['USD Amount', 'Token Price', ''].map(h => (
                    <span key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</span>
                  ))}
                </div>

                {dcaEntries.map((entry, i) => (
                  <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_36px] gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-zinc-300 transition-colors">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                      <input type="number" value={entry.amount} placeholder="500"
                        onChange={e => updateDca(entry.id, 'amount', e.target.value)}
                        className="tool-input pl-7 font-mono" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                      <input type="number" value={entry.price} placeholder="1.00" step="any"
                        onChange={e => updateDca(entry.id, 'price', e.target.value)}
                        className="tool-input pl-7 font-mono" />
                    </div>
                    <button onClick={() => removeDcaRow(entry.id)}
                      className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all self-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button onClick={addDcaRow} className="btn-secondary text-xs gap-1.5">
                  <Plus size={12} /> Add Buy Order
                </button>
              </div>
            </ToolSection>

            <ToolSection title="Current / Exit Price">
              <InputGroup label="Current or Target Exit Price (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={dcaExitPrice} onChange={e => setDcaExitPrice(e.target.value)}
                    placeholder="2.00" step="any" className="tool-input pl-7 font-mono" />
                </div>
              </InputGroup>
            </ToolSection>

            {dcaMetrics && (
              <>
                {/* DCA hero */}
                <div className={`p-6 rounded-xl border-2 ${dcaMetrics.profit >= 0 ? 'border-black bg-black text-white' : 'border-zinc-400 bg-zinc-100'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
                        {dcaMetrics.profit >= 0 ? 'Total Profit' : 'Total Loss'}
                      </p>
                      <p className="text-4xl font-bold font-mono">
                        {dcaMetrics.profit >= 0 ? '+' : '-'}{fmt$(Math.abs(dcaMetrics.profit))}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold
                      ${dcaMetrics.profit >= 0 ? 'bg-white/15 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                      {dcaMetrics.profit >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      {fmtPct(dcaMetrics.roi)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    {[
                      { label: 'Avg Entry', value: fmtPrice(dcaMetrics.avgEntryPrice) },
                      { label: 'Total Invested', value: fmt$(dcaMetrics.totalInvested) },
                      { label: 'Current Value', value: fmt$(dcaMetrics.currentValue) },
                      { label: 'Multiple', value: fmtMult(dcaMetrics.mult) },
                    ].map(m => (
                      <div key={m.label}>
                        <p className="text-xs opacity-50 mb-0.5">{m.label}</p>
                        <p className="text-lg font-bold font-mono">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-entry breakdown */}
                <ToolSection title="Per-Entry Breakdown">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          {['#', 'Invested', 'Entry Price', 'Tokens', 'Current Value', 'P&L', 'ROI'].map(h => (
                            <th key={h} className="text-left py-2.5 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dcaEntries.filter(e => Number(e.amount) > 0 && Number(e.price) > 0).map((entry, i) => {
                          const tokens = Number(entry.amount) / Number(entry.price)
                          const value  = tokens * dcaExit
                          const pnl    = value - Number(entry.amount)
                          const roi    = (pnl / Number(entry.amount)) * 100
                          return (
                            <tr key={entry.id} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50">
                              <td className="py-2.5 pr-4 text-zinc-400 font-mono text-xs">#{i + 1}</td>
                              <td className="py-2.5 pr-4 font-mono">{fmt$(Number(entry.amount))}</td>
                              <td className="py-2.5 pr-4 font-mono">{fmtPrice(Number(entry.price))}</td>
                              <td className="py-2.5 pr-4 font-mono text-xs">{tokens.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                              <td className="py-2.5 pr-4 font-mono font-semibold">{fmt$(value)}</td>
                              <td className={`py-2.5 pr-4 font-mono font-semibold ${pnl >= 0 ? 'text-black' : 'text-zinc-500'}`}>
                                {pnl >= 0 ? '+' : ''}{fmt$(pnl)}
                              </td>
                              <td className={`py-2.5 font-mono text-xs font-semibold ${roi >= 0 ? 'text-black' : 'text-zinc-500'}`}>
                                {fmtPct(roi)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </ToolSection>
              </>
            )}
          </>
        )}

        {/* ══════════ PRICE TARGETS ══════════ */}
        {mode === 'targets' && (
          <>
            <ToolSection title="Investment Details" description="Enter your position to model price target scenarios">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Amount Invested (USD)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input type="number" value={investedRaw} onChange={e => setInvestedRaw(e.target.value)}
                      placeholder="1000" className="tool-input pl-7 font-mono" />
                  </div>
                </InputGroup>
                <InputGroup label="Entry Price (USD)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                    <input type="number" value={entryPriceRaw} onChange={e => setEntryPriceRaw(e.target.value)}
                      placeholder="1.00" className="tool-input pl-7 font-mono" step="any" />
                  </div>
                </InputGroup>
              </div>
            </ToolSection>

            {invested > 0 && entryPrice > 0 && (
              <ToolSection
                title="Price Target Scenarios"
                description={`Starting from ${fmtPrice(entryPrice)} with ${fmt$(invested)} invested`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black">
                        {['Multiple', 'Target Price', 'Portfolio Value', 'Profit / Loss', 'ROI %'].map(h => (
                          <th key={h} className="text-left py-3 pr-6 last:pr-0 text-xs font-semibold text-black uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {targetScenarios.map(s => {
                        const isLoss   = s.profit < 0
                        const is1x     = s.multiple === 1
                        return (
                          <tr key={s.multiple}
                            className={`border-b border-[var(--border)] last:border-0 transition-colors
                              ${is1x ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                            <td className="py-3 pr-6">
                              <span className={`inline-flex items-center gap-1.5 font-bold
                                ${isLoss ? 'text-zinc-400' : 'text-black'}`}>
                                {isLoss ? <TrendingDown size={13} className="text-zinc-300" /> : <TrendingUp size={13} />}
                                {s.multiple}×
                                {is1x && <span className="badge-default text-[9px] font-normal">entry</span>}
                              </span>
                            </td>
                            <td className="py-3 pr-6 font-mono font-semibold text-black">{fmtPrice(s.price)}</td>
                            <td className="py-3 pr-6 font-mono">{fmt$(s.value)}</td>
                            <td className={`py-3 pr-6 font-mono font-semibold ${isLoss ? 'text-zinc-400' : 'text-black'}`}>
                              {s.profit >= 0 ? '+' : ''}{fmt$(s.profit)}
                            </td>
                            <td className={`py-3 font-mono font-bold text-sm ${isLoss ? 'text-zinc-400' : 'text-black'}`}>
                              {fmtPct(s.roi)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
                  <Info size={12} />
                  Does not include trading fees. Use Simple ROI mode for fee-adjusted calculations.
                </p>
              </ToolSection>
            )}
          </>
        )}

        {/* ─── Formula ─── */}
        <ToolSection title="Formulas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-sm">
            {[
              { label: 'ROI',      formula: '(Net Profit ÷ Invested) × 100' },
              { label: 'Multiple', formula: 'Exit Value ÷ Amount Invested'  },
              { label: 'Avg Entry', formula:'Total Invested ÷ Total Tokens'  },
            ].map(f => (
              <div key={f.label} className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                <p className="text-zinc-500 text-xs mb-1">{f.label}</p>
                <p className="font-semibold text-black text-xs sm:text-sm">{f.formula}</p>
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