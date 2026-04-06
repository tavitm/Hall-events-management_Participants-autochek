'use client'
import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import type { UserRole } from '@/types'
import { Users, UserCheck, UserX, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function VolunteerPanel({
  volunteers, eventId, eventStatus, role
}: {
  volunteers: any[]; eventId: string; eventStatus: string; role: UserRole
}) {
  const router = useRouter()
  const [filter, setFilter] = useState('')

  const filtered = volunteers.filter(v =>
    !filter || v.user.name?.toLowerCase().includes(filter.toLowerCase()) || v.user.email?.toLowerCase().includes(filter.toLowerCase())
  )

  const stats = {
    total: volunteers.length,
    checkedIn: volunteers.filter(v => v.status === 'checked_in').length,
    preregistered: volunteers.filter(v => v.status === 'preregistered').length,
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4" style={{color:'#1a3a6e'}} />
            Voluntari ({volunteers.length})
          </h3>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600 font-medium">✓ {stats.checkedIn} prezenți</span>
            <span className="text-blue-600">{stats.preregistered} înregistrați</span>
          </div>
        </div>
        <input className="form-input text-sm" placeholder="Caută voluntar..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-gray-400 text-sm">Niciun voluntar înregistrat</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map((v: any) => (
            <div key={v.id} className="flex items-center gap-3 p-3.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                   style={{background:'#1a3a6e'}}>
                {v.user.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{v.user.name || v.user.email}</p>
                <p className="text-xs text-gray-400 truncate">{v.role || 'Voluntar general'}</p>
              </div>
              {v.checkedInAt ? (
                <div className="text-right">
                  <span className="status-badge bg-green-100 text-green-800 border-green-200 text-xs">
                    ✓ Prezent
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(v.checkedInAt)}</p>
                </div>
              ) : (
                <span className="status-badge bg-blue-50 text-blue-700 border-blue-100 text-xs">Înregistrat</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
