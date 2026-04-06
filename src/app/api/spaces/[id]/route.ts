import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageSpaces } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || !canManageSpaces(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const { id } = await params
    const body = await req.json()
    const updated = await prisma.space.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
