'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { UserCheck, Users, Clock, XCircle, CheckCircle, Search, Filter, CalendarDays } from 'lucide-react'
import type { UserRole } from '@/types'

interface VolunteersAdminClientProps {
  records: any[]
  events: any[]
  stats: { total: number; preregistered: number; confirmed: number; checkedIn: number; absent: number }
  currentRole: UserRole
}

const STATUS_LABELS: Record<string, string> = {
  preregistered: 'Pre-înregistrat',
  confirmed: 'Confirmat',
  checked_in: 'Prezent',
  absent: 'Absent',
}

const STATUS_COLORS: Record<string, string> = {
  preregistered: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-purple-100 text-purple-800',
  checked_in: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
}

export function VolunteersAdminClient({ records, events, stats, currentRole }: VolunteersAdminClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEvent, setFilterEvent] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const canUpdate = ['superadmin', 'administrator', 'imagine'].includes(currentRole)

  const filtered = records.filter(r => {
    const matchSearch =
      !search ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.event?.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || r.status === filterStatus
    const matchEvent = !filterEvent || r.eventId === filterEvent
    return matchSearch && matchStatus && matchEvent
  })

  async function updateStatus(id: string, status: string) {
    setLoading(id)
    try {
      const res = await fetch('/api/volunteers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Status actualizat: ${STATUS_LABELS[status]}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total" value={stats.total} color="blue" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pre-înregistrați" value={stats.preregistered} color="purple" />
        <StatCard icon={<UserCheck className="w-5 h-5" />} label="Prezenți" value={stats.checkedIn} color="green" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Absenți" value={stats.absent} color="red" />
      </div>

      {/* Filters */}
      <div className="usvt-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută voluntar sau eveniment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="usvt-input pl-9 w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="usvt-input"
          >
            <option value="">Toate statusurile</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            value={filterEvent}
            onChange={e => setFilterEvent(e.target.value)}
            className="usvt-input"
          >
            <option value="">Toate evenimentele</option>
            {events.map((e: any) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="usvt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="usvt-table">
            <thead>
              <tr>
                <th>Voluntar</th>
                <th>Eveniment</th>
                <th>Status</th>
                <th>Check-in</th>
                <th>Pre-înregistrat</th>
                {canUpdate && <th>Acțiuni</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canUpdate ? 6 : 5} className="text-center py-12 text-gray-400">
                    <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Nicio înregistrare găsită</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r: any) => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{r.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{r.user?.email}</p>
                        {r.user?.phone && <p className="text-xs text-gray-400">{r.user.phone}</p>}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{r.event?.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {r.event?.startDate
                            ? format(new Date(r.event.startDate), 'd MMM yyyy', { locale: ro })
                            : '—'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {r.checkedInAt
                        ? format(new Date(r.checkedInAt), 'dd.MM.yyyy HH:mm')
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-sm text-gray-500">
                      {format(new Date(r.preregisteredAt), 'dd.MM.yyyy HH:mm')}
                    </td>
                    {canUpdate && (
                      <td>
                        <div className="flex gap-1">
                          {r.status !== 'checked_in' && (
                            <button
                              onClick={() => updateStatus(r.id, 'checked_in')}
                              disabled={loading === r.id}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Check-in
                            </button>
                          )}
                          {r.status !== 'absent' && (
                            <button
                              onClick={() => updateStatus(r.id, 'absent')}
                              disabled={loading === r.id}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" />
                              Absent
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            {filtered.length} din {records.length} înregistrări
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <div className={`usvt-card p-4 border ${colorMap[color]}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-70">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs opacity-70">{label}</p>
        </div>
      </div>
    </div>
  )
}
