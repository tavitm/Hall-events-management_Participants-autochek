import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canValidateEvent } from '@/lib/permissions'
import type { UserRole } from '@/types'
import QRCode from 'qrcode'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canValidateEvent(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: 'Eveniment negăsit' }, { status: 404 })
    if (!['submitted', 'draft'].includes(event.status)) {
      return NextResponse.json({ error: 'Evenimentul nu poate fi validat în starea curentă' }, { status: 400 })
    }

    // Generate promo QR code (URL to event public page)
    const promoUrl = `${process.env.NEXTAUTH_URL}/events/public/${id}`
    const promoQr = await QRCode.toDataURL(promoUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1a3a6e', light: '#ffffff' },
    })

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: 'validated',
        validatedById: session.user.id,
        validatedAt: new Date(),
        promoQrCode: promoQr,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('validate error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
