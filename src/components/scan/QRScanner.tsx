'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  Camera, CheckCircle, XCircle, Loader2, Award,
  Download, Eye, RefreshCcw, QrCode, X, ScanLine,
  PartyPopper, AlertCircle,
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import Link from 'next/link'

type ScanState = 'idle' | 'starting' | 'scanning' | 'processing' | 'success' | 'error'

interface CheckInResult {
  success?: boolean
  alreadyCheckedIn?: boolean
  message?: string
  event?: {
    id: string
    title: string
    startDate: string
    endDate: string
    organizatorEntity?: string
  }
  certificate?: {
    certificateNo: string
    issuedAt: string
    event?: any
    user?: any
  }
  error?: string
}

export function QRScanner() {
  const { data: session } = useSession()
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)
  const scannerDivRef = useRef<HTMLDivElement>(null)
  const scannedRef = useRef(false) // prevent double-scan

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch { /* ignore cleanup errors */ }
      scannerRef.current = null
    }
    scannedRef.current = false
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [stopScanner]) // eslint-disable-line react-hooks/exhaustive-deps

  function extractToken(url: string): string | null {
    // Match /checkin/{token} pattern (URL or raw token)
    const match = url.match(/\/checkin\/([a-zA-Z0-9_\-]+)/)
    return match ? match[1] : null
  }

  async function onScanSuccess(decodedText: string) {
    if (scannedRef.current) return
    scannedRef.current = true

    await stopScanner()
    setScanState('processing')

    const token = extractToken(decodedText)
    if (!token) {
      setScanState('error')
      setErrorMsg('QR Code invalid. Scanați un cod de prezență USVT Events.')
      return
    }

    try {
      const res = await fetch(`/api/checkin/${token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setScanState('error')
        setErrorMsg(data.error || 'Eroare la înregistrarea prezenței.')
      } else {
        setScanState('success')
        setResult(data)
      }
    } catch {
      setScanState('error')
      setErrorMsg('Eroare de rețea. Verificați conexiunea la internet.')
    }
  }

  async function startScanner() {
    setScanState('starting')
    setErrorMsg('')
    scannedRef.current = false

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (!scannerDivRef.current) return

      const scanner = new Html5Qrcode('qr-scanner-region')
      scannerRef.current = scanner

      setScanState('scanning')

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        onScanSuccess,
        () => { /* ignore per-frame errors */ }
      )
    } catch (err: any) {
      setScanState('idle')
      if (err?.message?.includes('Permission') || err?.message?.includes('permission')) {
        setErrorMsg('Accesul la cameră a fost refuzat. Permiteți accesul în setările browserului.')
      } else {
        setErrorMsg('Nu s-a putut porni camera. Verificați că dispozitivul are cameră disponibilă.')
      }
    }
  }

  async function reset() {
    await stopScanner()
    setResult(null)
    setErrorMsg('')
    setScanState('idle')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  // ── Certificate PDF helpers ─────────────────────────────────────────────
  function buildCertificatePdf(cert: any): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const userName = session?.user?.name || cert?.user?.name || 'Voluntar'

    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageW, pageH, 'F')

    doc.setDrawColor(26, 58, 110); doc.setLineWidth(3)
    doc.rect(10, 10, pageW - 20, pageH - 20)
    doc.setLineWidth(1); doc.setDrawColor(201, 168, 76)
    doc.rect(13, 13, pageW - 26, pageH - 26)

    doc.setFillColor(26, 58, 110)
    doc.rect(10, 10, pageW - 20, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('UNIVERSITATEA DE ȘTIINȚELE VIEȚII "REGELE MIHAI I" DIN TIMIȘOARA', pageW / 2, 24, { align: 'center' })
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text('Departamentul Imagine · Management Evenimente', pageW / 2, 33, { align: 'center' })

    doc.setTextColor(26, 58, 110); doc.setFontSize(28); doc.setFont('helvetica', 'bold')
    doc.text('ADEVERINȚĂ DE PARTICIPARE', pageW / 2, 62, { align: 'center' })

    doc.setDrawColor(201, 168, 76); doc.setLineWidth(1.5)
    doc.line(30, 67, pageW - 30, 67)

    doc.setTextColor(30, 30, 30); doc.setFontSize(12); doc.setFont('helvetica', 'normal')
    doc.text('Prin prezenta se atestă că', pageW / 2, 82, { align: 'center' })

    doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 58, 110)
    doc.text(userName, pageW / 2, 97, { align: 'center' })

    doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30)
    doc.text('a participat în calitate de VOLUNTAR la evenimentul', pageW / 2, 110, { align: 'center' })

    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 58, 110)
    const evTitle = cert?.event?.title || result?.event?.title || 'Eveniment USVT'
    doc.text(evTitle, pageW / 2, 124, { align: 'center', maxWidth: pageW - 60 })

    doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
    const ev = cert?.event || result?.event
    if (ev?.startDate) {
      const start = format(new Date(ev.startDate), 'd MMMM yyyy', { locale: ro })
      const end = format(new Date(ev.endDate), 'd MMMM yyyy', { locale: ro })
      doc.text(`Perioada: ${start} – ${end}`, pageW / 2, 138, { align: 'center' })
    }
    if (ev?.organizatorEntity) {
      doc.text(`Organizator: ${ev.organizatorEntity}`, pageW / 2, 146, { align: 'center' })
    }

    doc.setDrawColor(201, 168, 76); doc.setLineWidth(1)
    doc.line(30, 155, pageW - 30, 155)

    doc.setFontSize(9); doc.setTextColor(100, 100, 100)
    const issued = format(new Date(cert?.issuedAt || new Date()), 'dd.MM.yyyy', { locale: ro })
    doc.text(`Nr. Adeverință: ${cert?.certificateNo}`, 20, 168)
    doc.text(`Data emiterii: ${issued}`, pageW / 2, 168, { align: 'center' })
    doc.text('Semnătură Responsabil Imagine', pageW - 20, 168, { align: 'right' })
    doc.setDrawColor(150, 150, 150)
    doc.line(pageW - 80, 175, pageW - 20, 175)

    return doc
  }

  function downloadCert() {
    if (!result?.certificate) return
    const doc = buildCertificatePdf(result.certificate)
    doc.save(`adeverinta-${result.certificate.certificateNo}.pdf`)
  }

  function previewCert() {
    if (!result?.certificate) return
    const doc = buildCertificatePdf(result.certificate)
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
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
                <a href={previewUrl} download="adeverinta.pdf" className="btn btn-primary btn-sm">
                  <Download className="w-3.5 h-3.5" /> Descarcă
                </a>
                <button
                  onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }}
                  className="btn btn-secondary btn-sm"
                >
                  <X className="w-3.5 h-3.5" /> Închide
                </button>
              </div>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full" title="Previzualizare Adeverință" />
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto space-y-4">
        {/* ── Header card ── */}
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: '#1a3a6e' }}>
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Scanează QR Eveniment</h2>
            <p className="text-sm text-gray-500">
              Scanează codul QR de prezență al unui eveniment activ pentru a-ți înregistra participarea.
            </p>
          </div>
        </div>

        {/* ── Idle state ── */}
        {scanState === 'idle' && (
          <div className="card p-8 flex flex-col items-center text-center gap-5">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%)' }}>
              <ScanLine className="w-12 h-12" style={{ color: '#1a3a6e' }} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Pregătit pentru scanare</p>
              <p className="text-sm text-gray-500">
                Poziționați camera deasupra codului QR de pe ecranul sau afișajul evenimentului.
              </p>
            </div>
            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{errorMsg}</p>
              </div>
            )}
            <button
              onClick={startScanner}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-lg"
              style={{ background: '#1a3a6e' }}
            >
              <Camera className="w-4 h-4" />
              Pornește Camera
            </button>
          </div>
        )}

        {/* ── Starting ── */}
        {scanState === 'starting' && (
          <div className="card p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1a3a6e' }} />
            <p className="text-gray-500 text-sm">Se pornește camera...</p>
          </div>
        )}

        {/* ── Scanning ── */}
        {(scanState === 'scanning' || scanState === 'starting') && (
          <div className="card overflow-hidden">
            {/* Scanner div — html5-qrcode mounts here */}
            <div
              id="qr-scanner-region"
              ref={scannerDivRef}
              className="w-full"
              style={{ minHeight: 320 }}
            />
            {scanState === 'scanning' && (
              <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  <span className="text-sm text-gray-600 font-medium">Scanare activă...</span>
                </div>
                <button
                  onClick={reset}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Anulează
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Processing ── */}
        {scanState === 'processing' && (
          <div className="card p-10 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#1a3a6e' }} />
            <div className="text-center">
              <p className="font-semibold text-gray-800">Se înregistrează prezența...</p>
              <p className="text-sm text-gray-500 mt-1">Vă rugăm așteptați</p>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {scanState === 'success' && result && (
          <div className="card p-6 space-y-5 animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ background: result.alreadyCheckedIn ? '#f0fdf4' : '#f0fdf4' }}>
                {result.alreadyCheckedIn
                  ? <CheckCircle className="w-9 h-9 text-green-500" />
                  : <PartyPopper className="w-9 h-9 text-green-500" />
                }
              </div>
            </div>

            <div className="text-center">
              <p className="font-bold text-green-700 text-base">{result.message}</p>
              {result.alreadyCheckedIn && (
                <p className="text-sm text-gray-400 mt-1">Prezența ta fusese deja înregistrată anterior.</p>
              )}
            </div>

            {/* Event info */}
            {result.event && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm">{result.event.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(result.event.startDate), 'd MMMM yyyy · HH:mm', { locale: ro })}
                </p>
                {result.event.organizatorEntity && (
                  <p className="text-xs text-gray-400">{result.event.organizatorEntity}</p>
                )}
              </div>
            )}

            {/* Certificate */}
            {result.certificate && (
              <div className="rounded-xl p-4 border-2" style={{ background: '#fefbf0', borderColor: '#c9a84c' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="w-4 h-4" style={{ color: '#c9a84c' }} />
                  <span className="font-semibold text-sm" style={{ color: '#92630a' }}>
                    {result.alreadyCheckedIn ? 'Adeverință existentă' : 'Adeverință generată automat!'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Nr. {result.certificate.certificateNo}</p>
                <div className="flex gap-2">
                  <button
                    onClick={previewCert}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors hover:bg-blue-50"
                    style={{ borderColor: '#1a3a6e', color: '#1a3a6e' }}
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={downloadCert}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: '#1a3a6e' }}
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Scanează din nou
              </button>
              <Link
                href="/my-events"
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#2e7d32' }}
              >
                Evenimentele Mele
              </Link>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {scanState === 'error' && (
          <div className="card p-6 space-y-4 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700 font-medium text-sm">{errorMsg}</p>
            </div>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#1a3a6e' }}
            >
              <RefreshCcw className="w-4 h-4" /> Încearcă din nou
            </button>
          </div>
        )}

        {/* ── Instructions ── */}
        {(scanState === 'idle' || scanState === 'starting') && !errorMsg && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cum funcționează</p>
            <div className="space-y-2.5">
              {[
                { step: '1', text: 'Apasă "Pornește Camera" și acordă permisiunea de acces' },
                { step: '2', text: 'Îndreptă camera spre codul QR verde de la eveniment' },
                { step: '3', text: 'Prezența se înregistrează automat și primești adeverința' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: '#1a3a6e' }}>
                    {step}
                  </span>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
