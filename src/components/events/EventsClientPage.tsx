'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { formatDate, formatTime } from '@/lib/utils'
import { EVENT_TYPES } from '@/types'
import type { UserRole } from '@/types'
import { Search, Filter, Calendar, Users, Building2, Eye, SlidersHorizontal } from 'lucide-react'
import { canSeeFullEventSheet } from '@/lib/permissions'

const STATUS_OPTIONS = [
  { value: '', label: 'Toate statusurile' },
  { value: 'draft', label: 'Ciornă' },
  { value: 'submitted', label: 'Spre validare' },
  { value: 'validated', label: 'Validat' },
  { value: 'approved', label: 'Aprobat' },
  { value: 'open', label: 'Activ' },
  { value: 'closed', label: 'Finalizat' },
  { value: 'cancelled', label: 'Anulat' },
]

interface EventsClientPageProps {
  events: any[]
  role: UserRole
  userId: string
}

export function EventsClientPage({ events, role, userId }: EventsClientPageProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    return events.filter(ev => {
      const matchSearch = !search ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.creator?.organizatorEntity?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || ev.status === statusFilter
      const matchType = !typeFilter || ev.eventType === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [events, search, statusFilter, typeFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Search — full width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="form-input pl-9"
              placeholder="Caută eveniment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Filters row */}
          <div className="flex flex-wrap gap-2 items-center">
            <select className="form-input flex-1 min-w-0 sm:flex-none sm:w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="form-input flex-1 min-w-0 sm:flex-none sm:w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Toate tipurile</option>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <button onClick={() => setView('grid')}
                className={`px-3 py-2 text-xs ${view==='grid' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                style={view==='grid' ? {color:'#1a3a6e',background:'#f0f4fb'} : {}}>
                Grilă
              </button>
              <button onClick={() => setView('list')}
                className={`px-3 py-2 text-xs ${view==='list' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                style={view==='list' ? {color:'#1a3a6e',background:'#f0f4fb'} : {}}>
                Listă
              </button>
            </div>
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} rezultate</span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Niciun eveniment găsit</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ev => <EventCard key={ev.id} event={ev} role={role} userId={userId} />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Eveniment</th>
                <th>Data</th>
                <th>Organizator</th>
                <th>Participanți</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => (
                <tr key={ev.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ev.title}</p>
                      <p className="text-xs text-gray-400">{ev.eventType}</p>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm">{formatDate(ev.startDate, 'dd MMM yyyy')}</p>
                    <p className="text-xs text-gray-400">{formatTime(ev.startDate)}–{formatTime(ev.endDate)}</p>
                  </td>
                  <td className="text-sm text-gray-600 max-w-xs truncate">{ev.creator?.organizatorEntity || ev.creator?.name}</td>
                  <td className="text-sm">{ev.estimatedParticipants}</td>
                  <td><StatusBadge status={ev.status} /></td>
                  <td>
                    <Link href={`/events/${ev.id}`} className="btn btn-secondary btn-sm">
                      <Eye className="w-3 h-3" /> Detalii
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event: ev, role, userId }: { event: any; role: UserRole; userId: string }) {
  const isOwner = ev.organizatorId === userId
  const statusColor: Record<string, string> = {
    draft: '#94a3b8', submitted: '#f59e0b', validated: '#3b82f6',
    approved: '#8b5cf6', open: '#22c55e', closed: '#64748b', cancelled: '#ef4444',
  }

  return (
    <Link href={`/events/${ev.id}`}>
      <div className="card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
        {/* Color strip */}
        <div className="h-1.5" style={{background: statusColor[ev.status] || '#94a3b8'}} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1 line-clamp-2">{ev.title}</h3>
            <StatusBadge status={ev.status} />
          </div>

          {ev.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ev.description}</p>
          )}

          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{color:'#1a3a6e'}} />
              <span>{formatDate(ev.startDate, 'dd MMM yyyy')} · {formatTime(ev.startDate)}–{formatTime(ev.endDate)}</span>
            </div>
            {ev.creator?.organizatorEntity && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{color:'#2e7d32'}} />
                <span className="truncate">{ev.creator.organizatorEntity}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" style={{color:'#1a3a6e'}} />
                {ev.estimatedParticipants} est.
              </span>
              {ev._count?.volunteerRecords > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" style={{color:'#2e7d32'}} />
                  {ev._count.volunteerRecords} vol.
                </span>
              )}
              {ev.eventSpaces?.[0] && (
                <span className="truncate flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {ev.eventSpaces[0].space?.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
