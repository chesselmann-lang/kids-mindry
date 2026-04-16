import { Skeleton, SkeletonListItem } from '@/components/ui/skeleton'

export default function KinderLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>

      {/* Group filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* List */}
      <div className="card overflow-hidden p-0 divide-y divide-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  )
}
