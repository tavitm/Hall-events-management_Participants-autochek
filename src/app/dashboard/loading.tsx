export default function DashboardLoading() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
      {/* Welcome banner */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        <div className="h-20 sm:h-24 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 skeleton-shimmer" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-3 sm:p-5 border-l-4 border-gray-200">
            <div className="skeleton h-3 w-20 mb-2 rounded" />
            <div className="skeleton h-7 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between">
          <div className="skeleton h-5 w-44 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-50 last:border-0">
            <div className="skeleton w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
