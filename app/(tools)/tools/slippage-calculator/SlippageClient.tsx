'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, AlertTriangle, Info } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function fmt$(n:number):string {
  if(!isFinite(n)) return '—'
  if(n>=1e6) return '$'+(n/1e6).toFixed(3)+'M'
  if(n>=1e3) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return '$'+n.toFixed(4)
}
function fmtPct(n:number,dec=3):string { return n.toFixed(dec)+'%' }

// Constant product AMM (x*y=k)
function calcSlippage(tradeSize:number, poolLiquidity:number):{priceImpact:number, effectivePrice:number, received:number} {
  if(!poolLiquidity || !tradeSize) return {priceImpact:0, effectivePrice:0, received:0}
  // x*y=k, trade dx → dy = y*dx/(x+dx)
  // price impact = dx/(x+dx)
  const x = poolLiquidity / 2  // simplified: each side = half of TVL
  const y = poolLiquidity / 2
  const dy = y * tradeSize / (x + tradeSize)
  const midPrice = y / x
  const effectivePrice = dy / tradeSize  // output per input unit
  const priceImpact = (1 - effectivePrice / midPrice) * 100
  return { priceImpact, effectivePrice, received: dy }
}

const TRADE_SIZES = [100,500,1000,5000,10000,25000,50000,100000,250000,500000]
const RISK_LEVEL = (pi:number) => {
  if(pi < 0.1) return {label:'Minimal',   color:'text-zinc-500'}
  if(pi < 0.5) return {label:'Low',       color:'text-zinc-600'}
  if(pi < 1)   return {label:'Moderate',  color:'text-zinc-700'}
  if(pi < 3)   return {label:'High',      color:'text-black font-bold'}
  return              {label:'Extreme',   color:'text-black font-bold'}
}

