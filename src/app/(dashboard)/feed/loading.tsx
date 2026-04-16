import { SkeletonFeedItem } from '@/components/ui/skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function FeedLoading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Feed items */}
      <SkeletonFeedItem />
      <SkeletonFeedItem />
      <SkeletonFeedItem />
    </div>
  )
}
