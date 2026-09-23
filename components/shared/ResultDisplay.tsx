import { CopyButton } from './CopyButton'

interface ResultDisplayProps {
  label?: string
  value: string
  mono?: boolean
  copyable?: boolean
  highlight?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ResultDisplay({
  label,
  value,
  mono = true,
  copyable = true,
  highlight = false,
  size = 'md',
}: ResultDisplayProps) {
  const sizeClass = {
    sm: 'text-xs py-2.5 px-3',
    md: 'text-sm py-3 px-4',
    lg: 'text-base py-4 px-5',
  }[size]

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-black">{label}</label>
          {copyable && value && <CopyButton value={value} />}
        </div>
      )}
      <div
        className={`w-full rounded-lg border ${
          highlight
            ? 'border-black bg-black text-white'
            : 'border-[var(--border)] bg-[var(--muted)] text-black'
        } ${sizeClass} ${mono ? 'font-mono' : ''} break-all select-all leading-relaxed`}
      >
        {value || <span className="opacity-30">Result will appear here</span>}
      </div>
      {!label && copyable && value && (
        <div className="flex justify-end">
          <CopyButton value={value} />
        </div>
      )}
    </div>
  )
}