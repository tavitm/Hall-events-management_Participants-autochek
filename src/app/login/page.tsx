'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard')
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email, password, redirect: false,
      })
      if (result?.error) {
        toast.error('Email sau parolă incorectă')
      } else {
        router.replace('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex usvt-gradient-hero">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 p-3">
              <Image src="/logos/usvt-main.png" alt="USVT" width={110} height={110} className="rounded-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Universitatea de Științele Vieții<br />
            <span className="text-yellow-300">"Regele Mihai I"</span><br />
            din Timișoara
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Sistem Integrat de Management al Evenimentelor
          </p>
          {/* Faculty logos */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {['fa','fita','management','vet','ia','bra'].map(f => (
              <div key={f} className="bg-white/10 rounded-xl p-2 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Image src={`/logos/${f}.png`} alt={f} width={56} height={56} className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white/95 backdrop-blur lg:rounded-l-3xl">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Image src="/logos/usvt-main.png" alt="USVT" width={80} height={80} className="rounded-full border-4 border-usvt-blue object-contain" />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Bun venit!</h2>
            <p className="text-gray-500 mt-1">Autentificați-vă în sistemul USVT Events</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Adresă Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="exemplu@usab-tm.ro"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parolă</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg mt-6"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Se conectează...' : 'Autentificare'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Nu aveți cont?{' '}
              <Link href="/register" className="text-usvt-blue font-medium hover:underline"
                    style={{ color: '#1a3a6e' }}>
                Solicitați acces
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">
              © {new Date().getFullYear()} USVT Timișoara · Toate drepturile rezervate
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
