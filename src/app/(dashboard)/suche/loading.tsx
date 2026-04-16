import { Skeleton } from '@/components/ui/skeleton'

export default function SucheLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-20" />
      {/* Search bar */}
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  )
}
