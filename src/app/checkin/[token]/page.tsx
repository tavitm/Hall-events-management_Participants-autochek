'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, LogIn, Award, Download, PartyPopper, Eye, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

export default function CheckInPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const token = params?.token as string
  const [result, setResult] = useState<{
    success?: boolean
    alreadyCheckedIn?: boolean
    message?: string
    event?: any
    certificate?: any
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && token && !result) {
      handleCheckIn()
    }
  }, [status, token])

  async function handleCheckIn() {
    setLoading(true)
    try {
      const res = await fetch(`/api/checkin/${token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setResult({ error: data.error })
      } else {
        setResult(data)
      }
    } catch {
      setResult({ error: 'Eroare de rețea. Verificați conexiunea.' })
    } finally {
      setLoading(false)
    }
  }

  function downloadCertificate(cert: any, userName: string) {
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

    // Header
    doc.setFillColor(26, 58, 110)
    doc.rect(10, 10, pageW - 20, 35, 'F')
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
    doc.text(userName || cert.user?.name || 'Voluntar', pageW / 2, 97, { align: 'center' })

    // Role
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text('a participat în calitate de VOLUNTAR la evenimentul', pageW / 2, 110, { align: 'center' })

    // Event title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 58, 110)
    const eventTitle = cert.event?.title || result?.event?.title || 'Eveniment USVT'
    doc.text(eventTitle, pageW / 2, 124, { align: 'center', maxWidth: pageW - 60 })

    // Dates
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const ev = cert.event || result?.event
    if (ev?.startDate) {
      const start = format(new Date(ev.startDate), 'd MMMM yyyy', { locale: ro })
      const end = format(new Date(ev.endDate), 'd MMMM yyyy', { locale: ro })
      doc.text(`Perioada: ${start} – ${end}`, pageW / 2, 138, { align: 'center' })
    }
    if (ev?.organizatorEntity) {
      doc.text(`Organizator: ${ev.organizatorEntity}`, pageW / 2, 146, { align: 'center' })
    }

    // Gold line
    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(1)
    doc.line(30, 155, pageW - 30, 155)

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const issued = format(new Date(cert.issuedAt || new Date()), 'dd.MM.yyyy', { locale: ro })
    doc.text(`Nr. Adeverință: ${cert.certificateNo}`, 20, 168)
    doc.text(`Data emiterii: ${issued}`, pageW / 2, 168, { align: 'center' })
    doc.text('Semnătură Responsabil Imagine', pageW - 20, 168, { align: 'right' })
    doc.setDrawColor(150, 150, 150)
    doc.line(pageW - 80, 175, pageW - 20, 175)

    doc.save(`adeverinta-${cert.certificateNo}.pdf`)
  }

  function previewCertificate(cert: any, userName: string) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, pageW, pageH, 'F')
    doc.setDrawColor(26, 58, 110); doc.setLineWidth(3); doc.rect(10, 10, pageW - 20, pageH - 20)
    doc.setLineWidth(1); doc.setDrawColor(201, 168, 76); doc.rect(13, 13, pageW - 26, pageH - 26)
    doc.setFillColor(26, 58, 110); doc.rect(10, 10, pageW - 20, 35, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('UNIVERSITATEA DE ȘTIINȚELE VIEȚII "REGELE MIHAI I" DIN TIMIȘOARA', pageW / 2, 24, { align: 'center' })
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text('Departamentul Imagine · Management Evenimente', pageW / 2, 33, { align: 'center' })
    doc.setTextColor(26, 58, 110); doc.setFontSize(28); doc.setFont('helvetica', 'bold')
    doc.text('ADEVERINȚĂ DE PARTICIPARE', pageW / 2, 62, { align: 'center' })
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(1.5); doc.line(30, 67, pageW - 30, 67)
    doc.setTextColor(30, 30, 30); doc.setFontSize(12); doc.setFont('helvetica', 'normal')
    doc.text('Prin prezenta se atestă că', pageW / 2, 82, { align: 'center' })
    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 58, 110)
    doc.text(userName || cert.user?.name || 'Voluntar', pageW / 2, 97, { align: 'center' })
    doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30)
    doc.text('a participat în calitate de VOLUNTAR la evenimentul', pageW / 2, 110, { align: 'center' })
    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 58, 110)
    doc.text(cert.event?.title || result?.event?.title || 'Eveniment USVT', pageW / 2, 124, { align: 'center', maxWidth: pageW - 60 })
    doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
    const ev = cert.event || result?.event
    if (ev?.startDate) {
      const start = format(new Date(ev.startDate), 'd MMMM yyyy', { locale: ro })
      const end = format(new Date(ev.endDate), 'd MMMM yyyy', { locale: ro })
      doc.text(`Perioada: ${start} – ${end}`, pageW / 2, 138, { align: 'center' })
    }
    if (ev?.organizatorEntity) doc.text(`Organizator: ${ev.organizatorEntity}`, pageW / 2, 146, { align: 'center' })
    doc.setDrawColor(201, 168, 76); doc.setLineWidth(1); doc.line(30, 155, pageW - 30, 155)
    doc.setFontSize(9); doc.setTextColor(100, 100, 100)
    const issued = format(new Date(cert.issuedAt || new Date()), 'dd.MM.yyyy', { locale: ro })
    doc.text(`Nr. Adeverință: ${cert.certificateNo}`, 20, 168)
    doc.text(`Data emiterii: ${issued}`, pageW / 2, 168, { align: 'center' })
    doc.text('Semnătură Responsabil Imagine', pageW - 20, 168, { align: 'right' })
    doc.setDrawColor(150, 150, 150); doc.line(pageW - 80, 175, pageW - 20, 175)
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center usvt-gradient-hero">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center usvt-gradient-hero p-4 relative">
      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/75 z-50 flex flex-col p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: '#c9a84c' }} />
                <span className="font-medium text-sm text-gray-900">Adeverință de Participare</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewUrl} download="adeverinta.pdf"
                   className="btn btn-primary btn-sm"
                   onClick={() => {}}>
                  <Download className="w-3.5 h-3.5" /> Descarcă
                </a>
                <button onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }}
                        className="btn btn-secondary btn-sm">
                  <X className="w-3.5 h-3.5" /> Închide
                </button>
              </div>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full" title="Previzualizare Adeverință" />
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Image
            src="/logos/usvt-main.png"
            alt="USVT"
            width={72}
            height={72}
            className="rounded-full border-4 border-blue-100 object-contain"
          />
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#1a3a6e' }}>Check-In Voluntar</h1>
        <p className="text-gray-400 text-sm mb-6">USVT Events · Înregistrare Prezență</p>

        {/* ── Neautentificat ── */}
        {status === 'unauthenticated' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm font-medium">Trebuie să fii autentificat cu un cont de voluntar pentru a înregistra prezența.</p>
            </div>
            <Link
              href={`/login?callbackUrl=/checkin/${token}`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: '#1a3a6e' }}
            >
              <LogIn className="w-4 h-4" />
              Autentifică-te pentru Check-In
            </Link>
          </div>
        )}

        {/* ── Se procesează ── */}
        {status === 'authenticated' && loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1a3a6e' }} />
            <p className="text-gray-500 text-sm">Se înregistrează prezența...</p>
          </div>
        )}

        {/* ── Succes ── */}
        {result?.success && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                {result.alreadyCheckedIn
                  ? <CheckCircle className="w-8 h-8 text-green-600" />
                  : <PartyPopper className="w-8 h-8 text-green-600" />
                }
              </div>
            </div>

            <div>
              <p className="text-green-700 font-semibold text-base">{result.message}</p>
              {result.alreadyCheckedIn && (
                <p className="text-sm text-gray-400 mt-1">Prezența ta a fost deja înregistrată anterior.</p>
              )}
            </div>

            {/* Event info */}
            {result.event && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                <p className="font-semibold text-gray-900 text-sm">{result.event.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(result.event.startDate), 'd MMMM yyyy · HH:mm', { locale: ro })}
                </p>
                {result.event.organizatorEntity && (
                  <p className="text-xs text-gray-400">{result.event.organizatorEntity}</p>
                )}
              </div>
            )}

            {/* Adeverință generată automat */}
            {result.certificate && (
              <div className="rounded-xl p-4 text-left border-2" style={{ background: '#fefbf0', borderColor: '#c9a84c' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" style={{ color: '#c9a84c' }} />
                  <span className="font-semibold text-sm" style={{ color: '#92630a' }}>
                    {result.alreadyCheckedIn ? 'Adeverință existentă' : 'Adeverință generată automat!'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Nr. {result.certificate.certificateNo}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => previewCertificate(result.certificate, session?.user?.name || '')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors hover:bg-blue-50"
                    style={{ borderColor: '#1a3a6e', color: '#1a3a6e' }}
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={() => downloadCertificate(result.certificate, session?.user?.name || '')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: '#1a3a6e' }}
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Link
                href="/my-certificates"
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Adeverințele Mele
              </Link>
              <Link
                href="/my-events"
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border text-white transition-opacity hover:opacity-90"
                style={{ background: '#2e7d32' }}
              >
                Evenimentele Mele
              </Link>
            </div>
          </div>
        )}

        {/* ── Eroare ── */}
        {result?.error && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-medium text-sm">{result.error}</p>
            </div>
            {result.error.includes('autentificat') ? (
              <Link href={`/login?callbackUrl=/checkin/${token}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-medium text-sm"
                style={{ background: '#1a3a6e' }}>
                <LogIn className="w-4 h-4" /> Autentifică-te
              </Link>
            ) : (
              <Link href="/dashboard"
                className="block w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                Înapoi la Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
