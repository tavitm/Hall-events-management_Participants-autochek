import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { AllCertificatesClient } from '@/components/certificates/AllCertificatesClient'
import type { UserRole } from '@/types'
import { canViewAllCertificates } from '@/lib/permissions'

export default async function CertificatesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (!canViewAllCertificates(role)) redirect('/dashboard')

  const certs = await prisma.certificate.findMany({
    include: {
      event: { select: { id: true, title: true, startDate: true, endDate: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { issuedAt: 'desc' },
  })

  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header title="Adeverințe" subtitle={`${certs.length} adeverințe emise`} />
      <div className="p-6">
        <AllCertificatesClient
          certificates={JSON.parse(JSON.stringify(certs))}
        />
      </div>
    </DashboardLayout>
  )
}
