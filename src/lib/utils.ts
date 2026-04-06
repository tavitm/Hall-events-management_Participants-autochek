import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInHours, isPast, isFuture } from 'date-fns'
import { ro } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, fmt: string = 'dd MMMM yyyy'): string {
  return format(new Date(date), fmt, { locale: ro })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: ro })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm')
}

export function hoursUntilEvent(startDate: Date | string): number {
  return differenceInHours(new Date(startDate), new Date())
}

export function isEventPast(endDate: Date | string): boolean {
  return isPast(new Date(endDate))
}

export function isEventFuture(startDate: Date | string): boolean {
  return isFuture(new Date(startDate))
}

export function generateCertificateNo(eventId: string, userId: string): string {
  const year = new Date().getFullYear()
  const hash = Math.abs(
    (eventId + userId).split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0)
  ) % 100000
  return `USVT-${year}-${String(hash).padStart(5, '0')}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
