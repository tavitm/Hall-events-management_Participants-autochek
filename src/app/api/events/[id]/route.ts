import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditEvent, canCancelEvent } from '@/lib/permissions'
import type { UserRole } from '@/types'
import { hoursUntilEvent } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true, organizatorEntity: true, organizatorType: true } },
        validator: { select: { id: true, name: true } },
        opener: { select: { id: true, name: true } },
        closer: { select: { id: true, name: true } },
        eventSpaces: { include: { space: true } },
        volunteerRecords: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } },
          orderBy: { preregisteredAt: 'desc' },
        },
        observations: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        equipment: true,
        certificates: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    if (!event) return NextResponse.json({ error: 'Eveniment negăsit' }, { status: 404 })
    return NextResponse.json(event)
  } catch (error) {
    console.error('GET /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    const { id } = await params

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ error: 'Eveniment negăsit' }, { status: 404 })

    const hours = hoursUntilEvent(event.startDate)
    if (!canEditEvent(session.user.role as UserRole, event.status as any, hours)) {
      return NextResponse.json({ error: 'Nu aveți dreptul să editați acest eveniment' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        eventType: body.eventType,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        setupStartDate: body.setupStartDate ? new Date(body.setupStartDate) : null,
        setupEndDate: body.setupEndDate ? new Date(body.setupEndDate) : null,
        estimatedParticipants: body.estimatedParticipants ? Number(body.estimatedParticipants) : undefined,
        technicalRequirements: body.technicalRequirements,
        technicalNotes: body.technicalNotes,
        cateringRequired: body.cateringRequired,
        cateringType: body.cateringType,
        cateringNotes: body.cateringNotes,
        coffeeBreakCount: body.coffeeBreakCount ? Number(body.coffeeBreakCount) : null,
        lunchCount: body.lunchCount ? Number(body.lunchCount) : null,
        dinnerCount: body.dinnerCount ? Number(body.dinnerCount) : null,
        isPublic: body.isPublic,
        websiteUrl: body.websiteUrl,
        otherRequirements: body.otherRequirements,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canCancelEvent(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
