'use client'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ROLE_LABELS, INTERNAL_ENTITIES } from '@/types'
import type { UserRole } from '@/types'
import { getRoleColor } from '@/lib/permissions'
import { getInitials } from '@/lib/utils'
import { Plus, Search, Shield, User, Mail, Phone } from 'lucide-react'

const ALL_ROLES: UserRole[] = [
  'superadmin','administrator','organizator','imagine','rectorat',
  'voluntar','sponsor','agrocampus','catering_extern','tehnic','partener','auditor'
]

export function UsersClient({
  users, currentUserRole, currentUserId
}: {
  users: any[]; currentUserRole: UserRole; currentUserId: string
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'auditor' as UserRole,
    organizatorType: 'intern', organizatorEntity: '', organizatorCompany: '',
    phone: '', department: '',
  })

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  }), [users, search, roleFilter])

  async function handleCreate() {
    if (!form.email || !form.password) { toast.error('Email și parolă obligatorii'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Utilizator creat!')
      setShowForm(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) { toast.success('Status actualizat'); router.refresh() }
    else toast.error('Eroare')
  }

  const availableRoles = currentUserRole === 'superadmin' ? ALL_ROLES : ALL_ROLES.filter(r => r !== 'superadmin')

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="form-input pl-9" placeholder="Caută utilizator..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Toate rolurile</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Utilizator Nou
        </button>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-6 w-full max-w-lg animate-fade-in my-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" style={{color:'#1a3a6e'}} /> Utilizator Nou
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Nume Complet</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Parolă *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol *</label>
                  <select className="form-input" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value as UserRole}))}>
                    {availableRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              {form.role === 'organizator' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Tip Organizator</label>
                    <select className="form-input" value={form.organizatorType} onChange={e => setForm(f => ({...f, organizatorType: e.target.value}))}>
                      <option value="intern">Intern</option>
                      <option value="extern">Extern</option>
                    </select>
                  </div>
                  {form.organizatorType === 'intern' ? (
                    <div className="form-group">
                      <label className="form-label">Entitate</label>
                      <select className="form-input" value={form.organizatorEntity} onChange={e => setForm(f => ({...f, organizatorEntity: e.target.value}))}>
                        <option value="">Selectați...</option>
                        {INTERNAL_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Organizație</label>
                      <input className="form-input" value={form.organizatorCompany} onChange={e => setForm(f => ({...f, organizatorCompany: e.target.value}))} />
                    </div>
                  )}
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Departament</label>
                  <input className="form-input" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn btn-primary flex-1" onClick={handleCreate} disabled={loading}>
                {loading ? 'Se creează...' : 'Creează Utilizator'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Anulează</button>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Utilizator</th><th>Rol</th><th>Entitate / Organizație</th><th>Contact</th><th>Activitate</th><th>Status</th><th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                         style={{background:'#1a3a6e'}}>
                      {getInitials(u.name || u.email)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name || '–'}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getRoleColor(u.role as UserRole)}`}>
                    {ROLE_LABELS[u.role as UserRole] || u.role}
                  </span>
                </td>
                <td className="text-sm text-gray-600 max-w-xs truncate">
                  {u.organizatorEntity || u.organizatorCompany || '–'}
                </td>
                <td>
                  <p className="text-sm text-gray-600">{u.phone || '–'}</p>
                </td>
                <td>
                  <p className="text-xs text-gray-500">{u._count?.createdEvents || 0} ev.</p>
                  <p className="text-xs text-gray-500">{u._count?.volunteerRecords || 0} vol.</p>
                </td>
                <td>
                  {u.isActive ? (
                    <span className="status-badge bg-green-100 text-green-800 border-green-200">Activ</span>
                  ) : (
                    <span className="status-badge bg-gray-100 text-gray-600 border-gray-200">Inactiv</span>
                  )}
                </td>
                <td>
                  {u.id !== currentUserId && !(u.role === 'superadmin' && currentUserRole !== 'superadmin') && (
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-secondary text-orange-600' : 'btn-success'}`}
                      onClick={() => toggleActive(u.id, u.isActive)}>
                      {u.isActive ? 'Dezactivează' : 'Activează'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
