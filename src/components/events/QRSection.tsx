'use client'
import Image from 'next/image'
import type { UserRole } from '@/types'
import { Download, QrCode, Shield, Info } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface QRSectionProps {
  event: any
  role: UserRole
  /** When true, renders inline (inside tab). When false, renders as banner. */
  inline?: boolean
}

export function QRSection({ event, role, inline = true }: QRSectionProps) {
  const isAdmin = ['superadmin', 'administrator', 'imagine', 'organizator'].includes(role)

  function downloadQR(dataUrl: string, filename: string) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  }

  return (
    <div className={inline ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>

      {/* ── QR Promovare (admin/imagine only in tab) ── */}
      {inline && event.promoQrCode && (
        <div className="card p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5" style={{ color: '#1a3a6e' }} />
            <h3 className="font-semibold text-gray-900">QR Promovare</h3>
          </div>
          <div className="qr-container mx-auto inline-flex">
            <img src={event.promoQrCode} alt="QR Promo" className="w-48 h-48" />
            <p className="text-xs text-gray-500">Scanează pentru informații eveniment</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">Generat la validarea evenimentului</p>
          {isAdmin && (
            <button
              className="btn btn-secondary btn-sm mt-3"
              onClick={() => downloadQR(event.promoQrCode, `qr-promo-${event.id}.png`)}
            >
              <Download className="w-3.5 h-3.5" /> Descarcă QR
            </button>
          )}
        </div>
      )}

      {/* ── QR Prezență Voluntari ── */}
      {event.attendanceQrCode && (
        <div className={inline
          ? `card p-6 text-center ${event.status === 'open' ? 'ring-2 ring-green-400' : ''}`
          : `rounded-2xl p-5 text-center border-2 ${event.status === 'open' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`
        }>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5" style={{ color: '#2e7d32' }} />
            <h3 className={`font-semibold ${inline ? 'text-gray-900' : 'text-green-800'}`}>
              QR Prezență Voluntari
            </h3>
          </div>

          {event.status === 'open' ? (
            <>
              <div className={`mx-auto inline-flex flex-col items-center rounded-xl p-3 ${inline ? 'qr-container pulse-green border-green-400' : 'bg-white border-2 border-green-300 shadow-md'}`}>
                <img src={event.attendanceQrCode} alt="QR Prezenta" className={inline ? 'w-48 h-48' : 'w-56 h-56'} />
                <p className="text-xs text-green-600 font-semibold mt-2">✓ ACTIV — Scanează pentru check-in</p>
              </div>

              {!inline && (
                <div className="mt-3 text-sm text-green-700 bg-green-100 rounded-lg px-4 py-2 inline-block">
                  Voluntarii înregistrați cu cont în aplicație scanează acest cod pentru a-și valida prezența și a genera automat adeverința.
                </div>
              )}

              {event.attendanceQrExpiry && (
                <p className="text-xs text-gray-400 mt-2">
                  Expiră: {formatDateTime(event.attendanceQrExpiry)}
                </p>
              )}

              {isAdmin && (
                <button
                  className="btn btn-secondary btn-sm mt-3"
                  onClick={() => downloadQR(event.attendanceQrCode, `qr-prezenta-${event.id}.png`)}
                >
                  <Download className="w-3.5 h-3.5" /> Descarcă QR
                </button>
              )}
            </>
          ) : (
            <>
              <div className="qr-container mx-auto inline-flex opacity-40">
                <img src={event.attendanceQrCode} alt="QR Prezenta" className="w-48 h-48" />
                <p className="text-xs text-gray-400">Disponibil doar când evenimentul e activ</p>
              </div>
              <p className="text-xs text-orange-500 mt-3">⚠️ Evenimentul nu este activ — QR-ul nu validează prezența</p>
            </>
          )}
        </div>
      )}

      {/* ── Dacă nu există QR de prezență încă ── */}
      {!event.attendanceQrCode && event.status === 'open' && (
        <div className={inline ? 'card p-6 text-center text-gray-400' : 'text-center text-gray-400 py-4'}>
          <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">QR-ul de prezență va fi generat la deschiderea evenimentului.</p>
        </div>
      )}
    </div>
  )
}
