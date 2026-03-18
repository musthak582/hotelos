import Link from "next/link";
import {
  Hotel, BarChart3, CalendarDays, BedDouble,
  Users, Shield, ArrowRight, Check, Star,
} from "lucide-react";

const FEATURES = [
  { icon: BedDouble,    title: "Room Management",    desc: "Add, edit and track every room — status, pricing, and availability in real time." },
  { icon: CalendarDays, title: "Booking Calendar",   desc: "Visual grid calendar showing every room's occupancy across the month." },
  { icon: BarChart3,    title: "Revenue Analytics",  desc: "Monthly revenue charts, occupancy trends, and top guest insights." },
  { icon: Users,        title: "Guest Directory",    desc: "Auto-built guest profiles with booking history and spend tracking." },
  { icon: Shield,       title: "Multi-tenant Auth",  desc: "Each hotel owner gets isolated data. Role-based access for staff." },
  { icon: Hotel,        title: "Multi-property",     desc: "Built for scale — manage multiple properties from one account." },
];

const STATS = [
  { value: "500+", label: "Hotels" },
  { value: "98%",  label: "Uptime"  },
  { value: "2min", label: "Setup"   },
  { value: "24/7", label: "Support" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Nav */}
      <nav className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Hotel className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">HotelOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 font-medium mb-8">
            <Star className="w-3 h-3 fill-indigo-400 text-indigo-400" />
            Trusted by 500+ hotel owners worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Hotel management
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              built for owners
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            HotelOS is the all-in-one platform to manage rooms, bookings,
            guests, and revenue — without the enterprise price tag.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-300 hover:text-white px-8 py-3.5 rounded-xl font-medium text-base border border-white/10 hover:border-white/20 transition-all"
            >
              View demo
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            No credit card required · Setup in 2 minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to run your hotel
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From single boutique hotels to multi-property portfolios —
            HotelOS scales with you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="group bg-slate-900/50 border border-white/[0.06] rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors">
                <feature.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to modernize your hotel?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Join hundreds of hotel owners who switched from spreadsheets to HotelOS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold shadow-xl shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
              >
                Start free today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {["Free forever plan", "No setup fees", "Cancel anytime", "GDPR compliant"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Hotel className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">HotelOS</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} HotelOS. Built with Next.js, Prisma & NeonDB.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}