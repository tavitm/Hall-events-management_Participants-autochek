'use client'
import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { ROLE_LABELS } from '@/types'
import { getRoleColor } from '@/lib/permissions'
import type { UserRole } from '@/types'
import { MessageSquare, AlertTriangle, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'technical', label: 'Tehnic' },
  { value: 'catering', label: 'Catering' },
  { value: 'logistics', label: 'Logistică' },
  { value: 'urgent', label: '🚨 Urgent' },
]

export function ObservationsPanel({
  observations, eventId, canAdd, userId
}: {
  observations: any[]; eventId: string; canAdd: boolean; userId: string
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [isUrgent, setIsUrgent] = useState(false)
  const [sending, setSending] = useState(false)

  async function sendObservation() {
    if (!content.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/events/${eventId}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category, isUrgent }),
      })
      if (!res.ok) throw new Error('Eroare')
      setContent('')
      toast.success('Observație adăugată!')
      router.refresh()
    } catch {
      toast.error('Eroare la trimitere')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" style={{color:'#1a3a6e'}} />
        <h3 className="font-semibold text-gray-900 text-sm">Observații ({observations.length})</h3>
        <span className="text-xs text-gray-400 ml-auto">Istoric append-only · Nu se pot șterge</span>
      </div>

      {/* Messages */}
      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
        {observations.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Nicio observație înregistrată</p>
        ) : observations.map((obs: any) => (
          <div key={obs.id} className={`rounded-xl p-3.5 ${obs.isUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              {obs.isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getRoleColor(obs.user.role as UserRole)}`}>
                {obs.user.name || obs.user.role}
              </span>
              <span className="text-xs text-gray-400">{formatDateTime(obs.createdAt)}</span>
              {obs.category !== 'general' && (
                <span className="text-xs text-gray-400 ml-auto">[{obs.category}]</span>
              )}
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{obs.content}</p>
          </div>
        ))}
      </div>

      {/* Add observation */}
      {canAdd && (
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            <select className="form-input w-auto text-xs" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)}
                     className="rounded" />
              Urgent
            </label>
          </div>
          <div className="flex gap-2">
            <textarea
              className="form-input flex-1 text-sm"
              rows={2}
              placeholder="Adaugă o observație..."
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendObservation() }}
            />
            <button className="btn btn-primary btn-sm self-end" onClick={sendObservation} disabled={!content.trim() || sending}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
