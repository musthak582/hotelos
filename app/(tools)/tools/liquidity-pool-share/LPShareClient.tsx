'use client'
import { useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function fmt$(n:number):string {
  if(!isFinite(n)||!n) return '$0'
  if(n>=1e6) return '$'+(n/1e6).toFixed(3)+'M'
  if(n>=1e3) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return '$'+n.toFixed(4)
}
function fmtPct(n:number,dec=4):string { return n.toFixed(dec)+'%' }

const FEE_TIERS = [{label:'0.01%',val:0.0001},{label:'0.05%',val:0.0005},{label:'0.3%',val:0.003},{label:'1%',val:0.01}]
const VOLUME_PERIODS = [{label:'1 Day',days:1},{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'90 Days',days:90},{label:'1 Year',days:365}]

export function LPShareClient() {
  const tool = getToolBySlug('liquidity-pool-share')!
  const [depositRaw,  setDepositRaw]  = useState('10000')
  const [poolTvlRaw,  setPoolTvlRaw]  = useState('5000000')
  const [dailyVolRaw, setDailyVolRaw] = useState('500000')
  const [feeTierIdx,  setFeeTierIdx]  = useState(2)
  const [tokenARaw,   setTokenARaw]   = useState('5000')
  const [tokenBRaw,   setTokenBRaw]   = useState('5000')

  const deposit   = parseFloat(depositRaw.replace(/,/g,''))  || 0
  const poolTvl   = parseFloat(poolTvlRaw.replace(/,/g,''))  || 0
  const dailyVol  = parseFloat(dailyVolRaw.replace(/,/g,'')) || 0
  const feeTier   = FEE_TIERS[feeTierIdx].val
  const tokenA    = parseFloat(tokenARaw) || 0
  const tokenB    = parseFloat(tokenBRaw) || 0

  const poolShare     = poolTvl > 0 ? (deposit / poolTvl) * 100 : 0
  const dailyFees     = dailyVol * feeTier
  const myDailyFees   = dailyFees * (deposit / poolTvl)
  const annualFeeApr  = deposit > 0 ? (myDailyFees * 365 / deposit) * 100 : 0

  const feePeriods = VOLUME_PERIODS.map(p=>({
    ...p,
    poolFees: dailyFees * p.days,
    myFees:   myDailyFees * p.days,
  }))

  const reset = () => { setDepositRaw('10000'); setPoolTvlRaw('5000000'); setDailyVolRaw('500000'); setFeeTierIdx(2) }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Pool Configuration">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Your Deposit (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="text" value={depositRaw} onChange={e=>setDepositRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$1K','1000'],['$5K','5000'],['$10K','10000'],['$50K','50000'],['$100K','100000']].map(([l,v])=>(
                  <button key={v} onClick={()=>setDepositRaw(v)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${depositRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Pool TVL (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="text" value={poolTvlRaw} onChange={e=>setPoolTvlRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['$100K','100000'],['$1M','1000000'],['$5M','5000000'],['$10M','10000000'],['$100M','100000000']].map(([l,v])=>(
                  <button key={v} onClick={()=>setPoolTvlRaw(v)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${poolTvlRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Daily Trading Volume (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="text" value={dailyVolRaw} onChange={e=>setDailyVolRaw(e.target.value)} className="tool-input pl-7 font-mono" /></div>
            </InputGroup>
            <InputGroup label="Fee Tier">
              <div className="grid grid-cols-4 gap-2">
                {FEE_TIERS.map((f,i)=>(
                  <button key={f.label} onClick={()=>setFeeTierIdx(i)} className={`py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${feeTierIdx===i?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{f.label}</button>
                ))}
              </div>
            </InputGroup>
          </div>
        </ToolSection>

        {deposit > 0 && poolTvl > 0 && (
          <>
            <div className="p-6 rounded-xl border-2 border-black bg-black text-white">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Your Pool Share</p>
              <p className="text-5xl font-bold font-mono">{fmtPct(poolShare)}</p>
              <p className="text-sm text-zinc-400 mt-1">{fmt$(deposit)} of {fmt$(poolTvl)} TVL</p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 mt-4">
                <div><p className="text-xs text-zinc-400 mb-0.5">Daily Fees</p><p className="text-lg font-bold font-mono">{fmt$(myDailyFees)}</p></div>
                <div><p className="text-xs text-zinc-400 mb-0.5">Monthly Fees</p><p className="text-lg font-bold font-mono">{fmt$(myDailyFees*30)}</p></div>
                <div><p className="text-xs text-zinc-400 mb-0.5">Fee APR</p><p className="text-lg font-bold font-mono">{fmtPct(annualFeeApr,2)}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="Pool Share Details" items={[
                {label:'Your Deposit',   value: fmt$(deposit)},
                {label:'Pool TVL',       value: fmt$(poolTvl)},
                {label:'Pool Share',     value: fmtPct(poolShare), highlight: true},
                {label:'Fee Tier',       value: FEE_TIERS[feeTierIdx].label},
              ]}/>
              <InfoCard title="Fee Earnings" items={[
                {label:'Daily Volume',    value: fmt$(dailyVol)},
                {label:'Pool Daily Fees', value: fmt$(dailyFees)},
                {label:'Your Daily Fees', value: fmt$(myDailyFees)},
                {label:'Fee APR',         value: fmtPct(annualFeeApr,2), highlight: true},
              ]}/>
            </div>

            <ToolSection title="Fee Earnings Over Time">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Period','Pool Fees','Your Fees','Cumulative APR'].map(h=>(
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feePeriods.map(row=>(
                      <tr key={row.label} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50">
                        <td className="py-3 pr-4 font-medium">{row.label}</td>
                        <td className="py-3 pr-4 font-mono">{fmt$(row.poolFees)}</td>
                        <td className="py-3 pr-4 font-mono font-semibold text-black">{fmt$(row.myFees)}</td>
                        <td className="py-3 font-mono">{fmtPct(deposit>0?(row.myFees/deposit/row.days*365)*100:0,2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ToolSection>
          </>
        )}

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12}/>Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}