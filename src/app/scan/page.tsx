import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { QRScanner } from '@/components/scan/QRScanner'
import type { UserRole } from '@/types'

export const metadata = {
  title: 'Scanează QR | USVT Events',
}

export default async function ScanPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Only volunteers (and admins) can use the scanner
  const allowedRoles: UserRole[] = ['voluntar', 'superadmin', 'administrator', 'imagine', 'organizator']
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect('/dashboard')
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as UserRole,
  }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Scanează QR Eveniment"
        subtitle="Înregistrează-ți prezența la un eveniment activ"
      />
      <div className="p-4 sm:p-6">
        <QRScanner />
      </div>
    </DashboardLayout>
  )
}
