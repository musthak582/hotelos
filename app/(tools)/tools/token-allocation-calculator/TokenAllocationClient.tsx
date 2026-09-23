'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function uid() { return Math.random().toString(36).slice(2,9) }
function fmt$(n:number):string {
  if(!n) return '—'
  if(n>=1e9) return '$'+(n/1e9).toFixed(3)+'B'
  if(n>=1e6) return '$'+(n/1e6).toFixed(3)+'M'
  if(n>=1e3) return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
  return '$'+n.toFixed(2)
}
function fmtSupply(n:number):string {
  if(!n) return '—'
  if(n>=1e9) return (n/1e9).toFixed(2)+'B'
  if(n>=1e6) return (n/1e6).toFixed(2)+'M'
  if(n>=1e3) return (n/1e3).toFixed(2)+'K'
  return n.toLocaleString('en-US')
}

const SHADES = ['bg-black','bg-zinc-700','bg-zinc-500','bg-zinc-400','bg-zinc-300','bg-zinc-200','bg-zinc-100','bg-zinc-50']

const DEFAULT_ALLOCS = [
  {id:uid(),label:'Public Sale',      pct:15, tge:100, cliff:0,  vest:0  },
  {id:uid(),label:'Private/Seed',     pct:10, tge:10,  cliff:6,  vest:18 },
  {id:uid(),label:'Team & Founders',  pct:20, tge:0,   cliff:12, vest:24 },
  {id:uid(),label:'Ecosystem/Grants', pct:25, tge:5,   cliff:0,  vest:36 },
  {id:uid(),label:'Treasury',         pct:20, tge:0,   cliff:6,  vest:24 },
  {id:uid(),label:'Liquidity',        pct:10, tge:100, cliff:0,  vest:0  },
]

