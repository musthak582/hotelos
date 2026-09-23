import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Tool, TOOLS } from '@/lib/tools-registry'
import { ToolCard } from '@/components/shared/ToolCard'

type LucideIconName = keyof typeof Icons

function DynIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = Icons[name as LucideIconName] as React.ElementType | undefined
  return Icon ? <Icon size={size} /> : null
}

interface ToolLayoutProps {
  tool: Tool
  children: React.ReactNode
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  // Get related tools from same category
  const related = TOOLS
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href={`/?category=${encodeURIComponent(tool.category)}`} className="hover:text-black transition-colors">
              {tool.category}
            </Link>
            <ChevronRight size={12} />
            <span className="text-black font-medium">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Tool header */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-[var(--border)] flex items-center justify-center shrink-0">
                  <DynIcon name={tool.icon} size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                      Tool #{tool.id} · {tool.category}
                    </span>
                    {tool.isPopular && (
                      <span className="badge-default text-[10px]">Popular</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-black tracking-tight">{tool.name}</h1>
                </div>
              </div>
              <p className="text-base text-zinc-600 max-w-2xl">{tool.description}</p>
            </div>

            {/* Tool content */}
            {children}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Back link */}
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors"
              >
                <ArrowLeft size={14} />
                All Tools
              </Link>

              {/* Tags */}
              {tool.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map(tag => (
                      <span key={tag} className="badge-default">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related tools */}
              {related.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Related Tools
                  </p>
                  <div className="space-y-2">
                    {related.map(t => (
                      <ToolCard key={t.slug} tool={t} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}