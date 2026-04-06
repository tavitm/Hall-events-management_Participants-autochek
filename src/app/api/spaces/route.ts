import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageSpaces } from '@/lib/permissions'
import type { UserRole } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    const spaces = await prisma.space.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(spaces)
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Neautentificat' }, { status: 401 })
    if (!canManageSpaces(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
    }
    const body = await req.json()
    const space = await prisma.space.create({ data: body })
    return NextResponse.json(space, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
