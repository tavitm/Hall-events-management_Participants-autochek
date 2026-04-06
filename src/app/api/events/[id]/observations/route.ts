import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAddObservation } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canAddObservation(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const { content, category, isUrgent } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Conținut lipsă' }, { status: 400 })

    const obs = await prisma.observation.create({
      data: {
        eventId: id,
        userId: session.user.id,
        content: content.trim(),
        category: category || 'general',
        isUrgent: !!isUrgent,
      },
      include: { user: { select: { id: true, name: true, role: true } } },
    })
    return NextResponse.json(obs, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
