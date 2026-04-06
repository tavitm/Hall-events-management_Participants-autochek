import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageUsers, canDeleteSuperadmin } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canManageUsers(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'Utilizator negăsit' }, { status: 404 })

    // Cannot modify superadmin unless current is superadmin
    if (target.role === 'superadmin' && !canDeleteSuperadmin(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Nu puteți modifica un super admin' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive },
      select: { id: true, name: true, isActive: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
