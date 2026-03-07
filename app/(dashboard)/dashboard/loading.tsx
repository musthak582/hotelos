export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-64 bg-white/[0.05] rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-white/[0.04] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white/[0.04] rounded-2xl" />
        <div className="h-80 bg-white/[0.04] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white/[0.04] rounded-2xl" />
        <div className="h-64 bg-white/[0.04] rounded-2xl" />
      </div>
    </div>
  );
}