'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { SPACE_TYPES } from '@/types'
import { Plus, Building2, Users, Edit, Trash2, MapPin } from 'lucide-react'

export function SpacesClient({ spaces }: { spaces: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'conferinta', capacity: '', floor: '', building: '', description: '', isActive: true,
  })

  function resetForm() {
    setForm({ name: '', type: 'conferinta', capacity: '', floor: '', building: '', description: '', isActive: true })
    setEditId(null)
    setShowForm(false)
  }

  async function handleSave() {
    if (!form.name) { toast.error('Completați numele spațiului'); return }
    setLoading(true)
    try {
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `/api/spaces/${editId}` : '/api/spaces'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, capacity: Number(form.capacity) }),
      })
      if (!res.ok) throw new Error('Eroare')
      toast.success(editId ? 'Spațiu actualizat!' : 'Spațiu creat!')
      resetForm()
      router.refresh()
    } catch {
      toast.error('Eroare la salvare')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(space: any) {
    setForm({ name: space.name, type: space.type, capacity: space.capacity, floor: space.floor || '', building: space.building || '', description: space.description || '', isActive: space.isActive })
    setEditId(space.id)
    setShowForm(true)
  }

  const typeInfo = (type: string) => SPACE_TYPES.find(t => t.value === type) || { label: type, icon: '🏛️' }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Spațiu Nou
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg animate-fade-in">
            <h3 className="font-semibold text-gray-900 mb-4">{editId ? 'Editare' : 'Spațiu Nou'}</h3>
            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label">Denumire *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="ex: Aula Magna" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Tip</label>
                  <select className="form-input" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    {SPACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacitate (loc.)</label>
                  <input className="form-input" type="number" min={0} value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Clădire</label>
                  <input className="form-input" value={form.building} onChange={e => setForm(f => ({...f, building: e.target.value}))} placeholder="ex: Corp A" />
                </div>
                <div className="form-group">
                  <label className="form-label">Etaj</label>
                  <input className="form-input" value={form.floor} onChange={e => setForm(f => ({...f, floor: e.target.value}))} placeholder="ex: Parter, 1, 2..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descriere</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="rounded" />
                <span className="text-sm">Spațiu activ</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn btn-primary flex-1" onClick={handleSave} disabled={loading}>
                {loading ? 'Salvează...' : 'Salvează'}
              </button>
              <button className="btn btn-secondary" onClick={resetForm}>Anulează</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {spaces.map(space => {
          const ti = typeInfo(space.type)
          return (
            <div key={space.id} className={`card p-5 ${!space.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ti.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{space.name}</h3>
                    <p className="text-xs text-gray-400">{ti.label}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm p-1.5" onClick={() => startEdit(space)}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {space.capacity} persoane</p>
                {(space.building || space.floor) && (
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />
                    {[space.building, space.floor && `Et. ${space.floor}`].filter(Boolean).join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-400">{space._count?.eventSpaces || 0} utilizări</p>
              </div>
              {!space.isActive && (
                <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 text-center">Inactiv</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
