'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, ArrowRight, Zap, Code2, Shield, Terminal, Calculator, ArrowLeftRight, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { TOOLS, CATEGORIES, CATEGORY_DESCRIPTIONS, CATEGORY_ICONS, getToolsByCategory, searchTools, type ToolCategory } from '@/lib/tools-registry'
import { ToolCard } from '@/components/shared/ToolCard'
import * as Icons from 'lucide-react'

type LucideIconName = keyof typeof Icons
function DynIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = Icons[name as LucideIconName] as React.ElementType | undefined
  return Icon ? <Icon size={size} /> : null
}

const STATS = [
  { value: '100+', label: 'Free Tools' },
  { value: '6', label: 'Categories' },
  { value: '0', label: 'Sign-ups Needed' },
  { value: '∞', label: 'Free Forever' },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'All'>('All')

  // Sync category from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category') as ToolCategory | null
    if (cat && CATEGORIES.includes(cat)) setActiveCategory(cat)
  }, [])

  const displayedTools = useMemo(() => {
    let tools = TOOLS
    if (query.trim()) {
      tools = searchTools(query)
    } else if (activeCategory !== 'All') {
      tools = getToolsByCategory(activeCategory)
    }
    return tools
  }, [query, activeCategory])

  const popularTools = TOOLS.filter(t => t.isPopular)

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-white text-xs font-medium text-zinc-600">
              <Zap size={11} className="text-black" />
              100 free Web3 tools · No signup required
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold text-black tracking-tight leading-[1.1] mb-5">
            The Web3 Developer's
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Toolbox</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-zinc-100 -z-0 rounded" />
            </span>
          </h1>
          <p className="text-center text-base sm:text-lg text-zinc-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Gas calculators, ABI encoders, security checkers, and 90+ more tools — all free, all instant, all in one place.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search 100 tools... (e.g. gas, keccak, abi)"
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveCategory('All') }}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border)] bg-white text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm text-sm"
              />
            </div>
          </div>

          {/* Popular tools quick links */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {popularTools.map(t => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border)] bg-white text-zinc-600 hover:text-black hover:border-zinc-400 transition-all"
              >
                <DynIcon name={t.icon} size={11} />
                {t.name}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-black">{stat.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category Filter + Tools ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {!query && (
          <>
            {/* Category Cards */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-black mb-5">Browse by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer
                    ${activeCategory === 'All'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-[var(--border)] text-zinc-600 hover:border-zinc-300 hover:shadow-sm'
                    }`}
                >
                  <LayoutGrid size={20} />
                  <span className="text-xs font-medium">All Tools</span>
                  <span className={`text-xs ${activeCategory === 'All' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    {TOOLS.length}
                  </span>
                </button>

                {CATEGORIES.map(cat => {
                  const count = getToolsByCategory(cat).length
                  const isActive = activeCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-center
                        ${isActive
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-[var(--border)] text-zinc-600 hover:border-zinc-300 hover:shadow-sm'
                        }`}
                    >
                      <DynIcon name={CATEGORY_ICONS[cat]} size={20} />
                      <span className="text-xs font-medium leading-tight">
                        {cat.replace(' Tools', '')}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {activeCategory !== 'All' && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">{activeCategory}</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{CATEGORY_DESCRIPTIONS[activeCategory]}</p>
              </div>
            )}

            {activeCategory === 'All' && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">All 100 Tools</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Every tool available in one place</p>
              </div>
            )}
          </>
        )}

        {/* Search results header */}
        {query && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black">
              {displayedTools.length} result{displayedTools.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </h2>
            <button
              onClick={() => setQuery('')}
              className="text-sm text-zinc-500 hover:text-black mt-1 transition-colors"
            >
              ← Clear search
            </button>
          </div>
        )}

        {/* Tools Grid */}
        {displayedTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedTools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-sm">No tools found for &quot;{query}&quot;</p>
            <button onClick={() => setQuery('')} className="mt-3 text-sm text-black underline">
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-black mb-3">Start with the most popular tools</h2>
          <p className="text-sm text-zinc-500 mb-6">No account needed. Instant results. Works in your browser.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularTools.map(t => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="btn-primary"
              >
                <DynIcon name={t.icon} size={14} />
                {t.name}
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}