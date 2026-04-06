import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCertificateNo } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (session.user.role !== 'voluntar') {
      return NextResponse.json({ error: 'Doar voluntarii pot face check-in prin QR' }, { status: 403 })
    }

    const { token } = await params

    // Find event by attendance token
    const event = await prisma.event.findUnique({
      where: { attendanceQrToken: token },
      select: {
        id: true, title: true, startDate: true, endDate: true,
        status: true, attendanceQrExpiry: true, organizatorEntity: true,
      },
    })
    if (!event) return NextResponse.json({ error: 'QR Code invalid sau expirat' }, { status: 404 })
    if (event.status !== 'open') {
      return NextResponse.json({ error: 'Evenimentul nu este activ în acest moment' }, { status: 400 })
    }
    if (event.attendanceQrExpiry && new Date() > event.attendanceQrExpiry) {
      return NextResponse.json({ error: 'QR Code expirat' }, { status: 400 })
    }

    // Find or create volunteer record
    let record = await prisma.volunteerRecord.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
    })

    if (record?.status === 'checked_in') {
      // Already checked in — return existing certificate if any
      const cert = await prisma.certificate.findUnique({
        where: { eventId_userId_type: { eventId: event.id, userId: session.user.id, type: 'voluntar' } },
      })
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: `Ești deja înregistrat la "${event.title}".`,
        event,
        certificate: cert,
      })
    }

    if (!record) {
      record = await prisma.volunteerRecord.create({
        data: {
          eventId: event.id,
          userId: session.user.id,
          status: 'checked_in',
          checkedInAt: new Date(),
        },
      })
    } else {
      record = await prisma.volunteerRecord.update({
        where: { id: record.id },
        data: { status: 'checked_in', checkedInAt: new Date() },
      })
    }

    // ─── Generează automat adeverința ─────────────────────────────────────
    const certNo = generateCertificateNo(event.id, session.user.id)
    const certificate = await prisma.certificate.upsert({
      where: { eventId_userId_type: { eventId: event.id, userId: session.user.id, type: 'voluntar' } },
      create: {
        eventId: event.id,
        userId: session.user.id,
        certificateNo: certNo,
        type: 'voluntar',
      },
      update: {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, startDate: true, endDate: true, organizatorEntity: true } },
      },
    })
    // ──────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: `Bun venit la "${event.title}"! Prezența a fost înregistrată.`,
      event,
      record,
      certificate,
    })
  } catch (error) {
    console.error('checkin error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
