/**
 * AgeRatingBadge — KJM Altersfreigabe-Badge
 *
 * Displays a KJM-style age rating badge (0+, 3+, 6+, 10+, 12+, 16+, 18+).
 * Used on content cards, activity listings, and in the KJM meta tags.
 *
 * KJM = Kommission für Jugendmedienschutz (§ 5 JMStV)
 */

import { cn } from '@/lib/utils'

export type AgeRating = '0+' | '3+' | '6+' | '10+' | '12+' | '16+' | '18+'

interface Props {
  rating: AgeRating | string
  size?: 'xs' | 'sm' | 'md'
  className?: string
  showLabel?: boolean
}

const RATING_CONFIG: Record<string, { bg: string; text: string; border: string; emoji: string; label: string }> = {
  '0+':  { bg: 'bg-green-100 dark:bg-green-950/50',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-300 dark:border-green-700',  emoji: '🟢', label: 'Für alle' },
  '3+':  { bg: 'bg-green-100 dark:bg-green-950/50',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-300 dark:border-green-700',  emoji: '🟢', label: 'Ab 3 Jahren' },
  '6+':  { bg: 'bg-blue-100 dark:bg-blue-950/50',    text: 'text-blue-700 dark:text-blue-400',    border: 'border-blue-300 dark:border-blue-700',    emoji: '🔵', label: 'Ab 6 Jahren' },
  '10+': { bg: 'bg-yellow-100 dark:bg-yellow-950/50',text: 'text-yellow-700 dark:text-yellow-500',border: 'border-yellow-300 dark:border-yellow-700',emoji: '🟡', label: 'Ab 10 Jahren' },
  '12+': { bg: 'bg-orange-100 dark:bg-orange-950/50',text: 'text-orange-700 dark:text-orange-400',border: 'border-orange-300 dark:border-orange-700',emoji: '🟠', label: 'Ab 12 Jahren' },
  '16+': { bg: 'bg-red-100 dark:bg-red-950/50',      text: 'text-red-700 dark:text-red-400',      border: 'border-red-300 dark:border-red-700',      emoji: '🔴', label: 'Ab 16 Jahren' },
  '18+': { bg: 'bg-red-200 dark:bg-red-950/70',      text: 'text-red-800 dark:text-red-300',      border: 'border-red-400 dark:border-red-600',      emoji: '🔴', label: 'Ab 18 Jahren' },
}

const SIZE_CLASSES = {
  xs: 'text-[9px] px-1 py-0.5 rounded-md font-bold',
  sm: 'text-[10px] px-1.5 py-0.5 rounded-md font-bold',
  md: 'text-xs px-2 py-1 rounded-lg font-bold',
}

export default function AgeRatingBadge({ rating, size = 'sm', className, showLabel = false }: Props) {
  const config = RATING_CONFIG[rating] ?? RATING_CONFIG['0+']

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border',
        config.bg,
        config.text,
        config.border,
        SIZE_CLASSES[size],
        className,
      )}
      title={config.label}
      aria-label={`Altersfreigabe: ${config.label}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {rating}
      {showLabel && <span className="font-normal">&nbsp;{config.label}</span>}
    </span>
  )
}
