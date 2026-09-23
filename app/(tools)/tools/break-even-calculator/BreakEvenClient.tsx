'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Target } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { CopyButton } from '@/components/shared/CopyButton'
import { getToolBySlug } from '@/lib/tools-registry'

type Side = 'long' | 'short'

function fmtPrice(n:number):string {
  if(!n||!isFinite(n)) return '—'
  if(n>=1000) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  if(n>=1) return '$'+n.toFixed(4)
  if(n>=0.01) return '$'+n.toFixed(6)
  return '$'+n.toExponential(4)
}
function fmt$(n:number):string {
  if(!isFinite(n)) return '—'
  if(n>=1e3) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return '$'+n.toFixed(2)
}
function fmtPct(n:number):string { return n.toFixed(4)+'%' }

export function BreakEvenClient() {
  const tool = getToolBySlug('break-even-calculator')!

  const [side,       setSide]       = useState<Side>('long')
  const [entryRaw,   setEntryRaw]   = useState('1.00')
  const [amountRaw,  setAmountRaw]  = useState('1000')
  const [tradeFee,   setTradeFee]   = useState('0.1')
  const [gasCost,    setGasCost]    = useState('5')
  const [taxRaw,     setTaxRaw]     = useState('0')
  const [currentRaw, setCurrentRaw] = useState('1.20')

  const entry   = parseFloat(entryRaw)   || 0
  const amount  = parseFloat(amountRaw)  || 0
  const fee     = parseFloat(tradeFee)   / 100 || 0
  const gas     = parseFloat(gasCost)    || 0
  const tax     = parseFloat(taxRaw)     / 100 || 0
  const current = parseFloat(currentRaw) || 0

  const results = useMemo(() => {
    if (!entry || !amount) return null
    const tokens  = amount / entry
    const entryFee = amount * fee
    const totalCost = amount + entryFee + gas

    // For a long: need exit value * (1 - exitFee) * (1 - tax) >= totalCost
    // exitValue = tokens * exitPrice
    // tokens * exitPrice * (1-fee) * (1-tax) = totalCost
    // exitPrice = totalCost / (tokens * (1-fee) * (1-tax))
    let breakEvenPrice: number
    if (side === 'long') {
      breakEvenPrice = totalCost / (tokens * (1 - fee) * (1 - tax))
    } else {
      // Short: profit when price drops. Need: (entry - exitPrice) * tokens * (1-fee) * (1-tax) >= fees+gas
      // entry * tokens * (1-fee) * (1-tax) - exitPrice * tokens * (1-fee) * (1-tax) = totalCost - amount + fee*amount
      // This simplifies similarly
      breakEvenPrice = entry - (entryFee + gas) / (tokens * (1 - fee) * (1 - tax))
    }

    // P&L at current price
    let pnl: number
    if (side === 'long') {
      const exitValue = tokens * current * (1 - fee) * (1 - tax)
      pnl = exitValue - totalCost
    } else {
      const exitValue = tokens * current * (1 - fee) * (1 - tax)
      pnl = (amount - entryFee) - exitValue - gas
    }

    const pnlPct   = (pnl / amount) * 100
    const bePct    = ((breakEvenPrice - entry) / entry) * 100
    const totalFees = entryFee * 2 + gas // entry + exit fees

    return { tokens, entryFee, totalCost, breakEvenPrice, pnl, pnlPct, bePct, totalFees }
  }, [entry, amount, fee, gas, tax, current, side])

  // Multiple target scenarios
  const targets = useMemo(() => {
    if (!results || !entry) return []
    return [0.5,0.75,0.9,0.95,1,1.05,1.1,1.25,1.5,2,3,5].map(mult => {
      const exitPrice = entry * mult
      const tokens = amount / entry
      let pnl: number
      if (side === 'long') {
        pnl = tokens * exitPrice * (1 - fee) * (1 - tax) - results.totalCost
      } else {
        pnl = (amount - amount * fee) - tokens * exitPrice * (1 - fee) * (1 - tax) - gas
      }
      return { mult, exitPrice, pnl, roi: (pnl / amount) * 100 }
    })
  }, [results, entry, amount, fee, tax, gas, side])

  const reset = () => {
    setSide('long'); setEntryRaw('1.00'); setAmountRaw('1000')
    setTradeFee('0.1'); setGasCost('5'); setTaxRaw('0'); setCurrentRaw('1.20')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* Long / Short toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] w-fit">
          {(['long','short'] as const).map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer capitalize
                ${side===s?'bg-black text-white':'text-zinc-600 hover:text-black'}`}>{s}</button>
          ))}
        </div>

        <ToolSection title="Trade Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Entry Price (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={entryRaw} onChange={e=>setEntryRaw(e.target.value)} className="tool-input pl-7 font-mono" step="any" /></div>
            </InputGroup>
            <InputGroup label="Position Size (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={amountRaw} onChange={e=>setAmountRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['100','500','1000','5000','10000'].map(v=>(
                  <button key={v} onClick={()=>setAmountRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${amountRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>${parseInt(v).toLocaleString()}</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Trading Fee (%)" hint="Applied on entry and exit">
              <input type="number" value={tradeFee} onChange={e=>setTradeFee(e.target.value)} className="tool-input font-mono" step="0.01" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','0.1','0.25','0.3','0.5','1'].map(v=>(
                  <button key={v} onClick={()=>setTradeFee(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${tradeFee===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Gas Cost (USD)" hint="Total gas fees for entry + exit">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={gasCost} onChange={e=>setGasCost(e.target.value)} className="tool-input pl-7 font-mono" /></div>
            </InputGroup>
            <InputGroup label="Capital Gains Tax (%)" hint="Tax on profits (optional)">
              <input type="number" value={taxRaw} onChange={e=>setTaxRaw(e.target.value)} className="tool-input font-mono" step="1" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','15','20','25','30'].map(v=>(
                  <button key={v} onClick={()=>setTaxRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${taxRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Current Price (USD)" hint="For P&L preview">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={currentRaw} onChange={e=>setCurrentRaw(e.target.value)} className="tool-input pl-7 font-mono" step="any" /></div>
            </InputGroup>
          </div>
        </ToolSection>

        {results && (
          <>
            {/* Hero break-even */}
            <div className="p-6 rounded-xl border-2 border-black bg-black text-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Break-even Price ({side})</p>
                  <p className="text-5xl font-bold font-mono">{fmtPrice(results.breakEvenPrice)}</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    {results.bePct > 0 ? '+' : ''}{results.bePct.toFixed(2)}% from entry ({fmtPrice(entry)})
                  </p>
                </div>
                <Target size={28} className="text-zinc-600 mt-1" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <CopyButton value={results.breakEvenPrice.toFixed(8)} label="Copy Price"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
                {current > 0 && (
                  <span className={`text-sm font-bold font-mono px-3 py-1.5 rounded-lg
                    ${results.pnl >= 0 ? 'bg-white text-black' : 'bg-zinc-700 text-zinc-300'}`}>
                    Current P&L: {results.pnl >= 0 ? '+' : ''}{fmt$(results.pnl)} ({results.pnlPct.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="Cost Breakdown" items={[
                { label: 'Position Size',  value: fmt$(amount) },
                { label: 'Entry Fee',      value: fmt$(results.entryFee) },
                { label: 'Gas Cost',       value: fmt$(parseFloat(gasCost)||0) },
                { label: 'Total Cost',     value: fmt$(results.totalCost), highlight: true },
              ]} />
              <InfoCard title="Break-even Details" items={[
                { label: 'Entry Price',      value: fmtPrice(entry) },
                { label: 'Break-even Price', value: fmtPrice(results.breakEvenPrice), highlight: true },
                { label: 'Move Required',    value: (results.bePct > 0 ? '+' : '') + results.bePct.toFixed(4) + '%' },
                { label: 'Total Fee Drag',   value: fmtPct((results.totalFees / amount) * 100) },
              ]} />
            </div>

            {/* Scenario table */}
            <ToolSection title="P&L at Price Targets">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Price','Multiple','P&L','ROI','Status'].map(h=>(
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map(t=>{
                      const isBE = Math.abs(t.exitPrice - results.breakEvenPrice) / results.breakEvenPrice < 0.005
                      return (
                        <tr key={t.mult} className={`border-b border-[var(--border)] last:border-0 hover:bg-zinc-50 ${isBE?'bg-zinc-50':''}`}>
                          <td className="py-2.5 pr-4 font-mono font-semibold text-black">{fmtPrice(t.exitPrice)}</td>
                          <td className="py-2.5 pr-4 font-mono text-zinc-500 text-xs">{t.mult}×</td>
                          <td className={`py-2.5 pr-4 font-mono font-bold ${t.pnl>=0?'text-black':'text-zinc-400'}`}>
                            {t.pnl>=0?'+':''}{fmt$(t.pnl)}
                          </td>
                          <td className={`py-2.5 pr-4 font-mono text-xs font-semibold ${t.roi>=0?'text-black':'text-zinc-400'}`}>
                            {t.roi>=0?'+':''}{t.roi.toFixed(2)}%
                          </td>
                          <td className="py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                              ${isBE ? 'bg-zinc-200 text-zinc-700' : t.pnl>=0 ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                              {isBE ? '⟵ Break-even' : t.pnl>=0 ? 'Profit' : 'Loss'}
                            </span>
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

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}