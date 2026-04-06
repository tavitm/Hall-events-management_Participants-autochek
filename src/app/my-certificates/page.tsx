import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { CertificatesClient } from '@/components/certificates/CertificatesClient'
import type { UserRole } from '@/types'

export default async function MyCertificatesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (role !== 'voluntar') redirect('/dashboard')

  const certs = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      event: { select: { id: true, title: true, startDate: true, endDate: true, organizatorEntity: true } },
    },
    orderBy: { issuedAt: 'desc' },
  })

  // Events where user has check-in but no cert yet
  const checkedInEvents = await prisma.volunteerRecord.findMany({
    where: { userId: session.user.id, status: 'checked_in' },
    include: {
      event: { select: { id: true, title: true, startDate: true, endDate: true, organizatorEntity: true, status: true } },
    },
  })

  const user = { name: session.user.name, email: session.user.email, role, organizatorEntity: session.user.organizatorEntity }

  return (
    <DashboardLayout user={user}>
      <Header title="Adeverințele Mele" subtitle={`${certs.length} adeverințe generate`} />
      <div className="p-6">
        <CertificatesClient
          certificates={JSON.parse(JSON.stringify(certs))}
          checkedInEvents={JSON.parse(JSON.stringify(checkedInEvents))}
          user={{ id: session.user.id, name: session.user.name, email: session.user.email }}
        />
      </div>
    </DashboardLayout>
  )
}
