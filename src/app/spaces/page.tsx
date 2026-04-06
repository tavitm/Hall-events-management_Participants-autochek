import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { SpacesClient } from '@/components/spaces/SpacesClient'
import type { UserRole } from '@/types'
import { canManageSpaces } from '@/lib/permissions'

export default async function SpacesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (!canManageSpaces(role)) redirect('/dashboard')

  const spaces = await prisma.space.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { eventSpaces: true } },
    },
  })

  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header title="Săli & Spații" subtitle={`${spaces.length} spații configurate`} />
      <div className="p-6">
        <SpacesClient spaces={JSON.parse(JSON.stringify(spaces))} />
      </div>
    </DashboardLayout>
  )
}
