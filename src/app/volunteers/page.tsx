import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { VolunteersAdminClient } from '@/components/volunteers/VolunteersAdminClient'
import type { UserRole } from '@/types'

export default async function VolunteersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (!['superadmin', 'administrator', 'imagine'].includes(role)) redirect('/dashboard')

  const [records, events] = await Promise.all([
    prisma.volunteerRecord.findMany({
      include: {
        event: { select: { id: true, title: true, startDate: true, endDate: true, status: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { preregisteredAt: 'desc' },
    }),
    prisma.event.findMany({
      where: { status: { in: ['approved', 'open', 'closed'] } },
      select: { id: true, title: true, startDate: true, status: true },
      orderBy: { startDate: 'desc' },
    }),
  ])

  const stats = {
    total: records.length,
    preregistered: records.filter(r => r.status === 'preregistered').length,
    confirmed: records.filter(r => r.status === 'confirmed').length,
    checkedIn: records.filter(r => r.status === 'checked_in').length,
    absent: records.filter(r => r.status === 'absent').length,
  }

  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header title="Voluntariat" subtitle={`${stats.total} înregistrări totale`} />
      <div className="p-6">
        <VolunteersAdminClient
          records={JSON.parse(JSON.stringify(records))}
          events={JSON.parse(JSON.stringify(events))}
          stats={stats}
          currentRole={role}
        />
      </div>
    </DashboardLayout>
  )
}
