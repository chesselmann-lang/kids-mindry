import { Skeleton } from '@/components/ui/skeleton'

export default function GalerieLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Privacy notice */}
      <Skeleton className="h-14 rounded-2xl" />

      {/* Albums grid */}
      <div>
        <Skeleton className="h-4 w-16 mb-3 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card overflow-hidden p-0">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div>
        <Skeleton className="h-4 w-28 mb-3 rounded" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
