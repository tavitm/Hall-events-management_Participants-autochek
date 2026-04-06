import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { EventsClientPage } from '@/components/events/EventsClientPage'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { canCreateEvent } from '@/lib/permissions'

export default async function EventsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole

  const where: any = {}
  if (role === 'organizator') where.organizatorId = session.user.id
  if (role === 'voluntar') where.status = { in: ['validated','approved','open'] }

  const events = await prisma.event.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, organizatorEntity: true } },
      eventSpaces: { include: { space: { select: { name: true, type: true } } }, take: 3 },
      _count: { select: { volunteerRecords: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  const user = { name: session.user.name, email: session.user.email, role, organizatorEntity: session.user.organizatorEntity }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Evenimente"
        subtitle={`${events.length} evenimente ${role === 'organizator' ? 'create de dvs.' : 'în sistem'}`}
        actions={
          canCreateEvent(role) ? (
            <Link href="/events/new" className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Eveniment Nou
            </Link>
          ) : null
        }
      />
      <div className="p-6">
        <EventsClientPage events={JSON.parse(JSON.stringify(events))} role={role} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
