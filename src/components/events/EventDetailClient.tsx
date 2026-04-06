'use client'
import { useState } from 'react'
import Image from 'next/image'
import { StatusBadge } from './StatusBadge'
import { ObservationsPanel } from './ObservationsPanel'
import { QRSection } from './QRSection'
import { VolunteerPanel } from './VolunteerPanel'
import { formatDate, formatTime, formatDateTime } from '@/lib/utils'
import { ROLE_LABELS, EQUIPMENT_ITEMS } from '@/types'
import type { UserRole } from '@/types'
import {
  canValidateEvent, canOpenEvent, canCloseEvent, canCancelEvent,
  canAddObservation, canPreRegisterAsVolunteer,
} from '@/lib/permissions'
import {
  Calendar, Clock, Users, Building2, MapPin, Utensils, Cpu,
  Globe, CheckCircle, PlayCircle, StopCircle, XCircle, AlertTriangle,
  Info, Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface EventDetailClientProps {
  event: any
  role: UserRole
  userId: string
  fullSheet: boolean
}

export function EventDetailClient({ event, role, userId, fullSheet }: EventDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [actualParticipants, setActualParticipants] = useState('')
  const [activeTab, setActiveTab] = useState<'info'|'spaces'|'equipment'|'catering'|'volunteers'|'observations'|'qr'>('info')

  const isOwner = event.organizatorId === userId
  const myRecord = event.volunteerRecords?.find((r: any) => r.user.id === userId)

  async function callAction(action: string, body?: any) {
    setLoading(action)
    try {
      const res = await fetch(`/api/events/${event.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Eroare')
      toast.success(`Operațiune realizată cu succes!`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  async function preRegister() {
    setLoading('preregister')
    try {
      const res = await fetch(`/api/events/${event.id}/volunteers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Te-ai înregistrat cu succes!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  const TABS = [
    { id: 'info', label: 'Informații' },
    { id: 'spaces', label: 'Spații', count: event.eventSpaces?.length },
    { id: 'equipment', label: 'Echipamente', count: event.equipment?.length },
    ...(fullSheet ? [
      { id: 'catering', label: 'Catering' },
      { id: 'volunteers', label: 'Voluntari', count: event.volunteerRecords?.length },
    ] : []),
    { id: 'observations', label: 'Observații', count: event.observations?.length },
    // QR tab only for admin roles, in the tab bar
    ...(fullSheet && ['superadmin','administrator','imagine','organizator'].includes(role) && (event.promoQrCode || event.attendanceQrCode) ? [{ id: 'qr', label: 'QR Codes' }] : []),
  ]

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── QR Banner pentru toți — vizibil când evenimentul e activ ── */}
      {event.status === 'open' && event.attendanceQrCode && (
        <div className="rounded-2xl border-2 border-green-400 bg-green-50 p-5 text-center">
          <p className="text-sm font-semibold text-green-800 mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            Eveniment activ — Voluntarii scanează codul pentru a-și înregistra prezența
          </p>
          <QRSection event={event} role={role} inline={false} />
        </div>
      )}

      {/* Action bar */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <StatusBadge status={event.status} />
          <div className="flex-1" />

          {/* Rectorat / Admin: Validate */}
          {canValidateEvent(role) && ['draft','submitted'].includes(event.status) && (
            <button className="btn btn-primary btn-sm" disabled={!!loading}
              onClick={() => callAction('validate')}>
              <CheckCircle className="w-3.5 h-3.5" />
              {loading==='validate' ? 'Se validează...' : 'Validează Eveniment'}
            </button>
          )}

          {/* Submit for validation (organizator) */}
          {(role === 'organizator' && isOwner || ['superadmin','administrator'].includes(role))
            && event.status === 'draft' && (
            <button className="btn btn-secondary btn-sm" disabled={!!loading}
              onClick={async () => {
                setLoading('submit')
                try {
                  const res = await fetch(`/api/events/${event.id}`, {
                    method: 'PUT', headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ status: 'submitted' }),
                  })
                  if (!res.ok) throw new Error('Eroare')
                  // Actually we need a submit endpoint - use the validate logic
                  toast.success('Eveniment trimis spre validare!')
                  router.refresh()
                } catch (err: any) {
                  toast.error(err.message)
                } finally {
                  setLoading(null)
                }
              }}>
              Trimite spre Validare
            </button>
          )}

          {/* Open event */}
          {canOpenEvent(role) && ['validated','approved','draft','submitted'].includes(event.status) && (
            <button className="btn btn-success btn-sm" disabled={!!loading}
              onClick={() => callAction('open')}>
              <PlayCircle className="w-3.5 h-3.5" />
              {loading==='open' ? 'Se deschide...' : 'Deschide Eveniment'}
            </button>
          )}

          {/* Close event */}
          {canCloseEvent(role) && event.status === 'open' && (
            <button className="btn btn-secondary btn-sm border-orange-300 text-orange-700" disabled={!!loading}
              onClick={() => callAction('close', { actualParticipants: actualParticipants || undefined })}>
              <StopCircle className="w-3.5 h-3.5" />
              {loading==='close' ? 'Se închide...' : 'Închide Eveniment'}
            </button>
          )}

          {/* Cancel */}
          {canCancelEvent(role) && !['cancelled','closed'].includes(event.status) && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowCancelModal(true)}>
              <XCircle className="w-3.5 h-3.5" /> Anulează
            </button>
          )}

          {/* Voluntar pre-register */}
          {canPreRegisterAsVolunteer(role) && !['cancelled','closed'].includes(event.status) && !myRecord && (
            <button className="btn btn-success btn-sm" disabled={!!loading} onClick={preRegister}>
              {loading==='preregister' ? 'Se înregistrează...' : '✋ Mă înregistrez'}
            </button>
          )}
          {myRecord && (
            <span className="status-badge bg-green-100 text-green-800 border-green-200">
              ✓ Înregistrat · {myRecord.status}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-usvt-blue text-usvt-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === tab.id ? {borderColor:'#1a3a6e', color:'#1a3a6e'} : {}}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full"
                      style={{background: activeTab===tab.id ? '#1a3a6e' : '#e2e8f0', color: activeTab===tab.id ? 'white' : '#64748b'}}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'info' && <InfoTab event={event} fullSheet={fullSheet} />}
      {activeTab === 'spaces' && <SpacesTab event={event} />}
      {activeTab === 'equipment' && <EquipmentTab event={event} />}
      {activeTab === 'catering' && fullSheet && <CateringTab event={event} />}
      {activeTab === 'volunteers' && fullSheet && (
        <VolunteerPanel volunteers={event.volunteerRecords || []} eventId={event.id} eventStatus={event.status} role={role} />
      )}
      {activeTab === 'observations' && (
        <ObservationsPanel
          observations={event.observations || []}
          eventId={event.id}
          canAdd={canAddObservation(role)}
          userId={userId}
        />
      )}
      {activeTab === 'qr' && <QRSection event={event} role={role} />}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Anulare Eveniment
            </h3>
            <p className="text-sm text-gray-500 mb-4">Această acțiune nu poate fi anulată.</p>
            <textarea className="form-input" rows={3} placeholder="Motivul anulării..."
              value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button className="btn btn-danger flex-1" disabled={!!loading}
                onClick={() => { callAction('cancel', { reason: cancelReason }); setShowCancelModal(false) }}>
                Confirmă Anularea
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Anulează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoTab({ event, fullSheet }: { event: any; fullSheet: boolean }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" style={{color:'#1a3a6e'}} /> Detalii Eveniment
        </h3>
        <DetailRow label="Titlu" value={event.title} />
        <DetailRow label="Tip" value={event.eventType} />
        <DetailRow label="Descriere" value={event.description} />
        <DetailRow label="Website" value={event.websiteUrl} link />
        <DetailRow label="Vizibilitate" value={event.isPublic ? 'Public' : 'Privat'} />
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{color:'#1a3a6e'}} /> Program
        </h3>
        <DetailRow label="Data început" value={`${formatDate(event.startDate)} · ${formatTime(event.startDate)}`} />
        <DetailRow label="Data sfârșit" value={`${formatDate(event.endDate)} · ${formatTime(event.endDate)}`} />
        {event.setupStartDate && <DetailRow label="Pregătire de la" value={formatDateTime(event.setupStartDate)} />}
        {event.setupEndDate && <DetailRow label="Pregătire până la" value={formatDateTime(event.setupEndDate)} />}
        <DetailRow label="Participanți estimați" value={`${event.estimatedParticipants} persoane`} />
        {event.actualParticipants && <DetailRow label="Participanți reali" value={`${event.actualParticipants} persoane`} />}
      </div>

      {fullSheet && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{color:'#2e7d32'}} /> Organizator
          </h3>
          <DetailRow label="Entitate" value={event.creator?.organizatorEntity || event.organizatorEntity} />
          <DetailRow label="Tip" value={event.organizatorType === 'intern' ? 'Intern' : 'Extern'} />
          <DetailRow label="Contact" value={event.creator?.name} />
          <DetailRow label="Email" value={event.creator?.email} />
          {event.creator?.phone && <DetailRow label="Telefon" value={event.creator.phone} />}
          {event.cancelledReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700 font-medium">Motiv anulare: {event.cancelledReason}</p>
            </div>
          )}
        </div>
      )}

      {fullSheet && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" style={{color:'#1a3a6e'}} /> Istoric Status
          </h3>
          <TimelineItem label="Creat" date={event.createdAt} active />
          {event.validatedAt && <TimelineItem label="Validat" date={event.validatedAt} by={event.validator?.name} active />}
          {event.openedAt && <TimelineItem label="Deschis" date={event.openedAt} by={event.opener?.name} active />}
          {event.closedAt && <TimelineItem label="Închis" date={event.closedAt} by={event.closer?.name} active />}
        </div>
      )}
    </div>
  )
}

