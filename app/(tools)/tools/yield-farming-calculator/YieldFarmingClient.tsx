'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Info } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function fmt$(n:number):string {
  if(!isFinite(n)) return '—'
  if(n>=1e6) return '$'+(n/1e6).toFixed(3)+'M'
  if(n>=1e3) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return '$'+n.toFixed(2)
}
function fmtPct(n:number,dec=2):string { return (n>=0?'+':'')+n.toFixed(dec)+'%' }

const PERIODS = [
  {label:'1 Week', days:7},{label:'1 Month',days:30},{label:'3 Months',days:90},
  {label:'6 Months',days:180},{label:'1 Year',days:365},{label:'2 Years',days:730},
]

export function YieldFarmingClient() {
  const tool = getToolBySlug('yield-farming-calculator')!

  const [depositRaw,   setDepositRaw]   = useState('10000')
  const [farmApyRaw,   setFarmApyRaw]   = useState('80')
  const [ilRaw,        setIlRaw]        = useState('5')
  const [gasEntryRaw,  setGasEntryRaw]  = useState('20')
  const [gasExitRaw,   setGasExitRaw]   = useState('20')
  const [gasCompRaw,   setGasCompRaw]   = useState('5')
  const [compFreqRaw,  setCompFreqRaw]  = useState('7')   // compound every N days
  const [daysRaw,      setDaysRaw]      = useState('30')

  const deposit  = parseFloat(depositRaw)  || 0
  const farmApy  = parseFloat(farmApyRaw)  || 0
  const ilPct    = parseFloat(ilRaw)       || 0
  const gasEntry = parseFloat(gasEntryRaw) || 0
  const gasExit  = parseFloat(gasExitRaw)  || 0
  const gasComp  = parseFloat(gasCompRaw)  || 0
  const compFreq = parseInt(compFreqRaw)   || 7
  const days     = parseInt(daysRaw)       || 30

  const results = useMemo(() => {
    if (!deposit) return null
    const years = days / 365

    // Gross yield (compound)
    const grossYield = deposit * (Math.pow(1 + farmApy / 100, years) - 1)

    // Number of compound actions
    const compoundActions = Math.floor(days / compFreq)
    const totalGasCost = gasEntry + gasExit + compoundActions * gasComp

    // IL cost
    const ilCost = deposit * (ilPct / 100)

    // Net profit
    const netProfit = grossYield - totalGasCost - ilCost

    // ROI
    const roi = (netProfit / deposit) * 100

    // Break-even days: when net profit > 0
    // Solve: deposit*(e^(apy/100*t/365)-1) - gasEntry - gasExit - floor(t/compFreq)*gasComp - deposit*il/100 = 0
    // Approximate numerically
    let breakEven = Infinity
    for (let t = 1; t <= 3650; t++) {
      const y = deposit * (Math.pow(1 + farmApy / 100, t / 365) - 1)
      const g = gasEntry + gasExit + Math.floor(t / compFreq) * gasComp
      const il = deposit * (ilPct / 100)
      if (y - g - il > 0) { breakEven = t; break }
    }

    // Daily earning (net)
    const dailyGross = deposit * (Math.pow(1 + farmApy / 100, 1 / 365) - 1)
    const dailyGasDrag = gasComp / compFreq

    return { grossYield, totalGasCost, ilCost, netProfit, roi, breakEven, dailyGross, dailyGasDrag, compoundActions }
  }, [deposit, farmApy, ilPct, gasEntry, gasExit, gasComp, compFreq, days])

  const timeline = useMemo(() =>
    PERIODS.map(p => {
      const years = p.days / 365
      const gross = deposit * (Math.pow(1 + farmApy / 100, years) - 1)
      const gas   = gasEntry + gasExit + Math.floor(p.days / compFreq) * gasComp
      const il    = deposit * (ilPct / 100)
      const net   = gross - gas - il
      return { ...p, gross, gas, il, net, roi: deposit > 0 ? (net / deposit) * 100 : 0 }
    }),
  [deposit, farmApy, ilPct, gasEntry, gasExit, gasComp, compFreq])

  const reset = () => {
    setDepositRaw('10000'); setFarmApyRaw('80'); setIlRaw('5')
    setGasEntryRaw('20'); setGasExitRaw('20'); setGasCompRaw('5')
    setCompFreqRaw('7'); setDaysRaw('30')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Farm Configuration">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Initial Deposit (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={depositRaw} onChange={e=>setDepositRaw(e.target.value)} className="tool-input pl-7 font-mono" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['1000','5000','10000','50000','100000'].map(v=>(
                  <button key={v} onClick={()=>setDepositRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${depositRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    ${parseInt(v).toLocaleString()}
                  </button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Farm APY (%)" hint="Gross annual yield including token rewards">
              <input type="number" value={farmApyRaw} onChange={e=>setFarmApyRaw(e.target.value)} className="tool-input font-mono" step="1" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['20','50','80','100','200','500'].map(v=>(
                  <button key={v} onClick={()=>setFarmApyRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${farmApyRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Expected Impermanent Loss (%)" hint="Estimated IL for your token pair">
              <input type="number" value={ilRaw} onChange={e=>setIlRaw(e.target.value)} className="tool-input font-mono" step="0.5" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','1','2','5','10','15','20'].map(v=>(
                  <button key={v} onClick={()=>setIlRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${ilRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Compound Every (Days)" hint="How often you harvest and reinvest rewards">
              <input type="number" value={compFreqRaw} onChange={e=>setCompFreqRaw(e.target.value)} className="tool-input font-mono" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['Daily','1'],['Weekly','7'],['Bi-wk','14'],['Monthly','30']].map(([l,v])=>(
                  <button key={v} onClick={()=>setCompFreqRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${compFreqRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>
          </div>
        </ToolSection>

        <ToolSection title="Gas Costs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputGroup label="Entry Gas (USD)"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" value={gasEntryRaw} onChange={e=>setGasEntryRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div></InputGroup>
            <InputGroup label="Exit Gas (USD)"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" value={gasExitRaw} onChange={e=>setGasExitRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div></InputGroup>
            <InputGroup label="Compound Gas (USD)" hint="Per compound action"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span><input type="number" value={gasCompRaw} onChange={e=>setGasCompRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div></InputGroup>
          </div>
        </ToolSection>

        <ToolSection title="Duration">
          <InputGroup label="Farming Duration (Days)">
            <input type="number" value={daysRaw} onChange={e=>setDaysRaw(e.target.value)} className="tool-input font-mono" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[['7d','7'],['30d','30'],['90d','90'],['180d','180'],['1yr','365']].map(([l,v])=>(
                <button key={v} onClick={()=>setDaysRaw(v)}
                  className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                    ${daysRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
              ))}
            </div>
          </InputGroup>
        </ToolSection>

        {results && (
          <>
            <div className={`p-6 rounded-xl border-2 ${results.netProfit >= 0 ? 'border-black bg-black text-white' : 'border-zinc-400 bg-zinc-100'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${results.netProfit >= 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>Net Profit after {daysRaw} days</p>
                  <p className="text-4xl font-bold font-mono">{results.netProfit >= 0 ? '+' : ''}{fmt$(results.netProfit)}</p>
                  <p className={`text-sm mt-1 ${results.netProfit >= 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>{fmtPct(results.roi)} ROI</p>
                </div>
                <div className={`text-right ${results.netProfit >= 0 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  <p className="text-xs mb-1">Break-even</p>
                  <p className="text-xl font-bold font-mono">{results.breakEven === Infinity ? '∞' : results.breakEven + 'd'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                {[
                  { l: 'Gross Yield',    v: '+' + fmt$(results.grossYield) },
                  { l: 'Gas Costs',      v: '-' + fmt$(results.totalGasCost) },
                  { l: 'IL Cost',        v: '-' + fmt$(results.ilCost) },
                  { l: 'Compounds',      v: results.compoundActions + '×' },
                ].map(m => (
                  <div key={m.l}>
                    <p className={`text-xs mb-0.5 ${results.netProfit >= 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.l}</p>
                    <p className="text-base font-bold font-mono">{m.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <ToolSection title="Profit Breakdown Timeline">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Period','Gross Yield','Gas Cost','IL Cost','Net Profit','ROI'].map(h=>(
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map(row=>{
                      const isCurrent = Math.abs(row.days - days) < 1
                      return (
                        <tr key={row.label} className={`border-b border-[var(--border)] last:border-0 ${isCurrent?'bg-zinc-50':'hover:bg-zinc-50'}`}>
                          <td className="py-3 pr-4 font-medium">{row.label}{isCurrent&&<span className="ml-1.5 badge-default text-[9px]">now</span>}</td>
                          <td className="py-3 pr-4 font-mono text-xs">+{fmt$(row.gross)}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-zinc-500">-{fmt$(row.gas)}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-zinc-500">-{fmt$(row.il)}</td>
                          <td className={`py-3 pr-4 font-mono font-bold ${row.net>=0?'text-black':'text-zinc-400'}`}>{row.net>=0?'+':''}{fmt$(row.net)}</td>
                          <td className={`py-3 font-mono font-bold text-xs ${row.roi>=0?'text-black':'text-zinc-400'}`}>{fmtPct(row.roi)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ToolSection>
          </>
        )}

        <div className="p-3 rounded-lg border border-[var(--border)] flex items-start gap-2 text-xs text-zinc-600">
          <Info size={13} className="shrink-0 mt-0.5 text-zinc-400" />
          Farm APYs are volatile and can change dramatically. This model assumes constant APY — real returns will vary. Always account for token price changes, farm emissions decay, and liquidity exit costs.
        </div>

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}