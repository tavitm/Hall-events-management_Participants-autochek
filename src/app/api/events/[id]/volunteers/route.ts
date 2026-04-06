import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    const { id } = await params
    const { role: volunteerRole, notes } = await req.json().catch(() => ({}))

    // Check event exists and is in valid state
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: 'Eveniment negăsit' }, { status: 404 })
    if (['cancelled', 'closed'].includes(event.status)) {
      return NextResponse.json({ error: 'Nu vă puteți pre-înregistra la acest eveniment' }, { status: 400 })
    }

    // Only voluntar role can self-register
    if (session.user.role !== 'voluntar') {
      return NextResponse.json({ error: 'Doar voluntarii pot folosi această funcție' }, { status: 403 })
    }

    const existing = await prisma.volunteerRecord.findUnique({
      where: { eventId_userId: { eventId: id, userId: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: 'Ești deja înregistrat' }, { status: 409 })

    const record = await prisma.volunteerRecord.create({
      data: {
        eventId: id,
        userId: session.user.id,
        role: volunteerRole,
        notes,
        status: 'preregistered',
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
