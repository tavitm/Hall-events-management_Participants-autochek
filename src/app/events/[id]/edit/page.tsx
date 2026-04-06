import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import { EventForm } from '@/components/events/EventForm'
import type { UserRole } from '@/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { canEditEvent } from '@/lib/permissions'
import { hoursUntilEvent } from '@/lib/utils'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const { id } = await params
  const role = session.user.role as UserRole

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      eventSpaces: { include: { space: true } },
      equipment: true,
    },
  })

  if (!event) notFound()

  const hours = hoursUntilEvent(event.startDate.toISOString())
  if (!canEditEvent(role, event.status as any, hours)) redirect(`/events/${id}`)

  const spaces = await prisma.space.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  const user = { name: session.user.name, email: session.user.email, role, organizatorEntity: session.user.organizatorEntity }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Editează Eveniment"
        subtitle={event.title}
        actions={
          <Link href={`/events/${id}`} className="btn btn-secondary btn-sm">
            <ArrowLeft className="w-3 h-3" /> Înapoi
          </Link>
        }
      />
      <div className="p-6">
        <EventForm
          spaces={JSON.parse(JSON.stringify(spaces))}
          user={{ id: session.user.id, role, organizatorEntity: session.user.organizatorEntity, name: session.user.name }}
          initialData={JSON.parse(JSON.stringify(event))}
        />
      </div>
    </DashboardLayout>
  )
}