function SpacesTab({ event }: { event: any }) {
  const typeLabel: Record<string, string> = {
    conferinta: 'Sală Conferință', tehnica: 'Sală Tehnică',
    coffee_break: 'Coffee Break', other: 'Alt spațiu',
  }
  const roleLabel: Record<string, string> = {
    main: 'Principal', technical: 'Tehnic', coffee_break: 'Coffee Break',
    registration: 'Înregistrare', other: 'Altul',
  }
  if (!event.eventSpaces?.length) {
    return <div className="card p-8 text-center text-gray-400 text-sm">Niciun spațiu alocat</div>
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {event.eventSpaces.map((es: any) => (
        <div key={es.id} className="card p-4 border-l-4" style={{borderLeftColor:'#1a3a6e'}}>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{es.space.name}</h4>
            <span className="status-badge bg-blue-50 text-blue-700 border-blue-100">{roleLabel[es.role] || es.role}</span>
          </div>
          <p className="text-sm text-gray-500">{typeLabel[es.space.type] || es.space.type}</p>
          <p className="text-sm text-gray-500">Capacitate: {es.space.capacity} persoane</p>
          {es.space.floor && <p className="text-sm text-gray-500">Etaj {es.space.floor}</p>}
          {es.notes && <p className="text-xs text-gray-400 mt-2 italic">{es.notes}</p>}
        </div>
      ))}
    </div>
  )
}

