import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import type { UserRole } from '@/types'
import { Settings, Database, Users, CalendarDays, Award, Building2 } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (role !== 'superadmin') redirect('/dashboard')

  const [userCount, eventCount, spaceCount, certCount, volunteerCount] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.space.count(),
    prisma.certificate.count(),
    prisma.volunteerRecord.count(),
  ])

  const eventsByStatus = await prisma.event.groupBy({
    by: ['status'],
    _count: true,
  })

  const user = { name: session.user.name, email: session.user.email, role }

  return (
    <DashboardLayout user={user}>
      <Header title="Setări Sistem" subtitle="Configurare și statistici platformă" />
      <div className="p-6 space-y-6">

        {/* System Stats */}
        <div className="usvt-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" style={{ color: '#1a3a6e' }} />
            Statistici Bază de Date
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBox icon={<Users className="w-5 h-5" />} label="Utilizatori" value={userCount} />
            <StatBox icon={<CalendarDays className="w-5 h-5" />} label="Evenimente" value={eventCount} />
            <StatBox icon={<Building2 className="w-5 h-5" />} label="Spații" value={spaceCount} />
            <StatBox icon={<Award className="w-5 h-5" />} label="Adeverințe" value={certCount} />
            <StatBox icon={<Users className="w-5 h-5" />} label="Înreg. Voluntari" value={volunteerCount} />
          </div>
        </div>

        {/* Events by Status */}
        <div className="usvt-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: '#1a3a6e' }} />
            Evenimente pe Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {eventsByStatus.map(s => (
              <div key={s.status} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">{s._count}</p>
                <p className="text-sm text-gray-500 capitalize">{s.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="usvt-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: '#1a3a6e' }} />
            Informații Sistem
          </h2>
          <div className="space-y-3">
            <InfoRow label="Universitate" value='Universitatea de Științele Vieții "Regele Mihai I" din Timișoara' />
            <InfoRow label="Acronim" value="USVT" />
            <InfoRow label="Versiune aplicație" value="1.0.0" />
            <InfoRow label="Framework" value="Next.js 16 + Prisma 7 + SQLite" />
            <InfoRow label="Autentificare" value="NextAuth.js v5 (JWT)" />
            <InfoRow label="Roluri active" value="12 roluri (superadmin → auditor)" />
          </div>
        </div>

        {/* Roles Reference */}
        <div className="usvt-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Roluri și Permisiuni</h2>
          <div className="overflow-x-auto">
            <table className="usvt-table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Creare eveniment</th>
                  <th>Validare</th>
                  <th>Deschidere</th>
                  <th>Voluntariat</th>
                  <th>Adeverințe</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'superadmin', label: 'Super Administrator', create: true, validate: true, open: true, volunteer: true, cert: true },
                  { role: 'administrator', label: 'Administrator', create: true, validate: true, open: true, volunteer: true, cert: true },
                  { role: 'organizator', label: 'Organizator', create: true, validate: false, open: true, volunteer: false, cert: false },
                  { role: 'imagine', label: 'Departament Imagine', create: false, validate: false, open: true, volunteer: true, cert: false },
                  { role: 'rectorat', label: 'Rectorat', create: false, validate: true, open: false, volunteer: false, cert: false },
                  { role: 'voluntar', label: 'Voluntar', create: false, validate: false, open: false, volunteer: true, cert: true },
                  { role: 'sponsor', label: 'Sponsor', create: false, validate: false, open: false, volunteer: false, cert: false },
                  { role: 'agrocampus', label: 'Agrocampus', create: false, validate: false, open: false, volunteer: false, cert: false },
                  { role: 'catering_extern', label: 'Catering Extern', create: false, validate: false, open: false, volunteer: false, cert: false },
                  { role: 'tehnic', label: 'Furnizor Tehnic', create: false, validate: false, open: false, volunteer: false, cert: false },
                  { role: 'partener', label: 'Partener', create: false, validate: false, open: false, volunteer: false, cert: false },
                  { role: 'auditor', label: 'Auditor', create: false, validate: false, open: false, volunteer: false, cert: false },
                ].map(r => (
                  <tr key={r.role}>
                    <td className="font-medium">{r.label}</td>
                    <td><Check value={r.create} /></td>
                    <td><Check value={r.validate} /></td>
                    <td><Check value={r.open} /></td>
                    <td><Check value={r.volunteer} /></td>
                    <td><Check value={r.cert} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center">
      <div className="flex justify-center mb-2 text-gray-400">{icon}</div>
      <p className="text-3xl font-bold" style={{ color: '#1a3a6e' }}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}

function Check({ value }: { value: boolean }) {
  return value
    ? <span className="text-green-600 font-bold">✓</span>
    : <span className="text-gray-300">—</span>
}
