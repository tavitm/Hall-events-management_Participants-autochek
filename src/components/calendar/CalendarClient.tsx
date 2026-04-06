'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns'
import { ro } from 'date-fns/locale'
import { StatusBadge } from '@/components/events/StatusBadge'
import type { UserRole } from '@/types'
import { ChevronLeft, ChevronRight, CalendarDays, List, Building2 } from 'lucide-react'
import { formatTime } from '@/lib/utils'

const EVENT_COLORS: Record<string, string> = {
  draft: '#94a3b8', submitted: '#f59e0b', validated: '#3b82f6',
  approved: '#8b5cf6', open: '#22c55e', closed: '#64748b', cancelled: '#ef4444',
}

interface CalendarClientProps {
  events: any[]
  spaces: any[]
  role: UserRole
}

export function CalendarClient({ events, spaces, role }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'list'>('month')
  const [selectedSpace, setSelectedSpace] = useState('')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const filtered = useMemo(() => {
    return events.filter(ev => {
      if (!selectedSpace) return true
      return ev.eventSpaces?.some((es: any) => es.space?.name === selectedSpace || es.spaceId === selectedSpace)
    })
  }, [events, selectedSpace])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = startDate
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  function getEventsForDay(d: Date) {
    return filtered.filter(ev => {
      const start = new Date(ev.startDate)
      const end = new Date(ev.endDate)
      return isWithinInterval(d, { start: new Date(start.getFullYear(), start.getMonth(), start.getDate()), end: new Date(end.getFullYear(), end.getMonth(), end.getDate()) })
    })
  }

  const dayEventsSelected = selectedDay ? getEventsForDay(selectedDay) : []

  const WEEKDAYS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="btn btn-secondary btn-sm p-2"><ChevronLeft className="w-4 h-4" /></button>
          <h2 className="text-base font-semibold text-gray-900 min-w-40 text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ro })}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="btn btn-secondary btn-sm p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary btn-sm">Azi</button>
        <div className="flex-1" />
        <select className="form-input w-auto text-sm" value={selectedSpace} onChange={e => setSelectedSpace(e.target.value)}>
          <option value="">Toate spațiile</option>
          {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setView('month')}
            className={`px-3 py-2 flex items-center gap-1.5 text-xs ${view==='month' ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            style={view==='month' ? {background:'#1a3a6e'} : {}}>
            <CalendarDays className="w-3.5 h-3.5" /> Lună
          </button>
          <button onClick={() => setView('list')}
            className={`px-3 py-2 flex items-center gap-1.5 text-xs ${view==='list' ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            style={view==='list' ? {background:'#1a3a6e'} : {}}>
            <List className="w-3.5 h-3.5" /> Listă
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Calendar grid */}
          <div className="lg:col-span-2 card overflow-hidden">
            {/* Weekdays header */}
            <div className="grid grid-cols-7" style={{background:'#1a3a6e'}}>
              {WEEKDAYS.map(d => (
                <div key={d} className="py-2.5 text-center text-xs font-semibold text-blue-200">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7">
              {days.map((d, i) => {
                const dayEvents = getEventsForDay(d)
                const isToday = isSameDay(d, new Date())
                const isCurrentMonth = isSameMonth(d, currentDate)
                const isSelected = selectedDay && isSameDay(d, selectedDay)

                return (
                  <div key={i}
                    onClick={() => setSelectedDay(d)}
                    className={`min-h-20 p-1.5 border-r border-b border-gray-100 cursor-pointer transition-colors ${
                      !isCurrentMonth ? 'bg-gray-50/50' : ''
                    } ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : 'hover:bg-gray-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                      isToday ? 'text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
                    }`} style={isToday ? {background:'#1a3a6e'} : {}}>
                      {format(d, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev: any) => (
                        <div key={ev.id}
                          className="text-[10px] leading-tight px-1 py-0.5 rounded font-medium truncate text-white"
                          style={{background: EVENT_COLORS[ev.status] || '#94a3b8'}}>
                          {formatTime(ev.startDate)} {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} mai mult</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day detail panel */}
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">
                {selectedDay
                  ? format(selectedDay, 'EEEE, d MMMM yyyy', { locale: ro })
                  : 'Selectați o zi'}
              </h3>
            </div>
            {!selectedDay || dayEventsSelected.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">
                {selectedDay ? 'Niciun eveniment în această zi' : 'Clic pe o zi pentru detalii'}
              </p>
            ) : (
              <div className="divide-y divide-gray-50 overflow-y-auto max-h-96">
                {dayEventsSelected.map((ev: any) => (
                  <Link key={ev.id} href={`/events/${ev.id}`}
                    className="flex items-start gap-3 p-3.5 hover:bg-blue-50/50 transition-colors">
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                         style={{background: EVENT_COLORS[ev.status]}} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatTime(ev.startDate)}–{formatTime(ev.endDate)}
                      </p>
                      {ev.eventSpaces?.[0] && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {ev.eventSpaces[0].space?.name}
                        </p>
                      )}
                      <StatusBadge status={ev.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {/* Legend */}
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium mb-2">Legendă</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(EVENT_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: color}} />
                    <span className="text-[10px] text-gray-500 capitalize">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-gray-400">Niciun eveniment</p>
            ) : filtered.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((ev: any) => (
              <Link key={ev.id} href={`/events/${ev.id}`}
                className="flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-colors">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold flex-shrink-0"
                     style={{background: EVENT_COLORS[ev.status] || '#94a3b8'}}>
                  <span className="text-lg leading-none">{new Date(ev.startDate).getDate()}</span>
                  <span className="text-[10px] uppercase">{format(new Date(ev.startDate), 'MMM', {locale: ro})}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(ev.startDate)}–{formatTime(ev.endDate)} · {ev.creator?.organizatorEntity || ev.creator?.name}
                  </p>
                  {ev.eventSpaces?.map((es: any) => (
                    <span key={es.id} className="text-xs text-gray-400 mr-2">📍 {es.space?.name}</span>
                  ))}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={ev.status} />
                  <span className="text-xs text-gray-400">{ev.estimatedParticipants} pers.</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
