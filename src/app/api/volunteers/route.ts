import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/volunteers — returns all volunteer records (admin/imagine only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })

    const role = session.user.role
    if (!['superadmin', 'administrator', 'imagine'].includes(role)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')

    const where: any = {}
    if (eventId) where.eventId = eventId
    if (status) where.status = status

    const records = await prisma.volunteerRecord.findMany({
      where,
      include: {
        event: { select: { id: true, title: true, startDate: true, endDate: true, status: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { preregisteredAt: 'desc' },
    })

    return NextResponse.json(records)
  } catch {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

// PATCH /api/volunteers — update a volunteer record status (manual check-in/out by admin)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })

    const role = session.user.role
    if (!['superadmin', 'administrator', 'imagine'].includes(role)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Date lipsă' }, { status: 400 })

    const updateData: any = { status }
    if (status === 'checked_in') updateData.checkedInAt = new Date()
    if (status === 'checked_out') updateData.checkedOutAt = new Date()

    const updated = await prisma.volunteerRecord.update({
      where: { id },
      data: updateData,
      include: {
        event: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
