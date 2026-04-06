import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canCreateEvent } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    }
    const role = session.user.role as UserRole
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const organizatorId = searchParams.get('organizatorId')

    const where: any = {}
    if (status) where.status = status
    if (from || to) {
      where.startDate = {}
      if (from) where.startDate.gte = new Date(from)
      if (to) where.startDate.lte = new Date(to)
    }
    // Organizer can only see their own events (unless admin)
    if (role === 'organizator') {
      where.organizatorId = session.user.id
    }
    if (organizatorId && ['superadmin', 'administrator', 'imagine', 'rectorat'].includes(role)) {
      where.organizatorId = organizatorId
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true, organizatorEntity: true } },
        eventSpaces: {
          include: { space: { select: { id: true, name: true, type: true, capacity: true } } },
        },
        _count: { select: { volunteerRecords: true, observations: true } },
      },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canCreateEvent(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title, description, eventType, startDate, endDate,
      setupStartDate, setupEndDate, organizatorName, organizatorType, organizatorEntity,
      estimatedParticipants, technicalRequirements, technicalNotes,
      cateringRequired, cateringType, cateringNotes,
      coffeeBreakCount, lunchCount, dinnerCount,
      isPublic, websiteUrl, otherRequirements,
      spaceIds, equipment,
    } = body

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType: eventType || 'conferinta',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        setupStartDate: setupStartDate ? new Date(setupStartDate) : null,
        setupEndDate: setupEndDate ? new Date(setupEndDate) : null,
        organizatorId: session.user.id,
        organizatorName: organizatorName || session.user.name,
        organizatorType: organizatorType || session.user.organizatorType || 'intern',
        organizatorEntity: organizatorEntity || session.user.organizatorEntity,
        estimatedParticipants: Number(estimatedParticipants) || 0,
        technicalRequirements,
        technicalNotes,
        cateringRequired: !!cateringRequired,
        cateringType,
        cateringNotes,
        coffeeBreakCount: coffeeBreakCount ? Number(coffeeBreakCount) : null,
        lunchCount: lunchCount ? Number(lunchCount) : null,
        dinnerCount: dinnerCount ? Number(dinnerCount) : null,
        isPublic: isPublic !== false,
        websiteUrl,
        otherRequirements,
        status: 'draft',
        // Create space assignments
        eventSpaces: spaceIds?.length ? {
          create: spaceIds.map((item: { spaceId: string; role: string; notes?: string }) => ({
            spaceId: item.spaceId,
            role: item.role || 'main',
            notes: item.notes,
          })),
        } : undefined,
        // Create equipment
        equipment: equipment?.length ? {
          create: equipment.map((eq: { name: string; quantity: number; provider: string; notes?: string }) => ({
            name: eq.name,
            quantity: eq.quantity || 1,
            provider: eq.provider || 'intern',
            notes: eq.notes,
          })),
        } : undefined,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        eventSpaces: { include: { space: true } },
        equipment: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('POST /api/events error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
