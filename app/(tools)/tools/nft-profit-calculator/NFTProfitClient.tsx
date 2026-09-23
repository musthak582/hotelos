'use client'
import { useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function fmt$(n:number):string {
  if(!isFinite(n)) return '—'
  return '$'+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:4,maximumFractionDigits:4})
}
function fmtPct(n:number):string { return (n>=0?'+':'')+n.toFixed(2)+'%' }

const MARKETPLACES = [
  {name:'OpenSea',    fee:2.5},
  {name:'Blur',       fee:0.5},
  {name:'X2Y2',       fee:0.5},
  {name:'LooksRare',  fee:1.5},
  {name:'Foundation', fee:5.0},
  {name:'Custom',     fee:0},
]

export function NFTProfitClient() {
  const tool = getToolBySlug('nft-profit-calculator')!
  const [buyPriceRaw,    setBuyPriceRaw]    = useState('1.5')
  const [sellPriceRaw,   setSellPriceRaw]   = useState('3.0')
  const [marketplaceIdx, setMarketplaceIdx] = useState(0)
  const [customFee,      setCustomFee]      = useState('2.5')
  const [royaltyRaw,     setRoyaltyRaw]     = useState('5')
  const [buyGasRaw,      setBuyGasRaw]      = useState('0.003')
  const [sellGasRaw,     setSellGasRaw]     = useState('0.003')
  const [ethPriceRaw,    setEthPriceRaw]    = useState('3200')
  const [quantity,       setQuantity]       = useState('1')

  const buy     = parseFloat(buyPriceRaw)  || 0
  const sell    = parseFloat(sellPriceRaw) || 0
  const mktFee  = marketplaceIdx === MARKETPLACES.length-1 ? parseFloat(customFee)||0 : MARKETPLACES[marketplaceIdx].fee
  const royalty = parseFloat(royaltyRaw)  || 0
  const buyGas  = parseFloat(buyGasRaw)   || 0
  const sellGas = parseFloat(sellGasRaw)  || 0
  const ethPrice= parseFloat(ethPriceRaw) || 0
  const qty     = parseInt(quantity)       || 1

  const results = useMemo(()=>{
    if(!buy||!sell) return null
    const mktFeePct = mktFee / 100
    const royaltyPct = royalty / 100

    const totalBuy    = (buy + buyGas) * qty
    const sellFees    = sell * (mktFeePct + royaltyPct) * qty
    const totalSellGas= sellGas * qty
    const grossRevenue= sell * qty
    const netRevenue  = grossRevenue - sellFees - totalSellGas
    const netProfit   = netRevenue - totalBuy
    const roi         = (netProfit / totalBuy) * 100
    const multiple    = netRevenue / totalBuy
    const totalFees   = sellFees + totalSellGas + buyGas*qty
    const usdProfit   = netProfit * ethPrice

    // Break-even sell price
    // netRevenue = breakEven * qty * (1 - mktFee - royalty) - sellGas * qty = totalBuy
    // breakEven = (totalBuy + sellGas*qty) / (qty*(1-mktFee-royalty))
    const bePrice = (totalBuy + sellGas*qty) / (qty*(1-mktFeePct-royaltyPct))

    return {totalBuy,sellFees,totalSellGas,grossRevenue,netRevenue,netProfit,roi,multiple,totalFees,usdProfit,bePrice}
  },[buy,sell,mktFee,royalty,buyGas,sellGas,qty,ethPrice])

  const reset=()=>{setBuyPriceRaw('1.5');setSellPriceRaw('3.0');setMarketplaceIdx(0);setRoyaltyRaw('5');setBuyGasRaw('0.003');setSellGasRaw('0.003');setEthPriceRaw('3200');setQuantity('1')}

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Trade Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Buy Price (ETH)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">Ξ</span>
                <input type="number" value={buyPriceRaw} onChange={e=>setBuyPriceRaw(e.target.value)} className="tool-input pl-7 font-mono" step="0.001"/></div>
            </InputGroup>
            <InputGroup label="Sell Price (ETH)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">Ξ</span>
                <input type="number" value={sellPriceRaw} onChange={e=>setSellPriceRaw(e.target.value)} className="tool-input pl-7 font-mono" step="0.001"/></div>
            </InputGroup>
            <InputGroup label="Quantity">
              <input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} className="tool-input font-mono" min={1}/>
            </InputGroup>
            <InputGroup label="ETH Price (USD)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input type="number" value={ethPriceRaw} onChange={e=>setEthPriceRaw(e.target.value)} className="tool-input pl-7 font-mono"/></div>
            </InputGroup>
            <InputGroup label="Marketplace">
              <div className="grid grid-cols-3 gap-2">
                {MARKETPLACES.map((m,i)=>(
                  <button key={m.name} onClick={()=>setMarketplaceIdx(i)} className={`py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${marketplaceIdx===i?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>
                    {m.name}{m.fee>0&&<span className="block text-[10px] opacity-60">{m.fee}%</span>}
                  </button>
                ))}
              </div>
              {marketplaceIdx===MARKETPLACES.length-1&&(
                <input type="number" value={customFee} onChange={e=>setCustomFee(e.target.value)} className="tool-input font-mono mt-2" placeholder="Custom fee %" step="0.1"/>
              )}
            </InputGroup>
            <InputGroup label="Creator Royalty (%)" hint="Royalty paid to original creator on sale">
              <input type="number" value={royaltyRaw} onChange={e=>setRoyaltyRaw(e.target.value)} className="tool-input font-mono" step="0.5"/>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['0','2.5','5','7.5','10'].map(v=>(
                  <button key={v} onClick={()=>setRoyaltyRaw(v)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all ${royaltyRaw===v?'bg-black text-white border-black':'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>
            <InputGroup label="Buy Gas (ETH)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">Ξ</span>
                <input type="number" value={buyGasRaw} onChange={e=>setBuyGasRaw(e.target.value)} className="tool-input pl-7 font-mono" step="0.001"/></div>
            </InputGroup>
            <InputGroup label="Sell Gas (ETH)">
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">Ξ</span>
                <input type="number" value={sellGasRaw} onChange={e=>setSellGasRaw(e.target.value)} className="tool-input pl-7 font-mono" step="0.001"/></div>
            </InputGroup>
          </div>
        </ToolSection>

        {results && (
          <>
            <div className={`p-6 rounded-xl border-2 ${results.netProfit>=0?'border-black bg-black text-white':'border-zinc-300 bg-zinc-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${results.netProfit>=0?'text-zinc-400':'text-zinc-500'}`}>{results.netProfit>=0?'Net Profit':'Net Loss'}</p>
                  <p className="text-4xl font-bold font-mono">{results.netProfit>=0?'+':'-'}Ξ{Math.abs(results.netProfit).toFixed(4)}</p>
                  {ethPrice>0&&<p className={`text-lg font-semibold mt-1 ${results.netProfit>=0?'text-zinc-300':'text-zinc-500'}`}>{results.usdProfit>=0?'+':'-'}${Math.abs(results.usdProfit).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${results.netProfit>=0?'bg-white/15 text-white':'bg-zinc-200 text-zinc-700'}`}>
                  {fmtPct(results.roi)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div><p className={`text-xs mb-0.5 ${results.netProfit>=0?'text-zinc-400':'text-zinc-500'}`}>Multiple</p><p className="text-lg font-bold font-mono">{results.multiple.toFixed(3)}×</p></div>
                <div><p className={`text-xs mb-0.5 ${results.netProfit>=0?'text-zinc-400':'text-zinc-500'}`}>Break-even</p><p className="text-lg font-bold font-mono">Ξ{results.bePrice.toFixed(4)}</p></div>
                <div><p className={`text-xs mb-0.5 ${results.netProfit>=0?'text-zinc-400':'text-zinc-500'}`}>Total Fees</p><p className="text-lg font-bold font-mono">Ξ{results.totalFees.toFixed(4)}</p></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="Cost Breakdown" items={[
                {label:'Buy Price × qty',    value:`Ξ${(buy*qty).toFixed(4)}`},
                {label:'Buy Gas',            value:`Ξ${(results.totalBuy - buy*qty).toFixed(4)}`},
                {label:'Total Cost',         value:`Ξ${results.totalBuy.toFixed(4)}`, highlight:true},
              ]}/>
              <InfoCard title="Revenue Breakdown" items={[
                {label:'Gross Revenue',      value:`Ξ${results.grossRevenue.toFixed(4)}`},
                {label:`Marketplace (${mktFee}%)`, value:`-Ξ${(sell*qty*mktFee/100).toFixed(4)}`},
                {label:`Royalty (${royalty}%)`,    value:`-Ξ${(sell*qty*royalty/100).toFixed(4)}`},
                {label:'Sell Gas',           value:`-Ξ${results.totalSellGas.toFixed(4)}`},
                {label:'Net Revenue',        value:`Ξ${results.netRevenue.toFixed(4)}`, highlight:true},
              ]}/>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12}/>Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}