import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { EventsClientPage } from '@/components/events/EventsClientPage'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

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
          eventSpaces: { include: { space: { select: { name: true, type: true } } }, take: 2 },
          _count: { select: { volunteerRecords: true } },
        },
      },
    },
    orderBy: { event: { startDate: 'asc' } },
  })

  const events = records.map((r: any) => ({ ...r.event, myStatus: r.status, checkedInAt: r.checkedInAt }))
  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Evenimentele Mele"
        subtitle={`${events.length} înregistrări ca voluntar`}
        actions={<Link href="/events" className="btn btn-primary btn-sm"><Calendar className="w-3.5 h-3.5" /> Explorează</Link>}
      />
      <div className="p-6">
        <EventsClientPage events={JSON.parse(JSON.stringify(events))} role={role} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
