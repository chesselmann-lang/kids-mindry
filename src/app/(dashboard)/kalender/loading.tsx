import { Skeleton } from '@/components/ui/skeleton'

export default function KalenderLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Month header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 rounded" />
          ))}
        </div>
        {/* Calendar grid */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={col} className="h-9 rounded-lg" />
            ))}
          </div>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
