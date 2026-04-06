import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { EventForm } from '@/components/events/EventForm'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { canCreateEvent } from '@/lib/permissions'

export default async function NewEventPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = session.user.role as UserRole
  if (!canCreateEvent(role)) redirect('/events')

  const spaces = await prisma.space.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  const user = { name: session.user.name, email: session.user.email, role, organizatorEntity: session.user.organizatorEntity }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Eveniment Nou"
        subtitle="Completați informațiile evenimentului"
        actions={
          <Link href="/events" className="btn btn-secondary btn-sm">
            <ArrowLeft className="w-3 h-3" /> Înapoi
          </Link>
        }
      />
      <div className="p-6">
        <EventForm
          spaces={JSON.parse(JSON.stringify(spaces))}
          user={{ id: session.user.id, role, organizatorEntity: session.user.organizatorEntity, name: session.user.name }}
        />
      </div>
    </DashboardLayout>
  )
}
