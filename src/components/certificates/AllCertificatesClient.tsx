'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Award, Download, Search, FileText, User, CalendarDays } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface AllCertificatesClientProps {
  certificates: any[]
}

export function AllCertificatesClient({ certificates }: AllCertificatesClientProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  const filtered = certificates.filter(c => {
    const matchSearch =
      !search ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.certificateNo?.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || c.type === filterType
    return matchSearch && matchType
  })

  function downloadCertificate(cert: any) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()

    // Background
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageW, pageH, 'F')

    // Outer border (blue)
    doc.setDrawColor(26, 58, 110)
    doc.setLineWidth(3)
    doc.rect(10, 10, pageW - 20, pageH - 20)
    // Inner border (gold)
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

    // Gold separator
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(1.5)
    doc.line(30, 67, pageW - 30, 67)

    // Body
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Prin prezenta se atestă că', pageW / 2, 82, { align: 'center' })

    // Name
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 58, 110)
    doc.text(cert.user?.name || cert.user?.email || 'Voluntar', pageW / 2, 97, { align: 'center' })

    // Role
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text('a participat în calitate de VOLUNTAR la evenimentul', pageW / 2, 110, { align: 'center' })

    // Event title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 58, 110)
    doc.text(cert.event?.title || 'Eveniment USVT', pageW / 2, 124, { align: 'center', maxWidth: pageW - 60 })

    // Event dates
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    if (cert.event?.startDate) {
      const start = format(new Date(cert.event.startDate), 'd MMMM yyyy', { locale: ro })
      const end = format(new Date(cert.event.endDate), 'd MMMM yyyy', { locale: ro })
      doc.text(`Perioada: ${start} – ${end}`, pageW / 2, 138, { align: 'center' })
    }

    // Gold line 2
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(1)
    doc.line(30, 155, pageW - 30, 155)

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const issued = format(new Date(cert.issuedAt), 'dd.MM.yyyy', { locale: ro })
    doc.text(`Nr. Adeverință: ${cert.certificateNo}`, 20, 168)
    doc.text(`Data emiterii: ${issued}`, pageW / 2, 168, { align: 'center' })
    doc.text('Semnătură Responsabil Imagine', pageW - 20, 168, { align: 'right' })
    doc.setDrawColor(150, 150, 150)
    doc.line(pageW - 80, 175, pageW - 20, 175)

    doc.save(`adeverinta-${cert.certificateNo}.pdf`)
    toast.success('PDF descărcat!')
  }

  const types = [...new Set(certificates.map(c => c.type))]

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="usvt-card p-4 border border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3 text-blue-700">
            <Award className="w-5 h-5" />
            <div>
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-xs opacity-70">Total adeverințe</p>
            </div>
          </div>
        </div>
        <div className="usvt-card p-4 border border-green-200 bg-green-50">
          <div className="flex items-center gap-3 text-green-700">
            <User className="w-5 h-5" />
            <div>
              <p className="text-2xl font-bold">{new Set(certificates.map(c => c.userId)).size}</p>
              <p className="text-xs opacity-70">Voluntari unici</p>
            </div>
          </div>
        </div>
        <div className="usvt-card p-4 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 text-amber-700">
            <CalendarDays className="w-5 h-5" />
            <div>
              <p className="text-2xl font-bold">{new Set(certificates.map(c => c.eventId)).size}</p>
              <p className="text-xs opacity-70">Evenimente acoperite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="usvt-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută după voluntar, eveniment sau nr. adeverință..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="usvt-input pl-9 w-full"
            />
          </div>
          {types.length > 1 && (
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="usvt-input">
              <option value="">Toate tipurile</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="usvt-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="usvt-table">
            <thead>
              <tr>
                <th>Nr. Adeverință</th>
                <th>Voluntar</th>
                <th>Eveniment</th>
                <th>Tip</th>
                <th>Data emiterii</th>
                <th>Descărcat</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Nicio adeverință găsită</p>
                  </td>
                </tr>
              ) : (
                filtered.map((cert: any) => (
                  <tr key={cert.id}>
                    <td>
                      <span className="font-mono text-sm font-medium text-blue-700">{cert.certificateNo}</span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{cert.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{cert.user?.email}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cert.event?.title}</p>
                        <p className="text-xs text-gray-500">
                          {cert.event?.startDate
                            ? format(new Date(cert.event.startDate), 'd MMM yyyy', { locale: ro })
                            : '—'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {cert.type}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {format(new Date(cert.issuedAt), 'dd.MM.yyyy HH:mm')}
                    </td>
                    <td className="text-sm text-gray-500">
                      {cert.downloadedAt
                        ? format(new Date(cert.downloadedAt), 'dd.MM.yyyy')
                        : <span className="text-gray-300">Niciodată</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => downloadCertificate(cert)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors"
                        style={{ background: '#1a3a6e' }}
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            {filtered.length} din {certificates.length} adeverințe
          </div>
        )}
      </div>
    </div>
  )
}
