'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, Info } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { getToolBySlug } from '@/lib/tools-registry'

function calcIL(priceRatio: number): number {
  // IL = 2*sqrt(r)/(1+r) - 1
  return (2 * Math.sqrt(priceRatio) / (1 + priceRatio)) - 1
}

function fmtPct(n: number, dec = 2): string { return n.toFixed(dec) + '%' }
function fmt$(n: number): string {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return '$' + n.toFixed(2)
}

const SCENARIOS = [0.1, 0.25, 0.5, 0.75, 1.25, 1.5, 2, 3, 4, 5, 10]

export function ImpermanentLossClient() {
  const tool = getToolBySlug('impermanent-loss-calculator')!

  const [depositA,   setDepositA]   = useState('1000')
  const [depositB,   setDepositB]   = useState('1000')
  const [priceA0,    setPriceA0]    = useState('1')
  const [priceB0,    setPriceB0]    = useState('1')
  const [priceA1,    setPriceA1]    = useState('2')
  const [priceB1,    setPriceB1]    = useState('1')
  const [feeApr,     setFeeApr]     = useState('20')
  const [days,       setDays]       = useState('30')

  const dA  = parseFloat(depositA)  || 0
  const dB  = parseFloat(depositB)  || 0
  const pA0 = parseFloat(priceA0)   || 1
  const pB0 = parseFloat(priceB0)   || 1
  const pA1 = parseFloat(priceA1)   || 1
  const pB1 = parseFloat(priceB1)   || 1
  const apr = parseFloat(feeApr)    || 0
  const d   = parseInt(days)        || 30

  const results = useMemo(() => {
    if (!dA || !dB || !pA0 || !pB0) return null

    // Initial pool values
    const initValueA = dA * pA0
    const initValueB = dB * pB0
    const totalDeposit = initValueA + initValueB

    // Price ratio change (token A relative to token B)
    const r0 = pA0 / pB0
    const r1 = pA1 / pB1
    const priceRatio = r1 / r0   // how much the ratio changed

    // IL calculation
    const ilFactor = calcIL(priceRatio)  // negative number
    const ilPct = ilFactor * 100

    // Hodl value
    const hodlValue = dA * pA1 + dB * pB1

    // LP value without fees = hodl * (1 + IL)
    const lpValueNoFees = hodlValue * (1 + ilFactor)

    // Fee earnings
    const feeEarned = totalDeposit * (apr / 100) * (d / 365)

    // LP value with fees
    const lpValueWithFees = lpValueNoFees + feeEarned

    // Profits
    const ilUsd = lpValueNoFees - hodlValue
    const netPnl = lpValueWithFees - totalDeposit
    const hodlPnl = hodlValue - totalDeposit

    // Break-even: days needed for fees to cover IL
    const dailyFee = totalDeposit * (apr / 100) / 365
    const breakEvenDays = dailyFee > 0 ? Math.abs(ilUsd) / dailyFee : Infinity

    return {
      totalDeposit, hodlValue, lpValueNoFees, lpValueWithFees,
      feeEarned, ilUsd, ilPct, netPnl, hodlPnl,
      priceRatio, breakEvenDays,
    }
  }, [dA, dB, pA0, pB0, pA1, pB1, apr, d])

  const reset = () => {
    setDepositA('1000'); setDepositB('1000')
    setPriceA0('1'); setPriceB0('1')
    setPriceA1('2'); setPriceB1('1')
    setFeeApr('20'); setDays('30')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Pool Position" description="Enter your LP deposit amounts and token prices">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border)] space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Token A</p>
              <InputGroup label="Deposit Amount">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={depositA} onChange={e => setDepositA(e.target.value)} className="tool-input pl-7 font-mono" placeholder="1000" />
                </div>
              </InputGroup>
              <InputGroup label="Entry Price (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={priceA0} onChange={e => setPriceA0(e.target.value)} className="tool-input pl-7 font-mono" placeholder="1.00" step="any" />
                </div>
              </InputGroup>
              <InputGroup label="Exit Price (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={priceA1} onChange={e => setPriceA1(e.target.value)} className="tool-input pl-7 font-mono" placeholder="2.00" step="any" />
                </div>
              </InputGroup>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Token B</p>
              <InputGroup label="Deposit Amount">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={depositB} onChange={e => setDepositB(e.target.value)} className="tool-input pl-7 font-mono" placeholder="1000" />
                </div>
              </InputGroup>
              <InputGroup label="Entry Price (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={priceB0} onChange={e => setPriceB0(e.target.value)} className="tool-input pl-7 font-mono" placeholder="1.00" step="any" />
                </div>
              </InputGroup>
              <InputGroup label="Exit Price (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input type="number" value={priceB1} onChange={e => setPriceB1(e.target.value)} className="tool-input pl-7 font-mono" placeholder="1.00" step="any" />
                </div>
              </InputGroup>
            </div>

            <InputGroup label="Pool Fee APR (%)" hint="Annual fee income as % of deposited value">
              <input type="number" value={feeApr} onChange={e => setFeeApr(e.target.value)} className="tool-input font-mono" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['5','10','20','30','50','100'].map(v => (
                  <button key={v} onClick={() => setFeeApr(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${feeApr === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{v}%</button>
                ))}
              </div>
            </InputGroup>

            <InputGroup label="Duration in Pool (Days)">
              <input type="number" value={days} onChange={e => setDays(e.target.value)} className="tool-input font-mono" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[['7d','7'],['30d','30'],['90d','90'],['180d','180'],['1yr','365']].map(([l,v]) => (
                  <button key={v} onClick={() => setDays(v)}
                    className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-all
                      ${days === v ? 'bg-black text-white border-black' : 'border-[var(--border)] text-zinc-600 hover:border-zinc-400'}`}>{l}</button>
                ))}
              </div>
            </InputGroup>
          </div>
        </ToolSection>

        {results && (
          <>
            {/* Hero IL result */}
            <div className={`p-6 rounded-xl border-2 ${results.ilPct < -5 ? 'border-black bg-black text-white' : 'border-zinc-300 bg-zinc-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${results.ilPct < -5 ? 'text-zinc-400' : 'text-zinc-500'}`}>Impermanent Loss</p>
                  <p className="text-5xl font-bold font-mono">{fmtPct(results.ilPct)}</p>
                  <p className={`text-sm mt-1 ${results.ilPct < -5 ? 'text-zinc-400' : 'text-zinc-500'}`}>{fmt$(results.ilUsd)} vs holding</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold
                  ${results.netPnl >= 0
                    ? (results.ilPct < -5 ? 'bg-white/15 text-white' : 'bg-black text-white')
                    : 'bg-zinc-200 text-zinc-700'}`}>
                  Net P&L: {results.netPnl >= 0 ? '+' : ''}{fmt$(results.netPnl)}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                {[
                  { l: 'LP Value (with fees)', v: fmt$(results.lpValueWithFees) },
                  { l: 'Hodl Value',           v: fmt$(results.hodlValue) },
                  { l: 'Fee Earnings',          v: '+' + fmt$(results.feeEarned) },
                  { l: 'Break-even',            v: results.breakEvenDays === Infinity ? 'Never' : Math.ceil(results.breakEvenDays) + ' days' },
                ].map(m => (
                  <div key={m.l}>
                    <p className={`text-xs mb-0.5 ${results.ilPct < -5 ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.l}</p>
                    <p className="text-base font-bold font-mono">{m.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard title="LP vs Hodl Comparison" items={[
                { label: 'Total Deposited',    value: fmt$(results.totalDeposit) },
                { label: 'Hodl Value',         value: fmt$(results.hodlValue) },
                { label: 'Hodl P&L',           value: (results.hodlPnl >= 0 ? '+' : '') + fmt$(results.hodlPnl) },
                { label: 'LP Value (no fees)', value: fmt$(results.lpValueNoFees) },
                { label: 'Fee Earnings',       value: '+' + fmt$(results.feeEarned) },
                { label: 'LP Value (w/ fees)', value: fmt$(results.lpValueWithFees), highlight: true },
              ]} />
              <InfoCard title="IL Details" items={[
                { label: 'Price Ratio Change', value: results.priceRatio.toFixed(4) + '×' },
                { label: 'IL %',               value: fmtPct(results.ilPct) },
                { label: 'IL (USD)',            value: fmt$(results.ilUsd) },
                { label: 'Net vs Deposit',     value: (results.netPnl >= 0 ? '+' : '') + fmt$(results.netPnl), highlight: true },
                { label: 'LP vs Hodl',         value: fmt$(results.lpValueWithFees - results.hodlValue) },
                { label: 'Break-even Days',    value: results.breakEvenDays === Infinity ? '∞' : Math.ceil(results.breakEvenDays) + 'd' },
              ]} />
            </div>

            {/* Scenario table */}
            <ToolSection title="Price Change Scenarios" description="IL at different Token A price multiples (Token B held constant)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black">
                      {['Price Multiple', 'Token A Price', 'IL %', 'IL (USD)', 'LP Value', 'Hodl Value', 'Diff'].map(h => (
                        <th key={h} className="text-left py-3 pr-4 last:pr-0 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SCENARIOS.map(mult => {
                      const r = mult / (pB1 / pB0)
                      const il = calcIL(r)
                      const hodlV = dA * pA0 * mult + dB * pB1
                      const lpV = hodlV * (1 + il)
                      const ilUsdScen = lpV - hodlV
                      const isCurrent = Math.abs(mult - pA1 / pA0) < 0.01
                      return (
                        <tr key={mult} className={`border-b border-[var(--border)] last:border-0 transition-colors ${isCurrent ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
                          <td className="py-2.5 pr-4 font-bold text-black">{mult}×
                            {isCurrent && <span className="ml-1.5 badge-default text-[9px]">current</span>}
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-xs">${(pA0 * mult).toFixed(4)}</td>
                          <td className={`py-2.5 pr-4 font-mono font-bold ${il < -0.05 ? 'text-black' : 'text-zinc-500'}`}>{fmtPct(il * 100)}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs text-zinc-600">{fmt$(ilUsdScen)}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs">{fmt$(lpV)}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs">{fmt$(hodlV)}</td>
                          <td className={`py-2.5 font-mono text-xs font-semibold ${lpV >= hodlV ? 'text-black' : 'text-zinc-500'}`}>
                            {lpV >= hodlV ? '+' : ''}{fmt$(lpV - hodlV)}
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

        <ToolSection title="What is Impermanent Loss?">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600">
            {[
              { t: 'Definition',   b: 'IL is the difference in value between holding tokens vs providing liquidity in an AMM. It occurs when the price ratio of your two tokens changes after deposit.' },
              { t: 'Why it happens', b: 'AMMs maintain constant product (x*y=k). As prices move, arbitrageurs rebalance the pool, leaving LPs with more of the depreciating token.' },
              { t: 'Recovery',    b: 'IL is "impermanent" — if prices return to entry ratio, IL disappears. Trading fees can also offset or exceed IL depending on pool volume.' },
            ].map(i => (
              <div key={i.t} className="p-3 rounded-lg border border-[var(--border)]">
                <p className="font-semibold text-black mb-1">{i.t}</p>
                <p className="leading-relaxed">{i.b}</p>
              </div>
            ))}
          </div>
        </ToolSection>

        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs"><RefreshCw size={12} />Reset</button>
        </div>
      </div>
    </ToolLayout>
  )
}