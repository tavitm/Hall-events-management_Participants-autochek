import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canCloseEvent } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canCloseEvent(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const { actualParticipants } = await req.json().catch(() => ({}))
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: 'Eveniment negăsit' }, { status: 404 })
    if (event.status !== 'open') {
      return NextResponse.json({ error: 'Evenimentul nu este deschis' }, { status: 400 })
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: 'closed',
        closedById: session.user.id,
        closedAt: new Date(),
        attendanceQrExpiry: new Date(), // Invalidate QR immediately
        actualParticipants: actualParticipants ? Number(actualParticipants) : null,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
