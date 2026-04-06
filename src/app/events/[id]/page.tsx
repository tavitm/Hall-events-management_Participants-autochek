import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { EventDetailClient } from '@/components/events/EventDetailClient'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'
import { canEditEvent, canSeeFullEventSheet } from '@/lib/permissions'
import { hoursUntilEvent } from '@/lib/utils'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const { id } = await params
  const role = session.user.role as UserRole

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true, organizatorEntity: true, organizatorType: true, phone: true } },
      validator: { select: { id: true, name: true } },
      opener: { select: { id: true, name: true } },
      closer: { select: { id: true, name: true } },
      eventSpaces: { include: { space: true } },
      volunteerRecords: {
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { preregisteredAt: 'asc' },
      },
      observations: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
      equipment: true,
      certificates: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })

  if (!event) notFound()

  const hours = hoursUntilEvent(event.startDate)
  const canEdit = canEditEvent(role, event.status as any, hours)
  const isOwner = event.organizatorId === session.user.id
  const fullSheet = canSeeFullEventSheet(role)

  const user = { name: session.user.name, email: session.user.email, role, organizatorEntity: session.user.organizatorEntity }

  return (
    <DashboardLayout user={user}>
      <Header
        title={event.title}
        subtitle={`Eveniment · ${event.eventType}`}
        actions={
          <div className="flex gap-2">
            <Link href="/events" className="btn btn-secondary btn-sm">
              <ArrowLeft className="w-3 h-3" /> Înapoi
            </Link>
            {canEdit && (
              <Link href={`/events/${id}/edit`} className="btn btn-primary btn-sm">
                <Edit className="w-3 h-3" /> Editează
              </Link>
            )}
          </div>
        }
      />
      <div className="p-6">
        <EventDetailClient
          event={JSON.parse(JSON.stringify(event))}
          role={role}
          userId={session.user.id}
          fullSheet={fullSheet}
        />
      </div>
    </DashboardLayout>
  )
}
