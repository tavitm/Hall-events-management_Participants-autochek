import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCertificateNo } from '@/lib/utils'
import type { UserRole } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })

    const where: any = {}
    if (session.user.role === 'voluntar') {
      where.userId = session.user.id
    } else if (!['superadmin', 'administrator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    const certs = await prisma.certificate.findMany({
      where,
      include: {
        event: { select: { id: true, title: true, startDate: true, endDate: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { issuedAt: 'desc' },
    })
    return NextResponse.json(certs)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (session.user.role !== 'voluntar') {
      return NextResponse.json({ error: 'Doar voluntarii pot genera adeverințe' }, { status: 403 })
    }

    const { eventId, type = 'voluntar' } = await req.json()

    // Check user has a check-in record for this event
    const record = await prisma.volunteerRecord.findUnique({
      where: { eventId_userId: { eventId, userId: session.user.id } },
    })
    if (!record || !['checked_in'].includes(record.status)) {
      return NextResponse.json({ error: 'Nu aveți prezență confirmată la acest eveniment' }, { status: 400 })
    }

    // Upsert certificate
    const certNo = generateCertificateNo(eventId, session.user.id)
    const cert = await prisma.certificate.upsert({
      where: { eventId_userId_type: { eventId, userId: session.user.id, type } },
      create: {
        eventId,
        userId: session.user.id,
        certificateNo: certNo,
        type,
      },
      update: { issuedAt: new Date() },
      include: {
        event: { select: { id: true, title: true, startDate: true, endDate: true, organizatorEntity: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return NextResponse.json(cert, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
