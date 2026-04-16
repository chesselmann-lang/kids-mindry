import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export function Spinner({ size = 'md', className, label = 'Lädt...' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-block', className)}>
      <span
        className={cn(
          'block rounded-full border-gray-200 border-t-brand-600 animate-spin',
          sizes[size]
        )}
      />
    </span>
  )
}

export function FullPageSpinner({ label = 'Lädt...' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" label={label} />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
