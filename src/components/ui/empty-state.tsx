import type { LucideIcon } from 'lucide-react'
import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const iconSize = { sm: 28, md: 36, lg: 48 }[size]
  const iconBox = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-20 h-20' }[size]
  const padding = { sm: 'py-8', md: 'py-12', lg: 'py-16' }[size]

  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 ${padding}`}>
      <div className={`${iconBox} bg-gray-100 rounded-2xl flex items-center justify-center mb-4`}>
        <Icon size={iconSize} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
