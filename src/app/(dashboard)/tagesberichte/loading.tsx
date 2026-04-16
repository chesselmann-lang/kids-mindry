import { Skeleton, SkeletonListItem } from '@/components/ui/skeleton'

export default function TagesberichteLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Progress card */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3.5 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* List */}
      <div className="card overflow-hidden p-0 divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  )
}
