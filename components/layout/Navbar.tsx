'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Zap, ChevronDown } from 'lucide-react'
import { CATEGORIES, CATEGORY_ICONS, getToolsByCategory } from '@/lib/tools-registry'
import * as Icons from 'lucide-react'

type LucideIconName = keyof typeof Icons

function DynIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = Icons[name as LucideIconName] as React.ElementType | undefined
  return Icon ? <Icon size={size} /> : null
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const isToolsPage = pathname.startsWith('/tools')

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[var(--border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-base tracking-tight">
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span>web3tools</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {CATEGORIES.map(cat => {
              const tools = getToolsByCategory(cat).slice(0, 8)
              return (
                <div
                  key={cat}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(cat)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 hover:text-black rounded-md hover:bg-zinc-50 transition-colors">
                    <DynIcon name={CATEGORY_ICONS[cat]} size={13} />
                    <span className="hidden lg:inline">{cat.replace(' Tools', '')}</span>
                    <ChevronDown size={11} className="text-zinc-400" />
                  </button>

                  {activeDropdown === cat && (
                    <div className="absolute top-full left-0 pt-1 w-64 z-50">
                      <div className="bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-[var(--border)]">
                          <p className="text-xs font-semibold text-black">{cat}</p>
                        </div>
                        <div className="py-1.5">
                          {tools.map(tool => (
                            <Link
                              key={tool.slug}
                              href={`/tools/${tool.slug}`}
                              className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 transition-colors group"
                            >
                              <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                                <DynIcon name={tool.icon} size={12} />
                              </div>
                              <span className="text-sm text-zinc-700 group-hover:text-black">{tool.name}</span>
                            </Link>
                          ))}
                          <Link
                            href={`/?category=${encodeURIComponent(cat)}`}
                            className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-[var(--border)] text-xs text-zinc-500 hover:text-black transition-colors"
                          >
                            View all {cat.toLowerCase()} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="text-sm text-zinc-600 hover:text-black px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors">
              All Tools
            </Link>
            <Link
              href="/tools/gas-fee-calculator"
              className="btn-primary text-xs"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {CATEGORIES.map(cat => (
              <div key={cat}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === cat ? null : cat)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-black rounded-lg hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-2">
                    <DynIcon name={CATEGORY_ICONS[cat]} size={14} />
                    {cat}
                  </div>
                  <ChevronDown size={13} className={`transition-transform ${activeDropdown === cat ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === cat && (
                  <div className="pl-4 space-y-0.5 mb-1">
                    {getToolsByCategory(cat).map(tool => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        <DynIcon name={tool.icon} size={12} />
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}