import { SkeletonListItem } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-2/5 mb-4" />
      <div className="card divide-y divide-gray-50">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </div>
  )
}
