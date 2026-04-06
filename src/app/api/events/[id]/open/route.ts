import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canOpenEvent } from '@/lib/permissions'
import type { UserRole } from '@/types'
import QRCode from 'qrcode'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canOpenEvent(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: 'Eveniment negăsit' }, { status: 404 })
    if (!['validated', 'approved', 'draft', 'submitted'].includes(event.status)) {
      return NextResponse.json({ error: 'Evenimentul nu poate fi deschis' }, { status: 400 })
    }

    // Generate unique attendance token
    const token = randomBytes(32).toString('hex')
    const qrUrl = `${process.env.NEXTAUTH_URL}/checkin/${token}`
    const attendanceQr = await QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#2e7d32', light: '#ffffff' },
    })

    // Expiry = event end date
    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: 'open',
        openedById: session.user.id,
        openedAt: new Date(),
        attendanceQrCode: attendanceQr,
        attendanceQrToken: token,
        attendanceQrExpiry: event.endDate,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('open event error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
