import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageUsers } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canManageUsers(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        organizatorType: true, organizatorEntity: true, organizatorCompany: true,
        phone: true, department: true, isActive: true, createdAt: true,
        _count: { select: { createdEvents: true, volunteerRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canManageUsers(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const body = await req.json()
    const { name, email, password, role, organizatorType, organizatorEntity, organizatorCompany, phone, department } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 })
    }

    // Prevent creating superadmin unless current user is superadmin
    if (role === 'superadmin' && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Nu puteți crea un super admin' }, { status: 403 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email deja folosit' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, organizatorType, organizatorEntity, organizatorCompany, phone, department },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
