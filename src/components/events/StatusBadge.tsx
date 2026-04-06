import { cn } from '@/lib/utils'
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from '@/types'
import type { EventStatus } from '@/types'

const STATUS_DOTS: Record<EventStatus, string> = {
  draft: '●',
  submitted: '●',
  validated: '●',
  approved: '●',
  open: '●',
  closed: '●',
  cancelled: '●',
}

export function StatusBadge({ status }: { status: EventStatus | string }) {
  const s = status as EventStatus
  return (
    <span className={cn('status-badge', EVENT_STATUS_COLORS[s] || 'bg-gray-100 text-gray-600')}>
      <span className="text-[8px]">●</span>
      {EVENT_STATUS_LABELS[s] || status}
    </span>
  )
}
