import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canCancelEvent } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canCancelEvent(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const { reason } = await req.json().catch(() => ({}))
    const updated = await prisma.event.update({
      where: { id },
      data: { status: 'cancelled', cancelledReason: reason || null },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
