'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, RefreshCw, Info, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { CopyButton } from '@/components/shared/CopyButton'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Types ──────────────────────────────────────────────────────────────────
interface TxRow {
  id: string
  label: string
  gasLimit: number | ''
  count: number
  note: string
}

// ── Constants ──────────────────────────────────────────────────────────────
const TX_PRESETS: { label: string; gasLimit: number; note: string }[] = [
  { label: 'ETH Transfer',         gasLimit: 21_000,   note: 'Native ETH send' },
  { label: 'ERC-20 Transfer',      gasLimit: 65_000,   note: 'Token transfer' },
  { label: 'ERC-20 Approve',       gasLimit: 46_000,   note: 'Allowance set' },
  { label: 'Uniswap V3 Swap',      gasLimit: 185_000,  note: 'DEX single hop' },
  { label: 'Uniswap Multi-hop',    gasLimit: 270_000,  note: 'DEX multi hop' },
  { label: 'NFT Mint (ERC-721)',   gasLimit: 120_000,  note: 'Single mint' },
  { label: 'NFT Mint (ERC-1155)',  gasLimit: 95_000,   note: 'Batch-friendly' },
  { label: 'Add Liquidity',        gasLimit: 200_000,  note: 'LP deposit' },
  { label: 'Remove Liquidity',     gasLimit: 170_000,  note: 'LP withdrawal' },
  { label: 'Stake Tokens',         gasLimit: 80_000,   note: 'Staking deposit' },
  { label: 'Contract Deploy',      gasLimit: 800_000,  note: 'New contract' },
  { label: 'Gnosis Safe Tx',       gasLimit: 100_000,  note: 'Multisig exec' },
]

