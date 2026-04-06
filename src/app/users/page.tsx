import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { UsersClient } from '@/components/users/UsersClient'
import type { UserRole } from '@/types'
import { canManageUsers } from '@/lib/permissions'

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (!canManageUsers(role)) redirect('/dashboard')

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      organizatorType: true, organizatorEntity: true, organizatorCompany: true,
      phone: true, isActive: true, createdAt: true,
      _count: { select: { createdEvents: true, volunteerRecords: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header title="Utilizatori" subtitle={`${users.length} utilizatori înregistrați`} />
      <div className="p-6">
        <UsersClient
          users={JSON.parse(JSON.stringify(users))}
          currentUserRole={role}
          currentUserId={session.user.id}
        />
      </div>
    </DashboardLayout>
  )
}
