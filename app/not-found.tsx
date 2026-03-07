import Link from "next/link";
import { Hotel } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Hotel className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-3">404</h1>
        <p className="text-slate-400 mb-8 text-lg">This page doesn&apos;t exist.</p>
        <Link
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}