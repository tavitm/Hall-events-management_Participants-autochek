import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import Image from 'next/image'
import { StatusBadge } from '@/components/events/StatusBadge'
import { formatDate, formatTime } from '@/lib/utils'
import { ROLE_LABELS } from '@/types'
import type { UserRole } from '@/types'
import {
  Calendar, Users, Building2, Award, Megaphone, TrendingUp,
  Clock, CheckCircle, AlertCircle, ArrowRight, Star,
} from 'lucide-react'

async function getDashboardStats(userId: string, role: UserRole) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  if (role === 'voluntar') {
    const [myRecords, myCheckins, myCerts] = await Promise.all([
      prisma.volunteerRecord.count({ where: { userId } }),
      prisma.volunteerRecord.count({ where: { userId, status: 'checked_in' } }),
      prisma.certificate.count({ where: { userId } }),
    ])
    const upcoming = await prisma.volunteerRecord.findMany({
      where: { userId, event: { startDate: { gte: now }, status: { in: ['validated','approved','open'] } } },
      include: { event: { select: { id: true, title: true, startDate: true, endDate: true, status: true, organizatorEntity: true } } },
      take: 5,
      orderBy: { event: { startDate: 'asc' } },
    })
    return { type: 'voluntar', myRecords, myCheckins, myCerts, upcoming }
  }

  // Admin/Imagine/Rectorat/Organizator stats
  const whereClause = role === 'organizator' ? { organizatorId: userId } : {}
  const [total, open, upcoming, thisMonth] = await Promise.all([
    prisma.event.count({ where: whereClause }),
    prisma.event.count({ where: { ...whereClause, status: 'open' } }),
    prisma.event.count({ where: { ...whereClause, startDate: { gte: now }, status: { in: ['validated','approved','open'] } } }),
    prisma.event.count({ where: { ...whereClause, startDate: { gte: monthStart } } }),
  ])
  const recentEvents = await prisma.event.findMany({
    where: whereClause,
    include: {
      creator: { select: { name: true, organizatorEntity: true } },
      eventSpaces: { include: { space: { select: { name: true } } }, take: 1 },
      _count: { select: { volunteerRecords: true } },
    },
    orderBy: { startDate: 'asc' },
    take: 5,
  })
  const pendingValidation = await prisma.event.count({ where: { status: 'submitted' } })
  const totalSpaces = await prisma.space.count({ where: { isActive: true } })
  const totalUsers = await prisma.user.count({ where: { isActive: true } })
  return { type: 'admin', total, open, upcoming, thisMonth, recentEvents, pendingValidation, totalSpaces, totalUsers }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const stats = await getDashboardStats(session.user.id, session.user.role as UserRole)

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as UserRole,
    organizatorEntity: session.user.organizatorEntity,
  }

  return (
    <DashboardLayout user={user}>
      <Header
        title="Dashboard"
        subtitle={`${ROLE_LABELS[user.role]} · ${new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="usvt-gradient-hero p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/25 flex-shrink-0">
              <Image src="/logos/usvt-main.png" alt="USVT" width={52} height={52} className="rounded-full object-contain" />
            </div>
            <div className="text-white min-w-0">
              <h2 className="text-base sm:text-xl font-bold truncate">
                Bun venit, {session.user.name?.split(' ')[0] || 'Utilizator'}! 👋
              </h2>
              <p className="text-blue-200 text-xs sm:text-sm mt-0.5 truncate">
                {ROLE_LABELS[user.role]}
                {user.organizatorEntity && ` · ${user.organizatorEntity}`}
              </p>
            </div>
          </div>
        </div>

        {stats.type === 'voluntar' ? (
          <VoluntarDashboard stats={stats} userId={session.user.id} />
        ) : (
          <AdminDashboard stats={stats} role={user.role} />
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, label, value, color, href }: { icon: React.ReactNode; label: string; value: number | string; color: string; href?: string }) {
  const content = (
    <div className={`card p-3 sm:p-5 border-l-4 ${color} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="mt-1 opacity-70 hidden sm:block">{icon}</div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

function AdminDashboard({ stats, role }: { stats: any; role: UserRole }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Megaphone className="w-8 h-8" style={{color:'#1a3a6e'}} />} label="Total Evenimente" value={stats.total} color="border-usvt-blue" href="/events" />
        <StatCard icon={<CheckCircle className="w-8 h-8" style={{color:'#2e7d32'}} />} label="Active Acum" value={stats.open} color="border-green-500" href="/events?status=open" />
        <StatCard icon={<Clock className="w-8 h-8" style={{color:'#f59e0b'}} />} label="Următoarele" value={stats.upcoming} color="border-amber-400" href="/calendar" />
        <StatCard icon={<TrendingUp className="w-8 h-8" style={{color:'#8b5cf6'}} />} label="Luna Aceasta" value={stats.thisMonth} color="border-purple-400" href="/events" />
      </div>

      {['superadmin', 'administrator'].includes(role) && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<AlertCircle className="w-7 h-7 text-red-500" />} label="Spre Validare" value={stats.pendingValidation} color="border-red-400" href="/events?status=submitted" />
          <StatCard icon={<Building2 className="w-7 h-7 text-cyan-600" />} label="Săli Active" value={stats.totalSpaces} color="border-cyan-400" href="/spaces" />
          <StatCard icon={<Users className="w-7 h-7 text-indigo-500" />} label="Utilizatori" value={stats.totalUsers} color="border-indigo-400" href="/users" />
        </div>
      )}

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{color:'#1a3a6e'}} />
            Evenimente Recente / Viitoare
          </h3>
          <Link href="/events" className="text-sm font-medium flex items-center gap-1" style={{color:'#1a3a6e'}}>
            Vezi toate <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recentEvents?.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">Niciun eveniment înregistrat</p>
          ) : stats.recentEvents?.map((ev: any) => (
            <Link key={ev.id} href={`/events/${ev.id}`} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-blue-50/50 transition-colors">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                   style={{background:'#1a3a6e'}}>
                <span>{new Date(ev.startDate).getDate()}</span>
                <span className="text-[10px] uppercase">{new Date(ev.startDate).toLocaleString('ro-RO',{month:'short'})}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{ev.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {ev.creator?.organizatorEntity || ev.creator?.name} · {formatTime(ev.startDate)}–{formatTime(ev.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                  <Users className="w-3 h-3" /> {ev._count?.volunteerRecords}
                </span>
                <StatusBadge status={ev.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

function VoluntarDashboard({ stats, userId }: { stats: any; userId: string }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={<Star className="w-6 h-6 sm:w-8 sm:h-8" style={{color:'#c9a84c'}} />} label="Înregistrări" value={stats.myRecords} color="border-amber-400" href="/my-events" />
        <StatCard icon={<CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" style={{color:'#2e7d32'}} />} label="Prezențe" value={stats.myCheckins} color="border-green-500" href="/my-events" />
        <StatCard icon={<Award className="w-6 h-6 sm:w-8 sm:h-8" style={{color:'#1a3a6e'}} />} label="Adeverințe" value={stats.myCerts} color="border-blue-500" href="/my-certificates" />
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{color:'#1a3a6e'}} />
            Evenimentele Mele Viitoare
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.upcoming?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm mb-3">Nu ești înregistrat la niciun eveniment viitor</p>
              <Link href="/events" className="btn btn-primary btn-sm">Explorează Evenimente</Link>
            </div>
          ) : stats.upcoming?.map((rec: any) => (
            <Link key={rec.id} href={`/events/${rec.event.id}`} className="flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors">
              <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold flex-shrink-0"
                   style={{background:'#1a3a6e'}}>
                <span>{new Date(rec.event.startDate).getDate()}</span>
                <span className="text-[10px] uppercase">{new Date(rec.event.startDate).toLocaleString('ro-RO',{month:'short'})}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{rec.event.title}</p>
                <p className="text-xs text-gray-400">{rec.event.organizatorEntity}</p>
              </div>
              <StatusBadge status={rec.event.status} />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
