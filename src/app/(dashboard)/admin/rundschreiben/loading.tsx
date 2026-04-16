export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-48" />
      <div className="grid grid-cols-2 gap-3">
        <div className="card h-24" />
        <div className="card h-24" />
      </div>
      <div className="card h-96" />
    </div>
  )
}
