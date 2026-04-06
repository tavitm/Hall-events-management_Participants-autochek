export default function EventsLoading() {
  return (
    <div className="p-3 sm:p-6 space-y-4 animate-pulse">
      {/* Filter bar */}
      <div className="card p-3 sm:p-4 space-y-3">
        <div className="skeleton h-9 w-full rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-9 flex-1 rounded-lg" />
          <div className="skeleton h-9 flex-1 rounded-lg" />
          <div className="skeleton h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Event cards grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="h-1.5 skeleton" />
            <div className="p-5 space-y-3">
              <div className="flex justify-between gap-2">
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-3 w-full rounded" />
              <div className="space-y-1.5">
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
