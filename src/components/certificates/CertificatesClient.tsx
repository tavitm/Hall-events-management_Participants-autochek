'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { Award, Download, Plus, FileText } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface CertificatesClientProps {
  certificates: any[]
  checkedInEvents: any[]
  user: { id: string; name?: string | null; email?: string | null }
}

export function CertificatesClient({ certificates, checkedInEvents, user }: CertificatesClientProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState<string | null>(null)

  const certEventIds = new Set(certificates.map((c: any) => c.eventId))
  const availableForCert = checkedInEvents.filter((r: any) => !certEventIds.has(r.eventId))

  async function generateCertificate(eventId: string) {
    setGenerating(eventId)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, type: 'voluntar' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Adeverință generată!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGenerating(null)
    }
  }

  function downloadCertificate(cert: any) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()

    // Background
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageW, pageH, 'F')

    // Border
    doc.setDrawColor(26, 58, 110)
    doc.setLineWidth(3)
    doc.rect(10, 10, pageW - 20, pageH - 20)
    doc.setLineWidth(1)
    doc.setDrawColor(201, 168, 76)
    doc.rect(13, 13, pageW - 26, pageH - 26)

    // Header background
    doc.setFillColor(26, 58, 110)
    doc.rect(10, 10, pageW - 20, 35, 'F')

    // University name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('UNIVERSITATEA DE ȘTIINȚELE VIEȚII "REGELE MIHAI I" DIN TIMIȘOARA', pageW / 2, 24, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Departamentul Imagine · Management Evenimente', pageW / 2, 33, { align: 'center' })

    // Title
    doc.setTextColor(26, 58, 110)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('ADEVERINȚĂ DE PARTICIPARE', pageW / 2, 62, { align: 'center' })

    // Gold line
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(1.5)
    doc.line(30, 67, pageW - 30, 67)

    // Body text
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const bodyText = `Prin prezenta se atestă că`
    doc.text(bodyText, pageW / 2, 82, { align: 'center' })

    // Name
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 58, 110)
    doc.text(user.name || user.email || 'Voluntar', pageW / 2, 97, { align: 'center' })

    // Role line
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text('a participat în calitate de VOLUNTAR la evenimentul', pageW / 2, 110, { align: 'center' })

    // Event title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 58, 110)
    const eventTitle = cert.event?.title || 'Eveniment USVT'
    doc.text(eventTitle, pageW / 2, 124, { align: 'center', maxWidth: pageW - 60 })

    // Event details
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    if (cert.event?.startDate) {
      const dateStr = `${formatDate(cert.event.startDate)} – ${formatDate(cert.event.endDate)}`
      doc.text(`Perioada: ${dateStr}`, pageW / 2, 138, { align: 'center' })
    }
    if (cert.event?.organizatorEntity) {
      doc.text(`Organizator: ${cert.event.organizatorEntity}`, pageW / 2, 146, { align: 'center' })
    }

    // Gold line 2
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(1)
    doc.line(30, 155, pageW - 30, 155)

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Nr. Adeverință: ${cert.certificateNo}`, 20, 168)
    doc.text(`Data emiterii: ${formatDate(cert.issuedAt)}`, pageW / 2, 168, { align: 'center' })
    doc.text('Semnătură Responsabil Imagine', pageW - 20, 168, { align: 'right' })

    // Signature line
    doc.setDrawColor(150, 150, 150)
    doc.line(pageW - 80, 175, pageW - 20, 175)

    doc.save(`adeverinta-${cert.certificateNo}.pdf`)
    toast.success('PDF descărcat!')
  }

  return (
    <div className="space-y-6">
      {/* Available for generation */}
      {availableForCert.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" style={{color:'#2e7d32'}} />
            Poți genera adeverințe pentru ({availableForCert.length} ev.)
          </h3>
          <div className="space-y-2">
            {availableForCert.map((r: any) => (
              <div key={r.eventId} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.event.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.event.startDate)} · {r.event.organizatorEntity}</p>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => generateCertificate(r.eventId)}
                  disabled={generating === r.eventId}>
                  <Award className="w-3.5 h-3.5" />
                  {generating === r.eventId ? 'Se generează...' : 'Generează'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated certificates */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-4" style={{color:'#c9a84c'}} />
            Adeverințe Emise ({certificates.length})
          </h3>
        </div>
        {certificates.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Nu ai adeverințe generate încă</p>
            <p className="text-sm text-gray-400 mt-1">Participă la un eveniment și generează adeverința</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {certificates.map((cert: any) => (
              <div key={cert.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{background:'#f0f4fb'}}>
                  <Award className="w-5 h-5" style={{color:'#c9a84c'}} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{cert.event?.title}</p>
                  <p className="text-xs text-gray-400">
                    Nr. {cert.certificateNo} · {formatDate(cert.issuedAt)}
                  </p>
                  <p className="text-xs text-gray-400">{cert.event?.organizatorEntity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-badge bg-amber-50 text-amber-700 border-amber-200 text-xs capitalize">{cert.type}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => downloadCertificate(cert)}>
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
