import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { CalendarClient } from '@/components/calendar/CalendarClient'
import type { UserRole } from '@/types'

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole

  const events = await prisma.event.findMany({
    where: role === 'voluntar'
      ? { status: { in: ['validated','approved','open'] }, isPublic: true }
      : role === 'organizator'
      ? { organizatorId: session.user.id }
      : {},
    include: {
      eventSpaces: { include: { space: { select: { name: true, type: true } } } },
      creator: { select: { name: true, organizatorEntity: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  const spaces = await prisma.space.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })

  const user = { name: session.user.name, email: session.user.email, role, organizatorEntity: session.user.organizatorEntity }

  return (
    <DashboardLayout user={user}>
      <Header title="Calendar Evenimente" subtitle="Vizualizare ocupare săli și program evenimente" />
      <div className="p-6">
        <CalendarClient
          events={JSON.parse(JSON.stringify(events))}
          spaces={JSON.parse(JSON.stringify(spaces))}
          role={role}
        />
      </div>
    </DashboardLayout>
  )
}
