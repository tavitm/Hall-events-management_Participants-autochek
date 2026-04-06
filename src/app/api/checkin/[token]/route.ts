import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (session.user.role !== 'voluntar') {
      return NextResponse.json({ error: 'Doar voluntarii pot face check-in' }, { status: 403 })
    }
    const { token } = await params

    // Find event by attendance token
    const event = await prisma.event.findUnique({ where: { attendanceQrToken: token } })
    if (!event) return NextResponse.json({ error: 'QR Code invalid' }, { status: 404 })
    if (event.status !== 'open') {
      return NextResponse.json({ error: 'Evenimentul nu este activ' }, { status: 400 })
    }
    if (event.attendanceQrExpiry && new Date() > event.attendanceQrExpiry) {
      return NextResponse.json({ error: 'QR Code expirat' }, { status: 400 })
    }

    // Find or create volunteer record
    let record = await prisma.volunteerRecord.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
    })

    if (!record) {
      record = await prisma.volunteerRecord.create({
        data: {
          eventId: event.id,
          userId: session.user.id,
          status: 'checked_in',
          checkedInAt: new Date(),
        },
      })
    } else if (record.status === 'checked_in') {
      return NextResponse.json({ error: 'Ești deja înregistrat la acest eveniment', event }, { status: 409 })
    } else {
      record = await prisma.volunteerRecord.update({
        where: { id: record.id },
        data: { status: 'checked_in', checkedInAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Bun venit la "${event.title}"! Check-in realizat cu succes.`,
      event: { id: event.id, title: event.title, startDate: event.startDate, endDate: event.endDate },
      record,
    })
  } catch (error) {
    console.error('checkin error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
