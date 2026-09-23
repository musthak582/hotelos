'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2, Info } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function uid() { return Math.random().toString(36).slice(2, 9) }
function fmt$(n: number): string {
  if (!isFinite(n)) return '—'
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtPct(n: number): string { return n.toFixed(2) + '%' }

interface Trade {
  id: string
  asset: string
  buyPrice: number | ''
  sellPrice: number | ''
  amount: number | ''
  holdDays: number | ''
}

const TAX_BRACKETS = [
  { label: 'USA Short-term',  short: 37,   long: 20,  country: 'US' },
  { label: 'USA Long-term',   short: 37,   long: 15,  country: 'US' },
  { label: 'UK',              short: 20,   long: 20,  country: 'UK' },
  { label: 'Germany',         short: 25,   long: 25,  country: 'DE' },
  { label: 'Australia',       short: 45,   long: 22.5,country: 'AU' },
  { label: 'Custom',          short: 30,   long: 15,  country: 'XX' },
]

const DEFAULT_TRADES: Trade[] = [
  { id: uid(), asset: 'BTC',  buyPrice: 30000, sellPrice: 65000, amount: 0.5,  holdDays: 400 },
  { id: uid(), asset: 'ETH',  buyPrice: 1500,  sellPrice: 3200,  amount: 5,    holdDays: 200 },
  { id: uid(), asset: 'SOL',  buyPrice: 20,    sellPrice: 150,   amount: 100,  holdDays: 90  },
  { id: uid(), asset: 'DOGE', buyPrice: 0.08,  sellPrice: 0.06,  amount: 5000, holdDays: 30  },
]

export function CryptoTaxClient() {
  const tool = getToolBySlug('crypto-tax-calculator')!

  const [trades,       setTrades]       = useState<Trade[]>(DEFAULT_TRADES)
  const [bracketIdx,   setBracketIdx]   = useState(0)
  const [customShort,  setCustomShort]  = useState('30')
  const [customLong,   setCustomLong]   = useState('15')
  const [ltThreshold,  setLtThreshold]  = useState('365') // days for long-term

  const bracket    = TAX_BRACKETS[bracketIdx]
  const shortRate  = bracketIdx === TAX_BRACKETS.length - 1 ? parseFloat(customShort) || 0 : bracket.short
  const longRate   = bracketIdx === TAX_BRACKETS.length - 1 ? parseFloat(customLong)  || 0 : bracket.long
  const ltDays     = parseInt(ltThreshold) || 365

  const tradeResults = useMemo(() =>
    trades.map(t => {
      const bp  = Number(t.buyPrice)  || 0
      const sp  = Number(t.sellPrice) || 0
      const amt = Number(t.amount)    || 0
      const hd  = Number(t.holdDays)  || 0

      const costBasis  = bp * amt
      const proceeds   = sp * amt
      const gain       = proceeds - costBasis
      const isLongTerm = hd >= ltDays
      const taxRate    = isLongTerm ? longRate : shortRate
      const taxOwed    = gain > 0 ? gain * (taxRate / 100) : 0
      const netProfit  = gain - taxOwed

      return { ...t, costBasis, proceeds, gain, isLongTerm, taxRate, taxOwed, netProfit, roi: costBasis > 0 ? (gain / costBasis) * 100 : 0 }
    }),
  [trades, shortRate, longRate, ltDays])

  const totals = useMemo(() => ({
    costBasis:  tradeResults.reduce((s, r) => s + r.costBasis, 0),
    proceeds:   tradeResults.reduce((s, r) => s + r.proceeds, 0),
    gain:       tradeResults.reduce((s, r) => s + r.gain, 0),
    taxOwed:    tradeResults.reduce((s, r) => s + r.taxOwed, 0),
    netProfit:  tradeResults.reduce((s, r) => s + r.netProfit, 0),
    shortTermGain: tradeResults.filter(r => !r.isLongTerm).reduce((s, r) => s + Math.max(0, r.gain), 0),
    longTermGain:  tradeResults.filter(r =>  r.isLongTerm).reduce((s, r) => s + Math.max(0, r.gain), 0),
    losses:     tradeResults.reduce((s, r) => s + Math.min(0, r.gain), 0),
  }), [tradeResults])

  const addRow = () => setTrades(p => [...p, { id: uid(), asset: 'TOKEN', buyPrice: '', sellPrice: '', amount: '', holdDays: '' }])
  const removeRow = (id: string) => setTrades(p => p.filter(r => r.id !== id))
  const update = (id: string, field: keyof Trade, val: string) =>
    setTrades(p => p.map(r => r.id === id ? { ...r, [field]: field === 'asset' ? val : (val === '' ? '' : Number(val)) } : r))

  const reset = () => { setTrades(DEFAULT_TRADES); setBracketIdx(0) }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* Tax bracket */}
        <ToolSection title="Tax Jurisdiction" description="Select your country or enter custom tax rates">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {TAX_BRACKETS.map((b, i) => (
              <button key={b.label} onClick={() => setBracketIdx(i)}
                className={`flex flex-col items-start px-3 py-3 rounded-xl border text-left transition-all cursor-pointer
                  ${bracketIdx === i ? 'bg-black text-white border-black' : 'border-[var(--border)] hover:border-zinc-400'}`}>
                <span className="text-xs font-semibold">{b.label}</span>
                {i < TAX_BRACKETS.length - 1 && (
                  <span className={`text-[10px] mt-1 font-mono ${bracketIdx === i ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    S:{b.short}% L:{b.long}%
                  </span>
                )}
              </button>
            ))}
          </div>
          {bracketIdx === TAX_BRACKETS.length - 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputGroup label="Short-term Rate (%)">
                <input type="number" value={customShort} onChange={e => setCustomShort(e.target.value)} className="tool-input font-mono" step="0.5" />
              </InputGroup>
              <InputGroup label="Long-term Rate (%)">
                <input type="number" value={customLong} onChange={e => setCustomLong(e.target.value)} className="tool-input font-mono" step="0.5" />
              </InputGroup>
              <InputGroup label="Long-term Threshold (Days)">
                <input type="number" value={ltThreshold} onChange={e => setLtThreshold(e.target.value)} className="tool-input font-mono" />
              </InputGroup>
            </div>
          )}
        </ToolSection>

        {/* Trades table */}
        <ToolSection title="Trades" description="Enter your buy/sell trades for tax estimation">
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_1fr_100px_36px] gap-2 px-1">
              {['Asset', 'Buy Price', 'Sell Price', 'Amount', 'Hold (days)', ''].map(h => (
                <span key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {trades.map((t) => (
              <div key={t.id} className="grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_1fr_100px_36px] gap-2 p-3 rounded-lg border border-[var(--border)] items-center hover:border-zinc-300 transition-colors">
                <input type="text" value={t.asset} onChange={e => update(t.id, 'asset', e.target.value)}
                  className="tool-input text-sm font-bold uppercase" placeholder="BTC" />
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={t.buyPrice} onChange={e => update(t.id, 'buyPrice', e.target.value)}
                    className="tool-input pl-7 font-mono text-sm" placeholder="Buy price" step="any" /></div>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={t.sellPrice} onChange={e => update(t.id, 'sellPrice', e.target.value)}
                    className="tool-input pl-7 font-mono text-sm" placeholder="Sell price" step="any" /></div>
                <input type="number" value={t.amount} onChange={e => update(t.id, 'amount', e.target.value)}
                  className="tool-input font-mono text-sm" placeholder="Qty" step="any" />
                <input type="number" value={t.holdDays} onChange={e => update(t.id, 'holdDays', e.target.value)}
                  className="tool-input font-mono text-sm text-center" placeholder="Days" />
                <button onClick={() => removeRow(t.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={addRow} className="btn-secondary text-xs gap-1.5 mt-1">
              <Plus size={12} /> Add Trade
            </button>
          </div>
        </ToolSection>

        {/* Results */}
        {tradeResults.length > 0 && (
          <>
            {/* Hero tax summary */}
            <div className="p-6 rounded-xl border-2 border-black bg-black text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Estimated Tax Owed</p>
                  <p className="text-5xl font-bold font-mono">{fmt$(totals.taxOwed)}</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    on {fmt$(Math.max(0, totals.gain))} total gains
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-1">Net After Tax</p>
                  <p className="text-2xl font-bold font-mono">{fmt$(totals.netProfit)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div><p className="text-xs text-zinc-400 mb-0.5">Short-term Rate</p><p className="text-lg font-bold font-mono">{fmtPct(shortRate)}</p></div>
                <div><p className="text-xs text-zinc-400 mb-0.5">Long-term Rate</p><p className="text-lg font-bold font-mono">{fmtPct(longRate)}</p></div>
                <div><p className="text-xs text-zinc-400 mb-0.5">ST Gains</p><p className="text-lg font-bold font-mono">{fmt$(totals.shortTermGain)}</p></div>
                <div><p className="text-xs text-zinc-400 mb-0.5">LT Gains</p><p className="text-lg font-bold font-mono">{fmt$(totals.longTermGain)}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="Gains Summary" items={[
                { label: 'Total Cost Basis',    value: fmt$(totals.costBasis) },
                { label: 'Total Proceeds',      value: fmt$(totals.proceeds) },
                { label: 'Short-term Gains',    value: fmt$(totals.shortTermGain) },
                { label: 'Long-term Gains',     value: fmt$(totals.longTermGain) },
                { label: 'Capital Losses',      value: '-' + fmt$(Math.abs(totals.losses)) },
                { label: 'Net Gain',            value: fmt$(totals.gain), highlight: true },
              ]} />
              <InfoCard title="Tax Breakdown" items={[
                { label: 'Gross Profit',        value: fmt$(totals.gain) },
                { label: 'Tax @ ST Rate',       value: fmt$(totals.shortTermGain * shortRate / 100) },
                { label: 'Tax @ LT Rate',       value: fmt$(totals.longTermGain * longRate / 100) },
                { label: 'Total Tax Owed',      value: fmt$(totals.taxOwed), highlight: true },
                { label: 'Effective Tax Rate',  value: totals.gain > 0 ? fmtPct((totals.taxOwed / totals.gain) * 100) : '—' },
                { label: 'Net After Tax',       value: fmt$(totals.netProfit) },
              ]} />
            </div>

            {/* Per-trade breakdown */}
            <ToolSection title="Per-Trade Tax Breakdown">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Asset', 'Hold', 'Type', 'Cost Basis', 'Proceeds', 'Gain/Loss', 'Tax Rate', 'Tax Owed', 'Net Profit'].map(h => (
                        <th key={h} className="text-left py-3 pr-3 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tradeResults.map(row => (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 pr-3 font-bold text-black">{row.asset}</td>
                        <td className="py-3 pr-3 font-mono text-xs text-zinc-500">{Number(row.holdDays)}d</td>
                        <td className="py-3 pr-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                            ${row.isLongTerm ? 'bg-zinc-100 text-zinc-600' : 'bg-black text-white'}`}>
                            {row.isLongTerm ? 'Long-term' : 'Short-term'}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs">{fmt$(row.costBasis)}</td>
                        <td className="py-3 pr-3 font-mono text-xs">{fmt$(row.proceeds)}</td>
                        <td className={`py-3 pr-3 font-mono font-semibold text-xs ${row.gain >= 0 ? 'text-black' : 'text-zinc-400'}`}>
                          {row.gain >= 0 ? '+' : ''}{fmt$(row.gain)}
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs text-zinc-500">{fmtPct(row.taxRate)}</td>
                        <td className="py-3 pr-3 font-mono text-xs font-semibold text-black">{fmt$(row.taxOwed)}</td>
                        <td className={`py-3 font-mono text-xs font-bold ${row.netProfit >= 0 ? 'text-black' : 'text-zinc-400'}`}>
                          {row.netProfit >= 0 ? '+' : ''}{fmt$(row.netProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-black text-white">
                      <td className="py-3 px-3 font-semibold rounded-bl-lg" colSpan={3}>Totals</td>
                      <td className="py-3 pr-3 font-mono text-xs">{fmt$(totals.costBasis)}</td>
                      <td className="py-3 pr-3 font-mono text-xs">{fmt$(totals.proceeds)}</td>
                      <td className="py-3 pr-3 font-mono font-bold text-sm">{totals.gain >= 0 ? '+' : ''}{fmt$(totals.gain)}</td>
                      <td className="py-3 pr-3 text-zinc-400 text-xs">—</td>
                      <td className="py-3 pr-3 font-mono font-bold text-sm">{fmt$(totals.taxOwed)}</td>
                      <td className="py-3 font-mono font-bold text-sm rounded-br-lg">{fmt$(totals.netProfit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </ToolSection>
          </>
        )}

        <div className="p-3 rounded-lg border border-[var(--border)] flex items-start gap-2 text-xs text-zinc-600">
          <Info size={13} className="shrink-0 mt-0.5 text-zinc-400" />
          This tool provides estimates only. Tax laws vary by jurisdiction and change frequently. Always consult a qualified tax professional for accurate advice.
        </div>

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}