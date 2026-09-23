import Link from 'next/link'
import { Zap } from 'lucide-react'
import { CATEGORIES, getToolsByCategory } from '@/lib/tools-registry'

export function Footer() {
  const popularCategories = CATEGORIES.slice(0, 3)

  return (
    <footer className="border-t border-[var(--border)] bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-base mb-3">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span>web3tools</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              100+ free professional tools for Web3 developers, traders, and DeFi users.
            </p>
            <p className="text-xs text-zinc-400 mt-4">
              © {new Date().getFullYear()} Web3Tools. All rights reserved.
            </p>
          </div>

          {/* Tool categories */}
          {popularCategories.map(cat => {
            const tools = getToolsByCategory(cat).slice(0, 5)
            return (
              <div key={cat}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  {cat}
                </h4>
                <ul className="space-y-2">
                  {tools.map(tool => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-sm text-zinc-600 hover:text-black transition-colors"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className="text-xs text-zinc-400 hover:text-black transition-colors"
                    >
                      View all →
                    </Link>
                  </li>
                </ul>
              </div>
            )
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
            <span>100 tools total</span>
            <span>·</span>
            <span>Free forever</span>
            <span>·</span>
            <span>No signup required</span>
            <span>·</span>
            <span>Open source friendly</span>
          </div>
          <div className="flex gap-4 text-xs text-zinc-400">
            <Link href="/" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/" className="hover:text-black transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}