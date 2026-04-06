import { cn } from '@/lib/utils'
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from '@/types'
import type { EventStatus } from '@/types'

export function StatusBadge({ status }: { status: EventStatus | string }) {
  const s = status as EventStatus
  const isOpen = s === 'open'
  const isCancelled = s === 'cancelled'
  const isSubmitted = s === 'submitted'

  return (
    <span className={cn('status-badge', EVENT_STATUS_COLORS[s] || 'bg-gray-100 text-gray-600')}>
      {/* Dot — pulses for active events, static otherwise */}
      <span className={cn(
        'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
        isOpen && 'animate-pulse',
        isOpen ? 'bg-green-500' :
        isSubmitted ? 'bg-amber-400' :
        isCancelled ? 'bg-red-400' :
        'bg-current opacity-50',
      )} />
      {EVENT_STATUS_LABELS[s] || status}
    </span>
  )
}
