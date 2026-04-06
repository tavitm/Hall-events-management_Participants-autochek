'use client'
import Image from 'next/image'
import type { UserRole } from '@/types'
import { Download, QrCode, Shield } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export function QRSection({ event, role }: { event: any; role: UserRole }) {
  function downloadQR(dataUrl: string, filename: string) {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Promo QR */}
      {event.promoQrCode && (
        <div className="card p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5" style={{color:'#1a3a6e'}} />
            <h3 className="font-semibold text-gray-900">QR Promovare</h3>
          </div>
          <div className="qr-container mx-auto inline-flex">
            <img src={event.promoQrCode} alt="QR Promo" className="w-48 h-48" />
            <p className="text-xs text-gray-500">Scanează pentru informații eveniment</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">Generat la validarea evenimentului</p>
          <button
            className="btn btn-secondary btn-sm mt-3"
            onClick={() => downloadQR(event.promoQrCode, `qr-promo-${event.id}.png`)}>
            <Download className="w-3.5 h-3.5" /> Descarcă QR
          </button>
        </div>
      )}

      {/* Attendance QR */}
      {event.attendanceQrCode && (
        <div className={`card p-6 text-center ${event.status === 'open' ? 'ring-2 ring-green-400' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5" style={{color:'#2e7d32'}} />
            <h3 className="font-semibold text-gray-900">QR Prezență Voluntari</h3>
          </div>
          {event.status === 'open' ? (
            <>
              <div className="qr-container mx-auto inline-flex border-green-400 pulse-green">
                <img src={event.attendanceQrCode} alt="QR Prezenta" className="w-48 h-48" />
                <p className="text-xs text-green-600 font-medium">✓ ACTIV - Scanează pentru check-in</p>
              </div>
              {event.attendanceQrExpiry && (
                <p className="text-xs text-gray-400 mt-3">Expiră: {formatDateTime(event.attendanceQrExpiry)}</p>
              )}
            </>
          ) : (
            <>
              <div className="qr-container mx-auto inline-flex opacity-50">
                <img src={event.attendanceQrCode} alt="QR Prezenta" className="w-48 h-48" />
                <p className="text-xs text-gray-400">Disponibil doar când evenimentul e activ</p>
              </div>
              <p className="text-xs text-orange-500 mt-3">⚠️ Evenimentul nu este activ - QR invalidat</p>
            </>
          )}
          {['superadmin','administrator','imagine','organizator'].includes(role) && (
            <button
              className="btn btn-secondary btn-sm mt-3"
              onClick={() => downloadQR(event.attendanceQrCode, `qr-prezenta-${event.id}.png`)}>
              <Download className="w-3.5 h-3.5" /> Descarcă QR
            </button>
          )}
        </div>
      )}
    </div>
  )
}