function EquipmentTab({ event }: { event: any }) {
  const statusLabel: Record<string, string> = {
    requested: 'Solicitat', confirmed: 'Confirmat', delivered: 'Livrat', returned: 'Returnat',
  }
  if (!event.equipment?.length) {
    return <div className="card p-8 text-center text-gray-400 text-sm">Niciun echipament solicitat</div>
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Echipament</th><th>Cantitate</th><th>Furnizor</th><th>Status</th><th>Observații</th>
          </tr>
        </thead>
        <tbody>
          {event.equipment.map((eq: any) => (
            <tr key={eq.id}>
              <td className="font-medium text-sm">{eq.name}</td>
              <td className="text-sm">{eq.quantity}</td>
              <td className="text-sm">{eq.provider === 'intern' ? 'Intern' : 'Extern'}</td>
              <td><span className="status-badge bg-gray-100 text-gray-700 border-gray-200 text-xs">{statusLabel[eq.status]}</span></td>
              <td className="text-xs text-gray-400">{eq.notes || '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function CateringTab({ event }: { event: any }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Utensils className="w-4 h-4" style={{color:'#c9a84c'}} /> Catering
        </h3>
        <DetailRow label="Solicitat" value={event.cateringRequired ? 'Da' : 'Nu'} />
        <DetailRow label="Furnizor" value={
          event.cateringType === 'agrocampus' ? 'Agrocampus (intern)' :
          event.cateringType === 'extern' ? 'Catering extern' :
          event.cateringType === 'both' ? 'Ambii furnizori' : '–'
        } />
        {event.coffeeBreakCount != null && <DetailRow label="Coffee Break (persoane)" value={event.coffeeBreakCount} />}
        {event.lunchCount != null && <DetailRow label="Prânz (persoane)" value={event.lunchCount} />}
        {event.dinnerCount != null && <DetailRow label="Cină (persoane)" value={event.dinnerCount} />}
        {event.cateringNotes && <DetailRow label="Mențiuni" value={event.cateringNotes} />}
      </div>
    </div>
  )
}

function DetailRow({ label, value, link }: { label: string; value: any; link?: boolean }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3">
      <span className="text-xs text-gray-400 w-36 flex-shrink-0 pt-0.5">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
           className="text-sm text-blue-600 hover:underline truncate flex-1">{value}</a>
      ) : (
        <span className="text-sm text-gray-900 flex-1">{String(value)}</span>
      )}
    </div>
  )
}

function TimelineItem({ label, date, by, active }: { label: string; date: string; by?: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{formatDateTime(date)}{by ? ` · ${by}` : ''}</p>
      </div>
    </div>
  )
}
