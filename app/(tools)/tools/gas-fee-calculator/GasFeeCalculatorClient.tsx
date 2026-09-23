'use client'

import { useState, useMemo } from 'react'
import { Fuel, RefreshCw, Info } from 'lucide-react'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { ToolSection, InputGroup, InfoCard } from '@/components/shared/ToolSection'
import { ResultDisplay } from '@/components/shared/ResultDisplay'
import { getToolBySlug } from '@/lib/tools-registry'

// ── Constants ──────────────────────────────────────────────────────────────
const PRESET_GAS_LIMITS: { label: string; value: number; description: string }[] = [
  { label: 'ETH Transfer',        value: 21_000,   description: 'Simple ETH send' },
  { label: 'ERC-20 Transfer',     value: 65_000,   description: 'Token transfer' },
  { label: 'ERC-20 Approve',      value: 46_000,   description: 'Token approval' },
  { label: 'Uniswap Swap',        value: 150_000,  description: 'DEX token swap' },
  { label: 'NFT Mint',            value: 120_000,  description: 'Single NFT mint' },
  { label: 'Contract Deploy',     value: 800_000,  description: 'New contract' },
  { label: 'Custom',              value: 0,         description: 'Enter manually' },
]

const GAS_SPEED_PRESETS: { label: string; emoji: string; gwei: number; description: string; minutes: string }[] = [
  { label: 'Slow',     emoji: '🐢', gwei: 10,  description: 'Best price, slowest', minutes: '5–10 min' },
  { label: 'Standard', emoji: '🚗', gwei: 20,  description: 'Balanced choice',     minutes: '1–3 min' },
  { label: 'Fast',     emoji: '🚀', gwei: 35,  description: 'Quick confirmation',  minutes: '< 30 sec' },
  { label: 'Custom',   emoji: '⚙️', gwei: 0,   description: 'Enter manually',      minutes: '—' },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function formatETH(wei: bigint): string {
  const eth = Number(wei) / 1e18
  if (eth < 0.000001) return eth.toExponential(4) + ' ETH'
  return eth.toFixed(8).replace(/\.?0+$/, '') + ' ETH'
}

function formatUSD(wei: bigint, ethPrice: number): string {
  const eth = Number(wei) / 1e18
  const usd = eth * ethPrice
  if (usd < 0.01) return '< $0.01'
  return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function formatGwei(gwei: number): string {
  return gwei.toLocaleString('en-US') + ' Gwei'
}

// ── Component ──────────────────────────────────────────────────────────────
export function GasFeeCalculatorClient() {
  const tool = getToolBySlug('gas-fee-calculator')!

  // Inputs
  const [selectedPreset, setSelectedPreset] = useState(0)              // gas limit preset index
  const [customGasLimit, setCustomGasLimit] = useState('')
  const [selectedSpeed, setSelectedSpeed] = useState(1)                // gas price speed index
  const [customGwei, setCustomGwei] = useState('')
  const [ethPrice, setEthPrice] = useState('3200')
  const [priorityFee, setPriorityFee] = useState('1')                  // EIP-1559 priority tip

  // Derived values
  const gasLimit = useMemo(() => {
    if (selectedPreset === PRESET_GAS_LIMITS.length - 1) {
      const n = parseInt(customGasLimit.replace(/,/g, ''), 10)
      return isNaN(n) || n <= 0 ? 0 : n
    }
    return PRESET_GAS_LIMITS[selectedPreset].value
  }, [selectedPreset, customGasLimit])

  const baseFeeGwei = useMemo(() => {
    if (selectedSpeed === GAS_SPEED_PRESETS.length - 1) {
      const n = parseFloat(customGwei)
      return isNaN(n) || n <= 0 ? 0 : n
    }
    return GAS_SPEED_PRESETS[selectedSpeed].gwei
  }, [selectedSpeed, customGwei])

  const priorityFeeGwei = useMemo(() => {
    const n = parseFloat(priorityFee)
    return isNaN(n) || n < 0 ? 0 : n
  }, [priorityFee])

  const ethPriceNum = useMemo(() => {
    const n = parseFloat(ethPrice.replace(/,/g, ''))
    return isNaN(n) || n <= 0 ? 0 : n
  }, [ethPrice])

  // Total gas price = base fee + priority fee
  const totalGasPriceGwei = baseFeeGwei + priorityFeeGwei

  // Fee in Wei (using BigInt for precision)
  const feeWei = useMemo(() => {
    if (gasLimit === 0 || totalGasPriceGwei === 0) return BigInt(0)
    // gwei → wei: multiply by 1e9
    const gweiWei = Math.round(totalGasPriceGwei * 1e9)
    return BigInt(gasLimit) * BigInt(gweiWei)
  }, [gasLimit, totalGasPriceGwei])

  const isValid = gasLimit > 0 && totalGasPriceGwei > 0

  // Multi-speed comparison (always shown)
  const comparison = GAS_SPEED_PRESETS.slice(0, 3).map(speed => {
    const total = speed.gwei + priorityFeeGwei
    const wei = gasLimit > 0 ? BigInt(gasLimit) * BigInt(Math.round(total * 1e9)) : BigInt(0)
    return { ...speed, wei }
  })

  const handleReset = () => {
    setSelectedPreset(0)
    setCustomGasLimit('')
    setSelectedSpeed(1)
    setCustomGwei('')
    setEthPrice('3200')
    setPriorityFee('1')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">

        {/* ─── Inputs ─── */}
        <ToolSection title="Configuration" description="Set gas limit, speed, and current ETH price">
          <div className="space-y-6">

            {/* ETH Price */}
            <InputGroup label="ETH Price (USD)" hint="Enter current ETH price for USD estimates">
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

            {/* Gas Limit Presets */}
            <InputGroup label="Transaction Type / Gas Limit">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                {PRESET_GAS_LIMITS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => setSelectedPreset(i)}
                    className={`flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer
                      ${selectedPreset === i
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-[var(--border)] text-zinc-700 hover:border-zinc-400'
                      }`}
                  >
                    <span className="text-xs font-medium">{preset.label}</span>
                    {preset.value > 0 && (
                      <span className={`text-[10px] mt-0.5 font-mono ${selectedPreset === i ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {preset.value.toLocaleString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {/* Custom gas limit input */}
              {selectedPreset === PRESET_GAS_LIMITS.length - 1 && (
                <input
                  type="number"
                  value={customGasLimit}
                  onChange={e => setCustomGasLimit(e.target.value)}
                  placeholder="e.g. 150000"
                  className="tool-input font-mono"
                  autoFocus
                />
              )}
              {selectedPreset !== PRESET_GAS_LIMITS.length - 1 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                  <span className="text-xs text-zinc-500">Gas Limit:</span>
                  <span className="text-sm font-mono font-semibold">{gasLimit.toLocaleString()}</span>
                </div>
              )}
            </InputGroup>

            {/* Gas Speed */}
            <InputGroup label="Gas Price (Base Fee)" hint="EIP-1559 base fee — determines inclusion speed">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {GAS_SPEED_PRESETS.map((speed, i) => (
                  <button
                    key={speed.label}
                    onClick={() => setSelectedSpeed(i)}
                    className={`flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer
                      ${selectedSpeed === i
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-[var(--border)] text-zinc-700 hover:border-zinc-400'
                      }`}
                  >
                    <span className="text-sm">{speed.emoji}</span>
                    <span className="text-xs font-medium mt-1">{speed.label}</span>
                    {speed.gwei > 0 && (
                      <span className={`text-[10px] font-mono mt-0.5 ${selectedSpeed === i ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {speed.gwei} Gwei
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedSpeed === GAS_SPEED_PRESETS.length - 1 && (
                <input
                  type="number"
                  value={customGwei}
                  onChange={e => setCustomGwei(e.target.value)}
                  placeholder="e.g. 25"
                  className="tool-input font-mono"
                  autoFocus
                />
              )}
            </InputGroup>

            {/* Priority Fee */}
            <InputGroup
              label="Priority Fee / Miner Tip (Gwei)"
              hint="EIP-1559 priority fee paid directly to validators"
            >
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

        {/* ─── Results ─── */}
        <ToolSection title="Estimated Fee" description="Total gas cost for this transaction">
          {isValid ? (
            <div className="space-y-4">
              <InfoCard
                title="Fee Breakdown"
                items={[
                  { label: 'Gas Limit',      value: gasLimit.toLocaleString() },
                  { label: 'Base Fee',       value: formatGwei(baseFeeGwei) },
                  { label: 'Priority Fee',   value: formatGwei(priorityFeeGwei) },
                  { label: 'Total Gas Price',value: formatGwei(totalGasPriceGwei) },
                  { label: 'Fee (ETH)',       value: formatETH(feeWei) },
                  { label: 'Fee (USD)',       value: ethPriceNum > 0 ? formatUSD(feeWei, ethPriceNum) : '—', highlight: true },
                ]}
              />

              <ResultDisplay
                label="Raw Fee in Wei"
                value={feeWei.toString()}
                copyable
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-5 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
              <Info size={16} className="text-zinc-400 shrink-0" />
              <p className="text-sm text-zinc-500">
                Fill in all fields above to see the estimated fee.
              </p>
            </div>
          )}
        </ToolSection>

        {/* ─── Speed Comparison ─── */}
        {gasLimit > 0 && (
          <ToolSection
            title="Speed Comparison"
            description={`Estimated costs at different gas prices for ${PRESET_GAS_LIMITS[Math.min(selectedPreset, PRESET_GAS_LIMITS.length - 2)].label} (gas limit: ${gasLimit.toLocaleString()})`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Speed</th>
                    <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Base Fee</th>
                    <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total Gwei</th>
                    <th className="text-left py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cost (ETH)</th>
                    <th className="text-left py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cost (USD)</th>
                    <th className="text-right py-2.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => {
                    const total = row.gwei + priorityFeeGwei
                    const isCurrent = i === Math.min(selectedSpeed, 2)
                    return (
                      <tr
                        key={row.label}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          isCurrent ? 'bg-zinc-50' : ''
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1.5">
                            <span>{row.emoji}</span>
                            <span className={`font-medium ${isCurrent ? 'text-black' : 'text-zinc-600'}`}>{row.label}</span>
                            {isCurrent && <span className="badge-default text-[9px]">Selected</span>}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-zinc-600">{row.gwei} Gwei</td>
                        <td className="py-3 pr-4 font-mono text-zinc-600">{total.toFixed(1)} Gwei</td>
                        <td className="py-3 pr-4 font-mono">{formatETH(row.wei)}</td>
                        <td className="py-3 font-mono font-semibold">{ethPriceNum > 0 ? formatUSD(row.wei, ethPriceNum) : '—'}</td>
                        <td className="py-3 text-right text-xs text-zinc-500">{row.minutes}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </ToolSection>
        )}

        {/* ─── Formula ─── */}
        <ToolSection title="How Gas Fees Are Calculated">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] font-mono text-sm">
              <p className="text-zinc-500 mb-1 text-xs">Formula (EIP-1559)</p>
              <p className="text-black font-semibold">
                Fee (Wei) = Gas Limit × (Base Fee + Priority Fee)
              </p>
              <p className="text-zinc-500 mt-1">1 Gwei = 1,000,000,000 Wei &nbsp;·&nbsp; 1 ETH = 1,000,000,000 Gwei</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600">
              <div className="p-3 rounded-lg border border-[var(--border)]">
                <p className="font-semibold text-black mb-1">Gas Limit</p>
                <p>The maximum amount of gas your transaction is allowed to consume. Unused gas is refunded.</p>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)]">
                <p className="font-semibold text-black mb-1">Base Fee</p>
                <p>Network-set price per gas unit, burned on execution. Fluctuates with network demand (EIP-1559).</p>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)]">
                <p className="font-semibold text-black mb-1">Priority Fee</p>
                <p>Tip paid directly to validators to incentivize faster inclusion in the next block.</p>
              </div>
            </div>
          </div>
        </ToolSection>

        {/* Reset */}
        <div className="flex justify-end">
          <button onClick={handleReset} className="btn-secondary gap-2 text-xs">
            <RefreshCw size={12} />
            Reset Calculator
          </button>
        </div>

      </div>
    </ToolLayout>
  )
}