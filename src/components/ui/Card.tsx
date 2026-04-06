import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
  onClick?: () => void
}

export function Card({ children, className, elevated, onClick }: CardProps) {
  return (
    <div
      className={cn('card p-6', elevated && 'card-elevated', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold text-gray-900', className)}>{children}</h3>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>
}
