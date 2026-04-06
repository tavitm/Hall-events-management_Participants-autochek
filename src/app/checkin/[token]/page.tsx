'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function CheckInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string
  const [result, setResult] = useState<{ success?: boolean; message?: string; event?: any; error?: string } | null>(null)
  const [loading, setLoading] = useState(false)

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
      setResult(data)
    } catch {
      setResult({ error: 'Eroare de rețea' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center usvt-gradient-hero">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center usvt-gradient-hero p-4">
      <div className="card w-full max-w-md p-8 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <Image src="/logos/usvt-main.png" alt="USVT" width={80} height={80} className="rounded-full border-4 border-blue-100 object-contain" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Check-In Voluntar</h1>
        <p className="text-gray-500 text-sm mb-6">USVT Events · Înregistrare Prezență</p>

        {status === 'unauthenticated' ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">Trebuie să fii autentificat pentru check-in</p>
            </div>
            <Link href={`/login?callbackUrl=/checkin/${token}`} className="btn btn-primary w-full">
              <LogIn className="w-4 h-4" /> Autentifică-te pentru Check-In
            </Link>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-8 h-8 animate-spin" style={{color:'#1a3a6e'}} />
            <p className="text-gray-500">Se procesează check-in-ul...</p>
          </div>
        ) : result?.success ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-green-700 font-semibold">{result.message}</p>
            {result.event && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                <p className="font-medium text-gray-900">{result.event.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(result.event.startDate).toLocaleString('ro-RO')}
                </p>
              </div>
            )}
            <Link href="/my-events" className="btn btn-primary w-full">
              Vezi Evenimentele Mele
            </Link>
          </div>
        ) : result?.error ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <p className="text-red-700 font-medium">{result.error}</p>
            <Link href="/dashboard" className="btn btn-secondary w-full">Înapoi la Dashboard</Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