export function SlippageClient() {
  const tool = getToolBySlug('slippage-calculator')!

  const [tradeSizeRaw,   setTradeSizeRaw]   = useState('10000')
  const [poolLiqRaw,     setPoolLiqRaw]     = useState('1000000')
  const [slippageTol,    setSlippageTol]    = useState('0.5')
  const [tokenPrice,     setTokenPrice]     = useState('1')

  const tradeSize = parseFloat(tradeSizeRaw.replace(/,/g,'')) || 0
  const poolLiq   = parseFloat(poolLiqRaw.replace(/,/g,''))   || 0
  const tolerance = parseFloat(slippageTol)                    || 0.5
  const tPrice    = parseFloat(tokenPrice)                     || 1

  const result = useMemo(() => calcSlippage(tradeSize, poolLiq), [tradeSize, poolLiq])

  // Max trade size within tolerance
  const maxTradeInTolerance = useMemo(() => {
    if(!poolLiq || !tolerance) return 0
    // priceImpact = tradeSize / (poolLiq/2 + tradeSize) * 100 ≈ tolerance/100
    // solve: t = (poolLiq/2) * (tol/100) / (1 - tol/100)
    const tol = tolerance / 100
    return (poolLiq / 2) * tol / (1 - tol)
  }, [poolLiq, tolerance])

  // Comparison across trade sizes
  const comparison = useMemo(() =>
    TRADE_SIZES.map(size => {
      const r = calcSlippage(size, poolLiq)
      return { size, ...r, withinTol: r.priceImpact <= tolerance }
    }),
  [poolLiq, tolerance])

  const risk = RISK_LEVEL(result.priceImpact)

  // USD impact
  const slippageCostUsd = tradeSize * (result.priceImpact / 100)

  const reset = () => {
    setTradeSizeRaw('10000'); setPoolLiqRaw('1000000'); setSlippageTol('0.5'); setTokenPrice('1')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Trade Configuration">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Trade Size (USD)" hint="Value of tokens you want to swap">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="text" value={tradeSizeRaw} onChange={e=>setTradeSizeRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$1K','1000'],['$5K','5000'],['$10K','10000'],['$50K','50000'],['$100K','100000'],['$500K','500000']].map(([l,v])=>(
                  <button key={v} onClick={()=>setTradeSizeRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${tradeSizeRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Pool Liquidity / TVL (USD)" hint="Total value locked in the pool">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="text" value={poolLiqRaw} onChange={e=>setPoolLiqRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$100K','100000'],['$500K','500000'],['$1M','1000000'],['$5M','5000000'],['$10M','10000000'],['$100M','100000000']].map(([l,v])=>(
                  <button key={v} onClick={()=>setPoolLiqRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${poolLiqRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Slippage Tolerance (%)" hint="Max acceptable slippage for your trade">
              <input type="number" value={slippageTol} onChange={e=>setSlippageTol(e.target.value)} className="tool-input font-mono" step="0.1" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0.1','0.3','0.5','1','2','3','5'].map(v=>(
                  <button key={v} onClick={()=>setSlippageTol(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${slippageTol===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Token Price (USD)" hint="Used to show output in tokens">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={tokenPrice} onChange={e=>setTokenPrice(e.target.value)} className="tool-input pl-7 font-mono" step="any" /></div>
            </InputGroup>
          </div>
        </ToolSection>

        {tradeSize > 0 && poolLiq > 0 && (
          <>
            {/* Hero */}
            <div className={`p-6 rounded-xl border-2 ${result.priceImpact > 3 ? 'border-black bg-black text-white' : 'border-[var(--border)]'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${result.priceImpact > 3 ? 'text-zinc-400' : 'text-zinc-500'}`}>Price Impact</p>
                  <p className="text-5xl font-bold font-mono">{fmtPct(result.priceImpact)}</p>
                  <p className={`text-sm mt-1 ${result.priceImpact > 3 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    ≈ {fmt$(slippageCostUsd)} slippage cost
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${
                  result.priceImpact > 3 ? 'bg-white/15 border-white/20 text-white' :
                  result.priceImpact > 1 ? 'bg-zinc-100 border-zinc-300 text-zinc-800' :
                  'bg-zinc-50 border-[var(--border)] text-zinc-600'
                }`}>{risk.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/10">
                {[
                  { l: 'Trade Size',        v: fmt$(tradeSize) },
                  { l: 'Within Tolerance',  v: result.priceImpact <= tolerance ? '✓ Yes' : '✗ No' },
                  { l: 'Max Trade (tol)',   v: fmt$(maxTradeInTolerance) },
                ].map(m => (
                  <div key={m.l}>
                    <p className={`text-xs mb-0.5 ${result.priceImpact > 3 ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.l}</p>
                    <p className="text-sm font-bold font-mono">{m.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {result.priceImpact > 2 && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-zinc-300 bg-zinc-50">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-zinc-600" />
                <div>
                  <p className="text-sm font-semibold text-black">High Price Impact Warning</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Your trade ({fmt$(tradeSize)}) is large relative to pool liquidity ({fmt$(poolLiq)}). Consider splitting into smaller trades or using a DEX aggregator to reduce impact.
                    Max trade within {tolerance}% tolerance: <strong>{fmt$(maxTradeInTolerance)}</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="Trade Details" items={[
                { label: 'Trade Size',        value: fmt$(tradeSize) },
                { label: 'Pool TVL',          value: fmt$(poolLiq) },
                { label: 'Trade / Pool %',    value: fmtPct((tradeSize/poolLiq)*100, 2) },
                { label: 'Price Impact',      value: fmtPct(result.priceImpact), highlight: true },
              ]} />
              <InfoCard title="Slippage Analysis" items={[
                { label: 'Slippage Tolerance', value: fmtPct(tolerance) },
                { label: 'Within Tolerance',   value: result.priceImpact <= tolerance ? 'Yes ✓' : 'No ✗' },
                { label: 'Slippage Cost',       value: fmt$(slippageCostUsd) },
                { label: 'Max Safe Trade',      value: fmt$(maxTradeInTolerance), highlight: true },
              ]} />
            </div>

            {/* Comparison table */}
            <ToolSection title="Slippage at Different Trade Sizes" description={`Based on pool TVL of ${fmt$(poolLiq)}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Trade Size','% of Pool','Price Impact','Slippage Cost','Status'].map(h=>(
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map(row=>{
                      const r = RISK_LEVEL(row.priceImpact)
                      const isCurrent = row.size === tradeSize
                      return (
                        <tr key={row.size} className={`border-b border-[var(--border)] last:border-0 transition-colors ${isCurrent?'bg-zinc-50':'hover:bg-zinc-50'}`}>
                          <td className="py-2.5 pr-4 font-mono font-semibold text-black">{fmt$(row.size)}
                            {isCurrent&&<span className="ml-1.5 badge-default text-[9px]">current</span>}
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-zinc-500 text-xs">{fmtPct((row.size/poolLiq)*100,2)}</td>
                          <td className={`py-2.5 pr-4 font-mono font-bold ${r.color}`}>{fmtPct(row.priceImpact)}</td>
                          <td className="py-2.5 pr-4 font-mono text-zinc-600 text-xs">{fmt$(row.size*(row.priceImpact/100))}</td>
                          <td className="py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                              ${row.withinTol?'bg-zinc-100 text-zinc-600':'bg-black text-white'}`}>
                              {row.withinTol ? 'Within tol.' : 'Exceeds tol.'}
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

        <div className="p-3 rounded-lg border border-[var(--border)] flex items-start gap-2 text-xs text-zinc-600">
          <Info size={13} className="shrink-0 mt-0.5 text-zinc-400" />
          This uses the constant product AMM formula (x*y=k) as a simplified model. Concentrated liquidity pools (Uniswap V3) and stablecoin AMMs (Curve) will have different slippage profiles.
        </div>

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}