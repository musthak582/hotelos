'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Calendar } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { CopyButton } from '@/components/shared/CopyButton'
import { getToolBySlug } from '@/lib/tools-registry'

function fmtSupply(n:number):string {
  if(!n) return '0'
  if(n>=1e9) return (n/1e9).toFixed(3)+'B'
  if(n>=1e6) return (n/1e6).toFixed(3)+'M'
  if(n>=1e3) return (n/1e3).toFixed(3)+'K'
  return n.toLocaleString('en-US',{maximumFractionDigits:2})
}
function fmt$(n:number):string {
  if(!n) return '$0'
  if(n>=1e6) return '$'+(n/1e6).toFixed(3)+'M'
  if(n>=1e3) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return '$'+n.toFixed(2)
}

type VestType = 'linear' | 'monthly-cliff' | 'graded'

export function VestingScheduleClient() {
  const tool = getToolBySlug('vesting-schedule-calculator')!
  const [totalTokens, setTotalTokens] = useState('20000000')
  const [tgePct,      setTgePct]      = useState('10')
  const [cliffMonths, setCliffMonths] = useState('12')
  const [vestMonths,  setVestMonths]  = useState('24')
  const [tokenPrice,  setTokenPrice]  = useState('0.05')
  const [vestType,    setVestType]    = useState<VestType>('linear')
  const [startDate,   setStartDate]   = useState(() => new Date().toISOString().split('T')[0])

  const total = parseFloat(totalTokens.replace(/,/g,'')) || 0
  const tge   = parseFloat(tgePct) / 100 || 0
  const cliff = parseInt(cliffMonths) || 0
  const vest  = parseInt(vestMonths)  || 24
  const price = parseFloat(tokenPrice) || 0

  const schedule = useMemo(() => {
    if(!total) return []
    const tgeAmt = total * tge
    const remaining = total - tgeAmt
    const totalDuration = cliff + vest
    const rows = []

    for(let m=0; m<=totalDuration; m++){
      let unlockedThisMonth = 0
      let cumulativeUnlocked = 0

      if(m===0){ unlockedThisMonth = tgeAmt; cumulativeUnlocked = tgeAmt }
      else if(m <= cliff){ unlockedThisMonth = 0; cumulativeUnlocked = tgeAmt }
      else {
        const vestingMonth = m - cliff
        let cumVested:number
        if(vestType==='linear'){
          cumVested = remaining * (vestingMonth / vest)
        } else if(vestType==='monthly-cliff'){
          cumVested = remaining * (vestingMonth / vest)
          unlockedThisMonth = remaining / vest
        } else {
          // graded: earlier months get less (triangle)
          const totalWeight = vest*(vest+1)/2
          let w=0; for(let i=1;i<=vestingMonth;i++) w+=i
          cumVested = remaining * (w/totalWeight)
        }
        cumulativeUnlocked = tgeAmt + Math.min(cumVested, remaining)
        if(m>cliff) {
          const prevVestingMonth = m-1-cliff
          let prevCum:number
          if(vestType==='linear') prevCum = prevVestingMonth>0 ? remaining*(prevVestingMonth/vest) : 0
          else if(vestType==='monthly-cliff') prevCum = prevVestingMonth>0 ? remaining*(prevVestingMonth/vest) : 0
          else { let w=0; for(let i=1;i<=prevVestingMonth;i++) w+=i; prevCum = remaining*(w/(vest*(vest+1)/2)) }
          const prevTotal = tgeAmt + (prevVestingMonth>0?prevCum:0)
          unlockedThisMonth = cumulativeUnlocked - prevTotal
        }
      }

      // Date
      const d = new Date(startDate)
      d.setMonth(d.getMonth()+m)

      rows.push({
        month: m,
        date: d.toLocaleDateString('en-US',{year:'numeric',month:'short'}),
        unlocked: Math.max(0,unlockedThisMonth),
        cumulative: cumulativeUnlocked,
        pct: total > 0 ? (cumulativeUnlocked/total)*100 : 0,
        usd: cumulativeUnlocked * price,
      })
    }
    return rows
  }, [total, tge, cliff, vest, vestType, startDate, price])

  const csvExport = useMemo(()=>{
    const header = 'Month,Date,Unlocked This Month,Cumulative Unlocked,% of Total,USD Value'
    const rows = schedule.map(r=>`${r.month},${r.date},${r.unlocked.toFixed(0)},${r.cumulative.toFixed(0)},${r.pct.toFixed(2)},${r.usd.toFixed(2)}`)
    return [header,...rows].join('\n')
  },[schedule])

  const reset=()=>{ setTotalTokens('20000000'); setTgePct('10'); setCliffMonths('12'); setVestMonths('24'); setTokenPrice('0.05'); setVestType('linear') }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Vesting Parameters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Total Tokens to Vest">
              <input type="text" value={totalTokens} onChange={e=>setTotalTokens(e.target.value)} className="tool-input font-mono" />
            </InputGroup>
            <InputGroup label="Token Price (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={tokenPrice} onChange={e=>setTokenPrice(e.target.value)} className="tool-input pl-7 font-mono" step="any" /></div>
            </InputGroup>
            <InputGroup label="TGE Unlock (%)" hint="% unlocked at Token Generation Event">
              <input type="number" value={tgePct} onChange={e=>setTgePct(e.target.value)} className="tool-input font-mono" min={0} max={100} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','5','10','15','20','25'].map(v=>(
                  <button key={v} onClick={()=>setTgePct(v)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${tgePct===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Cliff Period (Months)" hint="Months before vesting begins">
              <input type="number" value={cliffMonths} onChange={e=>setCliffMonths(e.target.value)} className="tool-input font-mono" min={0} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','3','6','12','18','24'].map(v=>(
                  <button key={v} onClick={()=>setCliffMonths(v)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${cliffMonths===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}mo</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Vesting Duration (Months)" hint="Months over which tokens vest after cliff">
              <input type="number" value={vestMonths} onChange={e=>setVestMonths(e.target.value)} className="tool-input font-mono" min={1} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['12','18','24','36','48'].map(v=>(
                  <button key={v} onClick={()=>setVestMonths(v)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${vestMonths===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}mo</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Start Date (TGE Date)">
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="tool-input font-mono" />
            </InputGroup>
            <InputGroup label="Vesting Type">
              <div className="grid grid-cols-3 gap-2">
                {([['linear','Linear'],['monthly-cliff','Monthly'],['graded','Graded']] as const).map(([v,l])=>(
                  <button key={v} onClick={()=>setVestType(v)} className={`py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${vestType===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>
          </div>
        </ToolSection>

        {total > 0 && schedule.length > 0 && (
          <>
            <InfoCard title="Summary" items={[
              { label:'Total Tokens',     value: fmtSupply(total) },
              { label:'TGE Unlock',       value: fmtSupply(total*tge) + ' (' + tgePct + '%)' },
              { label:'Post-cliff Vest',  value: fmtSupply(total*(1-tge)) },
              { label:'Cliff Period',     value: cliff > 0 ? cliff + ' months' : 'None' },
              { label:'Vesting Period',   value: vest + ' months' },
              { label:'Total Duration',   value: (cliff+vest) + ' months', highlight: true },
            ]} />

            <ToolSection title="Vesting Schedule" description="Month-by-month token unlock timeline">
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-2 border-black">
                      {['Month','Date','Unlocked','Cumulative','% Total',price>0?'USD Value':''].filter(Boolean).map(h=>(
                        <th key={h} className="text-left py-2.5 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap bg-white">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(row=>{
                      const isCliffEnd = row.month === cliff && cliff > 0
                      const isTGE = row.month === 0
                      return (
                        <tr key={row.month} className={`border-b border-[var(--border)] last:border-0 transition-colors
                          ${isTGE?'bg-zinc-50':isCliffEnd?'bg-zinc-50':'hover:bg-zinc-50'}`}>
                          <td className="py-2 pr-4 font-mono text-xs text-zinc-500">
                            {row.month===0?'TGE':'M'+row.month}
                            {isCliffEnd&&<span className="ml-1 badge-default text-[9px]">cliff end</span>}
                          </td>
                          <td className="py-2 pr-4 text-xs text-zinc-600">{row.date}</td>
                          <td className="py-2 pr-4 font-mono font-semibold text-black text-xs">{row.unlocked>0?'+'+fmtSupply(row.unlocked):'—'}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{fmtSupply(row.cumulative)}</td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-black rounded-full" style={{width:`${row.pct}%`}}/></div>
                              <span className="text-xs font-mono">{row.pct.toFixed(1)}%</span>
                            </div>
                          </td>
                          {price>0&&<td className="py-2 font-mono text-xs text-zinc-600">{fmt$(row.usd)}</td>}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-3">
                <CopyButton value={csvExport} label="Export CSV" />
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