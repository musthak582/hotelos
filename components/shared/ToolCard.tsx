import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Tool } from '@/lib/tools-registry'

type LucideIconName = keyof typeof Icons

function DynIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = Icons[name as LucideIconName] as React.ElementType | undefined
  return Icon ? <Icon size={size} /> : null
}

interface ToolCardProps {
  tool: Tool
  variant?: 'default' | 'compact'
}

export function ToolCard({ tool, variant = 'default' }: ToolCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-white hover:border-zinc-300 hover:shadow-sm transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-md bg-zinc-50 border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:bg-zinc-100 transition-colors">
          <DynIcon name={tool.icon} size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-black truncate">{tool.name}</p>
          <p className="text-xs text-zinc-500 truncate">{tool.description}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col p-5 rounded-xl border border-[var(--border)] bg-white hover:border-zinc-300 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-[var(--border)] flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
          <DynIcon name={tool.icon} size={18} />
        </div>
        <div className="flex gap-1.5">
          {tool.isPopular && (
            <span className="badge-default text-[10px]">Popular</span>
          )}
          {tool.isNew && (
            <span className="badge bg-black text-white text-[10px]">New</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-black mb-1 group-hover:underline underline-offset-2 decoration-zinc-300">
          {tool.name}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
          #{tool.id}
        </span>
        <span className="text-xs text-zinc-400 group-hover:text-black transition-colors">
          Open →
        </span>
      </div>
    </Link>
  )
}