export function TokenAllocationClient() {
  const tool = getToolBySlug('token-allocation-calculator')!

  const [maxSupplyRaw, setMaxSupplyRaw] = useState('1000000000')
  const [priceRaw,     setPriceRaw]     = useState('0.05')
  const [allocs, setAllocs] = useState(DEFAULT_ALLOCS)

  const maxSupply = parseFloat(maxSupplyRaw.replace(/,/g,'')) || 0
  const price     = parseFloat(priceRaw) || 0

  const total = useMemo(() => allocs.reduce((s,a)=>s+(Number(a.pct)||0),0), [allocs])
  const valid = Math.abs(total-100) < 0.01

  const rows = useMemo(() => allocs.map(a => ({
    ...a,
    tokens: maxSupply * (Number(a.pct)/100),
    usdVal: maxSupply * (Number(a.pct)/100) * price,
    tgeTokens: maxSupply * (Number(a.pct)/100) * (Number(a.tge)/100),
  })), [allocs, maxSupply, price])

  const totalTge = rows.reduce((s,r)=>s+r.tgeTokens,0)

  const addRow = () => setAllocs(p=>[...p,{id:uid(),label:'New Category',pct:0,tge:0,cliff:0,vest:12}])
  const removeRow = (id:string) => setAllocs(p=>p.filter(r=>r.id!==id))
  const update = (id:string,field:string,val:string|number) => setAllocs(p=>p.map(r=>r.id===id?{...r,[field]:val}:r))
  const reset = () => { setAllocs(DEFAULT_ALLOCS); setMaxSupplyRaw('1000000000'); setPriceRaw('0.05') }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Token Parameters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Max Token Supply">
              <input type="text" value={maxSupplyRaw} onChange={e=>setMaxSupplyRaw(e.target.value)} className="tool-input font-mono" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['100M','100000000'],['500M','500000000'],['1B','1000000000'],['10B','10000000000']].map(([l,v])=>(
                  <button key={v} onClick={()=>setMaxSupplyRaw(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${maxSupplyRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Token Price (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={priceRaw} onChange={e=>setPriceRaw(e.target.value)} className="tool-input pl-7 font-mono" step="any" /></div>
            </InputGroup>
          </div>
        </ToolSection>

        <ToolSection title="Allocation Table" description="Must total exactly 100%">
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_36px] gap-2 px-1">
              {['Category','Alloc %','TGE %','Cliff mo','Vest mo',''].map(h=>(
                <span key={h} className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {allocs.map((row,i)=>(
              <div key={row.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_80px_80px_36px] gap-2 p-3 rounded-lg border border-[var(--border)] items-center hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${SHADES[i%SHADES.length]}`}/>
                  <input type="text" value={row.label} onChange={e=>update(row.id,'label',e.target.value)} className="tool-input text-sm font-medium" />
                </div>
                <input type="number" value={row.pct} onChange={e=>update(row.id,'pct',Number(e.target.value))} className="tool-input text-center font-mono text-sm" min={0} max={100} />
                <input type="number" value={row.tge} onChange={e=>update(row.id,'tge',Number(e.target.value))} className="tool-input text-center font-mono text-sm" min={0} max={100} />
                <input type="number" value={row.cliff} onChange={e=>update(row.id,'cliff',Number(e.target.value))} className="tool-input text-center font-mono text-sm" min={0} />
                <input type="number" value={row.vest} onChange={e=>update(row.id,'vest',Number(e.target.value))} className="tool-input text-center font-mono text-sm" min={0} />
                <button onClick={()=>removeRow(row.id)} className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
            <div className={`flex justify-between px-4 py-2.5 rounded-lg border font-mono text-sm ${valid?'border-black bg-black text-white':'border-red-300 bg-red-50 text-red-700'}`}>
              <span className="font-semibold">Total</span>
              <span className="font-bold">{total.toFixed(2)}%{!valid&&' ⚠ must be 100%'}</span>
            </div>
            <button onClick={addRow} className="btn-secondary text-xs gap-1.5 mt-1"><Plus size={12}/>Add Category</button>
          </div>
        </ToolSection>

        {valid && maxSupply > 0 && (
          <>
            {/* Stacked bar */}
            <ToolSection title="Distribution Visualization">
              <div className="h-10 rounded-xl overflow-hidden border border-[var(--border)] flex mb-3">
                {rows.map((row,i)=>(
                  <div key={row.id} className={`h-full ${SHADES[i%SHADES.length]}`} style={{width:`${row.pct}%`}} title={`${row.label}: ${row.pct}%`}/>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {rows.map((row,i)=>(
                  <span key={row.id} className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <span className={`w-2.5 h-2.5 rounded-full ${SHADES[i%SHADES.length]}`}/>
                    {row.label} <span className="font-mono font-semibold text-black">{row.pct}%</span>
                  </span>
                ))}
              </div>
            </ToolSection>

            <ToolSection title="Allocation Breakdown">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Category','Alloc %','Tokens','USD Value','TGE Unlock','Cliff','Vest'].map(h=>(
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row,i)=>(
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0 hover:bg-zinc-50">
                        <td className="py-3 pr-4"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${SHADES[i%SHADES.length]}`}/><span className="font-medium">{row.label}</span></div></td>
                        <td className="py-3 pr-4 font-mono">{row.pct}%</td>
                        <td className="py-3 pr-4 font-mono font-semibold">{fmtSupply(row.tokens)}</td>
                        <td className="py-3 pr-4 font-mono">{price>0?fmt$(row.usdVal):'—'}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{row.tge}% ({fmtSupply(row.tgeTokens)})</td>
                        <td className="py-3 pr-4 text-xs text-zinc-500">{row.cliff>0?row.cliff+' mo':'None'}</td>
                        <td className="py-3 text-xs text-zinc-500">{row.vest>0?row.vest+' mo':'Instant'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-black text-white">
                      <td className="py-3 px-4 font-semibold rounded-bl-lg">Total</td>
                      <td className="py-3 pr-4 font-mono font-bold">100%</td>
                      <td className="py-3 pr-4 font-mono font-bold">{fmtSupply(maxSupply)}</td>
                      <td className="py-3 pr-4 font-mono">{price>0?fmt$(maxSupply*price):'—'}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{((totalTge/maxSupply)*100).toFixed(1)}% at TGE</td>
                      <td className="py-3 pr-4"/>
                      <td className="py-3 rounded-br-lg"/>
                    </tr>
                  </tfoot>
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