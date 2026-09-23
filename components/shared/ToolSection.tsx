interface ToolSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ToolSection({ title, description, children, className = '' }: ToolSectionProps) {
  return (
    <section className={`rounded-xl border border-[var(--border)] bg-white overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]">
          {title && <h2 className="text-sm font-semibold text-black">{title}</h2>}
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  )
}

interface InputGroupProps {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

export function InputGroup({ label, hint, error, children, required }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-black">
        {label}
        {required && <span className="text-zinc-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-zinc-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface InfoCardProps {
  title: string
  items: { label: string; value: string; highlight?: boolean }[]
}

export function InfoCard({ title, items }: InfoCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              item.highlight ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            <span className={`text-xs ${item.highlight ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {item.label}
            </span>
            <span className={`text-sm font-semibold font-mono ${item.highlight ? 'text-white' : 'text-black'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}