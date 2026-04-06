import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { Calendar, ScanLine, CheckCircle, Clock, XCircle, ArrowRight, Award } from 'lucide-react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { StatusBadge } from '@/components/events/StatusBadge'

const STATUS_CONFIG = {
  checked_in:    { label: 'Prezent', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  preregistered: { label: 'Înregistrat', icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-200' },
  confirmed:     { label: 'Confirmat',   icon: CheckCircle, color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-200' },
  absent:        { label: 'Absent',      icon: XCircle,     color: 'text-gray-400',  bg: 'bg-gray-50',   border: 'border-gray-200' },
}

export default async function MyEventsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole

  const records = await prisma.volunteerRecord.findMany({
    where: { userId: session.user.id },
    include: {
      event: {
        include: {
          creator: { select: { id: true, name: true, organizatorEntity: true } },
          eventSpaces: { include: { space: { select: { name: true, type: true } } }, take: 1 },
          _count: { select: { volunteerRecords: true } },
        },
      },
    },
    orderBy: { event: { startDate: 'desc' } },
  })

  const checkins = records.filter((r: any) => r.status === 'checked_in').length
  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Evenimentele Mele"
        subtitle={`${records.length} înregistrări · ${checkins} prezențe confirmate`}
        actions={
          <div className="flex gap-2">
            <Link href="/scan" className="btn btn-primary btn-sm">
              <ScanLine className="w-3.5 h-3.5" /> Scanează QR
            </Link>
            <Link href="/events" className="btn btn-secondary btn-sm">
              <Calendar className="w-3.5 h-3.5" /> Explorează
            </Link>
          </div>
        }
      />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Scan CTA — shown if no check-ins yet */}
        {checkins === 0 && records.length === 0 && (
          <Link href="/scan" className="block group">
            <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-all hover:shadow-lg"
                 style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #2563eb 100%)' }}>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <ScanLine className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">Nu ai niciun eveniment înregistrat</p>
                <p className="text-blue-200 text-sm mt-1">
                  Scanează codul QR de la un eveniment activ pentru a-ți înregistra prezența
                </p>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold text-sm bg-white/15 px-4 py-2 rounded-xl group-hover:bg-white/25 transition-colors flex-shrink-0">
                <ScanLine className="w-4 h-4" /> Scanează Acum
              </div>
            </div>
          </Link>
        )}

        {records.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Istoricul Participărilor</h2>
              <Link href="/scan"
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ background: '#1a3a6e' }}>
                <ScanLine className="w-3.5 h-3.5" /> Scanează QR
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {records.map((rec: any) => {
                const ev = rec.event
                const cfg = STATUS_CONFIG[rec.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.preregistered
                const Icon = cfg.icon
                const isPast = new Date(ev.endDate) < new Date()
                const isActive = ev.status === 'open'

                return (
                  <div key={rec.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50/60 transition-colors">
                    {/* Date badge */}
                    <Link href={`/events/${ev.id}`} className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold"
                           style={{ background: isActive ? '#2e7d32' : isPast ? '#6b7280' : '#1a3a6e' }}>
                        <span className="text-sm sm:text-base leading-tight">
                          {format(new Date(ev.startDate), 'd')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase leading-tight">
                          {format(new Date(ev.startDate), 'MMM', { locale: ro })}
                        </span>
                      </div>
                    </Link>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/events/${ev.id}`} className="font-semibold text-sm text-gray-900 hover:text-blue-700 truncate block">
                        {ev.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {ev.creator?.organizatorEntity || ev.creator?.name} ·{' '}
                        {format(new Date(ev.startDate), 'd MMM yyyy · HH:mm', { locale: ro })}
                      </p>
                      {/* Check-in timestamp */}
                      {rec.checkedInAt && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Check-in: {format(new Date(rec.checkedInAt), 'd MMM yyyy · HH:mm', { locale: ro })}
                        </p>
                      )}
                    </div>

                    {/* Right side: status + event status */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {/* Volunteer attendance status */}
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </span>
                      {/* Event status */}
                      <StatusBadge status={ev.status} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer with links */}
            <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <Link href="/my-certificates"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium">
                <Award className="w-3.5 h-3.5" /> Adeverințele Mele
              </Link>
              <Link href="/events"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium">
                Explorează evenimente <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
