import { SkeletonCard } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
      <SkeletonCard rows={3} />
      <SkeletonCard rows={2} />
      <SkeletonCard rows={4} />
    </div>
  )
}