const GAS_SPEEDS = [
  { key: 'slow',     label: 'Slow',     emoji: '🐢', gwei: 10,  eta: '5–10 min' },
  { key: 'standard', label: 'Standard', emoji: '🚗', gwei: 20,  eta: '1–3 min' },
  { key: 'fast',     label: 'Fast',     emoji: '🚀', gwei: 35,  eta: '< 30 sec' },
  { key: 'instant',  label: 'Instant',  emoji: '⚡', gwei: 60,  eta: '< 12 sec' },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function weiToEth(wei: number): number {
  return wei / 1e18
}

function formatEth(eth: number): string {
  if (eth === 0) return '0 ETH'
  if (eth < 0.000001) return eth.toExponential(4) + ' ETH'
  return eth.toFixed(8).replace(/\.?0+$/, '') + ' ETH'
}

function formatUSD(eth: number, price: number): string {
  if (price === 0 || eth === 0) return '—'
  const usd = eth * price
  if (usd < 0.01) return '< $0.01'
  return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calcFeeWei(gasLimit: number, gasPriceGwei: number, priorityGwei: number): number {
  return gasLimit * (gasPriceGwei + priorityGwei) * 1e9
}

// ── Component ──────────────────────────────────────────────────────────────
export function TransactionFeeEstimatorClient() {
  const tool = getToolBySlug('transaction-fee-estimator')!

  // Global settings
  const [ethPrice, setEthPrice]       = useState('3200')
  const [priorityFee, setPriorityFee] = useState('1')
  const [showPresets, setShowPresets] = useState(false)

  // Transaction rows
  const [rows, setRows] = useState<TxRow[]>([
    { id: uid(), label: 'ETH Transfer',    gasLimit: 21_000,  count: 1, note: 'Native ETH send' },
    { id: uid(), label: 'ERC-20 Transfer', gasLimit: 65_000,  count: 2, note: 'Token transfer' },
    { id: uid(), label: 'Uniswap V3 Swap',gasLimit: 185_000, count: 1, note: 'DEX single hop' },
  ])

  // Derived
  const ethPriceNum   = parseFloat(ethPrice.replace(/,/g, '')) || 0
  const priorityGwei  = parseFloat(priorityFee) || 0

  // Per-row fees across all speeds
  const rowFees = useMemo(() =>
    rows.map(row => {
      const gl = Number(row.gasLimit) || 0
      const cnt = row.count || 1
      return GAS_SPEEDS.map(speed => ({
        key: speed.key,
        feeWei: calcFeeWei(gl, speed.gwei, priorityGwei) * cnt,
      }))
    }),
  [rows, priorityGwei])

  // Column totals
  const totals = useMemo(() =>
    GAS_SPEEDS.map((speed, si) => ({
      ...speed,
      totalWei: rowFees.reduce((sum, rowSpeeds) => sum + rowSpeeds[si].feeWei, 0),
    })),
  [rowFees])

  // Total tx count
  const totalTxCount = rows.reduce((s, r) => s + (r.count || 1), 0)

  // Row operations
  const addRow = (preset?: typeof TX_PRESETS[0]) => {
    setRows(prev => [...prev, {
      id:       uid(),
      label:    preset?.label    ?? 'Custom Transaction',
      gasLimit: preset?.gasLimit ?? 21_000,
      count:    1,
      note:     preset?.note     ?? '',
    }])
    setShowPresets(false)
  }

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const updateRow = (id: string, field: keyof TxRow, value: string | number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const reset = () => {
    setRows([
      { id: uid(), label: 'ETH Transfer',    gasLimit: 21_000,  count: 1, note: 'Native ETH send' },
      { id: uid(), label: 'ERC-20 Transfer', gasLimit: 65_000,  count: 2, note: 'Token transfer' },
      { id: uid(), label: 'Uniswap V3 Swap',gasLimit: 185_000, count: 1, note: 'DEX single hop' },
    ])
    setEthPrice('3200')
    setPriorityFee('1')
  }

  // Export summary as text
  const exportSummary = useMemo(() => {
    const lines = [
      'Transaction Fee Estimate',
      '========================',
      `ETH Price: $${ethPriceNum.toLocaleString()}`,
      `Priority Fee: ${priorityGwei} Gwei`,
      '',
      'Transactions:',
      ...rows.map(r =>
        `  · ${r.label} × ${r.count} (gas: ${Number(r.gasLimit).toLocaleString()})`
      ),
      '',
      'Cost Summary:',
      ...totals.map(s =>
        `  ${s.label.padEnd(10)} ${formatEth(weiToEth(s.totalWei)).padEnd(20)} ${formatUSD(weiToEth(s.totalWei), ethPriceNum)}`
      ),
    ]
    return lines.join('\n')
  }, [rows, totals, ethPriceNum, priorityGwei])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Global Settings ─── */}
        <ToolSection title="Settings" description="Configure ETH price and priority fee">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="ETH Price (USD)" hint="Current ETH market price">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                  type="number"
                  value={ethPrice}
                  onChange={e => setEthPrice(e.target.value)}
                  placeholder="3200"
                  className="tool-input pl-7"
                />
              </div>
            </InputGroup>

            <InputGroup label="Priority Fee (Gwei)" hint="Miner tip added on top of base fee">
              <input
                type="number"
                value={priorityFee}
                onChange={e => setPriorityFee(e.target.value)}
                placeholder="1"
                step="0.5"
                className="tool-input font-mono"
              />
            </InputGroup>
          </div>
        </ToolSection>

        {/* ─── Transaction Table ─── */}
        <ToolSection
          title="Transactions"
          description="Add multiple transaction types to estimate total fees"
        >
          <div className="space-y-3">
            {/* Table header */}
            {rows.length > 0 && (
              <div className="hidden sm:grid grid-cols-[1fr_140px_80px_120px_36px] gap-3 px-1">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Transaction</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Gas Limit</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Count</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Note</span>
                <span />
              </div>
            )}

            {/* Rows */}
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_140px_80px_120px_36px] gap-3 p-3 rounded-lg border border-[var(--border)] bg-white hover:border-zinc-300 transition-colors group"
              >
                {/* Label */}
                <input
                  type="text"
                  value={row.label}
                  onChange={e => updateRow(row.id, 'label', e.target.value)}
                  className="tool-input text-sm font-medium"
                  placeholder="Transaction name"
                />
                {/* Gas limit */}
                <input
                  type="number"
                  value={row.gasLimit}
                  onChange={e => updateRow(row.id, 'gasLimit', e.target.value === '' ? '' : Number(e.target.value))}
                  className="tool-input font-mono text-sm"
                  placeholder="21000"
                />
                {/* Count */}
                <input
                  type="number"
                  value={row.count}
                  min={1}
                  onChange={e => updateRow(row.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                  className="tool-input text-center text-sm"
                />
                {/* Note */}
                <input
                  type="text"
                  value={row.note}
                  onChange={e => updateRow(row.id, 'note', e.target.value)}
                  className="tool-input text-xs text-zinc-500"
                  placeholder="Optional note"
                />
                {/* Delete */}
                <button
                  onClick={() => removeRow(row.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all self-center"
                  title="Remove row"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {rows.length === 0 && (
              <div className="flex items-center justify-center py-10 border-2 border-dashed border-[var(--border)] rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-zinc-400">No transactions added yet</p>
                  <p className="text-xs text-zinc-300 mt-1">Click a preset or add custom below</p>
                </div>
              </div>
            )}

            {/* Add buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => addRow()}
                className="btn-secondary text-xs gap-1.5"
              >
                <Plus size={12} />
                Add Custom
              </button>

              <button
                onClick={() => setShowPresets(!showPresets)}
                className="btn-secondary text-xs gap-1.5"
              >
                <ArrowUpDown size={12} />
                Add Preset
                {showPresets ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Preset picker */}
            {showPresets && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                {TX_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => addRow(preset)}
                    className="flex flex-col items-start px-3 py-2.5 rounded-lg border border-[var(--border)] bg-white hover:border-zinc-400 hover:shadow-sm transition-all text-left cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-black">{preset.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {preset.gasLimit.toLocaleString()} gas
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ToolSection>

        {/* ─── Results Table ─── */}
        {rows.length > 0 && (
          <ToolSection
            title="Fee Comparison"
            description={`Total estimated cost for ${totalTxCount} transaction${totalTxCount !== 1 ? 's' : ''} across gas speed tiers`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 pr-4 text-xs font-semibold text-black uppercase tracking-wide min-w-[180px]">
                      Transaction
                    </th>
                    <th className="text-right py-3 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Gas × Count
                    </th>
                    {GAS_SPEEDS.map(s => (
                      <th key={s.key} className="text-right py-3 px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                        <span className="mr-1">{s.emoji}</span>{s.label}
                        <span className="block text-[10px] font-normal normal-case text-zinc-400">{s.gwei + priorityGwei} Gwei</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={row.id} className="border-b border-[var(--border)] hover:bg-zinc-50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-black">{row.label || '—'}</span>
                        {row.note && (
                          <span className="block text-xs text-zinc-400">{row.note}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-xs text-zinc-500">
                        {Number(row.gasLimit || 0).toLocaleString()}
                        {row.count > 1 && (
                          <span className="ml-1 text-zinc-400">×{row.count}</span>
                        )}
                      </td>
                      {rowFees[ri].map((col, si) => {
                        const eth = weiToEth(col.feeWei)
                        return (
                          <td key={col.key} className="py-3 px-3 text-right">
                            <span className="font-mono text-xs text-black block">
                              {formatEth(eth)}
                            </span>
                            {ethPriceNum > 0 && (
                              <span className="font-mono text-[11px] text-zinc-500 block">
                                {formatUSD(eth, ethPriceNum)}
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>

                {/* Totals row */}
                <tfoot>
                  <tr className="bg-black text-white">
                    <td className="py-3.5 px-4 font-semibold text-sm rounded-bl-lg">
                      Total
                      <span className="text-xs text-zinc-400 ml-2 font-normal">
                        {totalTxCount} tx
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right text-xs text-zinc-400 font-mono">
                      {rows.reduce((s, r) => s + Number(r.gasLimit || 0) * r.count, 0).toLocaleString()}
                    </td>
                    {totals.map(col => {
                      const eth = weiToEth(col.totalWei)
                      return (
                        <td key={col.key} className="py-3.5 px-3 text-right last:rounded-br-lg">
                          <span className="font-mono text-sm font-semibold text-white block">
                            {formatEth(eth)}
                          </span>
                          {ethPriceNum > 0 && (
                            <span className="font-mono text-xs text-zinc-400 block">
                              {formatUSD(eth, ethPriceNum)}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </ToolSection>
        )}

        {/* ─── Summary Cards ─── */}
        {rows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {totals.map(speed => {
              const eth = weiToEth(speed.totalWei)
              return (
                <div key={speed.key} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span>{speed.emoji}</span>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{speed.label}</span>
                  </div>
                  <p className="text-base font-bold font-mono text-black leading-tight">
                    {formatEth(eth)}
                  </p>
                  {ethPriceNum > 0 && (
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {formatUSD(eth, ethPriceNum)}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-400 mt-2">{speed.eta}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── Export ─── */}
        {rows.length > 0 && (
          <ToolSection title="Export Summary">
            <div className="relative">
              <pre className="tool-result text-xs leading-relaxed whitespace-pre overflow-x-auto p-4">
                {exportSummary}
              </pre>
              <div className="absolute top-3 right-3">
                <CopyButton value={exportSummary} label="Copy Report" />
              </div>
            </div>
          </ToolSection>
        )}

        {/* ─── Info ─── */}
        <ToolSection title="Understanding Transaction Fees">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-zinc-600">
            {[
              { title: 'EIP-1559',   body: 'Post-London upgrade, fees split into base fee (burned) + priority fee (to validator). Total gas price = base + priority.' },
              { title: 'Gas Limit',  body: 'Max gas your tx can use. Unused gas is refunded. Setting too low causes "out of gas" reverts with fees still charged.' },
              { title: 'Batch Txs', body: 'Sending multiple similar transactions? Set count > 1. Each tx pays full gas. Consider using batch contracts to save.' },
              { title: 'Savings Tip', body: 'Transact during low-traffic periods (weekends, late UTC nights) for 2–5× lower base fees.' },
            ].map(item => (
              <div key={item.title} className="p-3 rounded-lg border border-[var(--border)]">
                <p className="font-semibold text-black mb-1">{item.title}</p>
                <p className="leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </ToolSection>

        {/* Reset */}
        <div className="flex justify-end">
          <button onClick={reset} className="btn-secondary gap-2 text-xs">
            <RefreshCw size={12} />
            Reset All
          </button>
        </div>

      </div>
    </ToolLayout>
  )
}