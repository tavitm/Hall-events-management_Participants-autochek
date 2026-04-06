'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { INTERNAL_ENTITIES, EVENT_TYPES, EQUIPMENT_ITEMS, SPACE_TYPES } from '@/types'
import type { UserRole } from '@/types'
import { Plus, Trash2, Save, Calendar } from 'lucide-react'

interface EventFormProps {
  spaces: any[]
  user: { id: string; role: UserRole; organizatorEntity?: string; name?: string | null }
  initialData?: any
}

export function EventForm({ spaces, user, initialData }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    eventType: initialData?.eventType || 'conferinta',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0,16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0,16) : '',
    setupStartDate: initialData?.setupStartDate ? new Date(initialData.setupStartDate).toISOString().slice(0,16) : '',
    setupEndDate: initialData?.setupEndDate ? new Date(initialData.setupEndDate).toISOString().slice(0,16) : '',
    organizatorType: initialData?.organizatorType || user.role === 'organizator' ? 'intern' : 'intern',
    organizatorEntity: initialData?.organizatorEntity || user.organizatorEntity || '',
    organizatorCompany: '',
    estimatedParticipants: initialData?.estimatedParticipants || '',
    technicalNotes: initialData?.technicalNotes || '',
    cateringRequired: initialData?.cateringRequired || false,
    cateringType: initialData?.cateringType || '',
    cateringNotes: initialData?.cateringNotes || '',
    coffeeBreakCount: initialData?.coffeeBreakCount || '',
    lunchCount: initialData?.lunchCount || '',
    dinnerCount: initialData?.dinnerCount || '',
    isPublic: initialData?.isPublic ?? true,
    websiteUrl: initialData?.websiteUrl || '',
    otherRequirements: initialData?.otherRequirements || '',
  })

  const [selectedSpaces, setSelectedSpaces] = useState<Array<{spaceId: string; role: string; notes: string}>>(
    initialData?.eventSpaces?.map((es: any) => ({ spaceId: es.spaceId, role: es.role, notes: es.notes || '' })) || []
  )
  const [equipment, setEquipment] = useState<Array<{name: string; quantity: number; provider: string; notes: string}>>(
    initialData?.equipment?.map((eq: any) => ({ name: eq.name, quantity: eq.quantity, provider: eq.provider, notes: eq.notes || '' })) || []
  )

  const [step, setStep] = useState(1)

  function updateForm(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addSpace() {
    if (spaces.length === 0) return
    setSelectedSpaces(s => [...s, { spaceId: spaces[0].id, role: 'main', notes: '' }])
  }

  function addEquipment() {
    setEquipment(e => [...e, { name: EQUIPMENT_ITEMS[0], quantity: 1, provider: 'intern', notes: '' }])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Completați câmpurile obligatorii')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        spaceIds: selectedSpaces,
        equipment,
      }
      const method = initialData ? 'PUT' : 'POST'
      const url = initialData ? `/api/events/${initialData.id}` : '/api/events'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Eroare')
      toast.success(initialData ? 'Eveniment actualizat!' : 'Eveniment creat cu succes!')
      router.push(`/events/${data.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Informații Generale', 'Program & Spații', 'Tehnic & Catering', 'Revizuire']

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Step indicator */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <button type="button" onClick={() => setStep(i+1)}
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  step > i+1 ? 'bg-green-500 text-white' :
                  step === i+1 ? 'text-white' : 'bg-gray-100 text-gray-400'
                }`}
                style={step === i+1 ? {background:'#1a3a6e'} : {}}>
                {step > i+1 ? '✓' : i+1}
              </button>
              <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length-1 && <div className={`h-0.5 flex-1 ${step > i+1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: General Info */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{color:'#1a3a6e'}} /> Informații Generale
          </h2>

          <div className="form-group">
            <label className="form-label">Titlu Eveniment *</label>
            <input className="form-input" placeholder="ex: Conferința Internațională de Agricultură 2025"
              value={form.title} onChange={e => updateForm('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Tip Eveniment</label>
              <select className="form-input" value={form.eventType} onChange={e => updateForm('eventType', e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tip Organizator</label>
              <select className="form-input" value={form.organizatorType} onChange={e => updateForm('organizatorType', e.target.value)}>
                <option value="intern">Intern (Universitate)</option>
                <option value="extern">Extern</option>
              </select>
            </div>
          </div>

          {form.organizatorType === 'intern' ? (
            <div className="form-group">
              <label className="form-label">Entitate Organizatoare *</label>
              <select className="form-input" value={form.organizatorEntity} onChange={e => updateForm('organizatorEntity', e.target.value)}>
                <option value="">Selectați...</option>
                {INTERNAL_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Organizație Externă *</label>
              <input className="form-input" placeholder="Numele organizației"
                value={form.organizatorCompany} onChange={e => updateForm('organizatorCompany', e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Descriere</label>
            <textarea className="form-input" rows={4} placeholder="Descrierea evenimentului..."
              value={form.description} onChange={e => updateForm('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Participanți Estimați</label>
              <input className="form-input" type="number" min={0} placeholder="0"
                value={form.estimatedParticipants} onChange={e => updateForm('estimatedParticipants', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Website (opțional)</label>
              <input className="form-input" type="url" placeholder="https://..."
                value={form.websiteUrl} onChange={e => updateForm('websiteUrl', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={e => updateForm('isPublic', e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Eveniment public (vizibil în calendar)</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 2: Schedule & Spaces */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Program Eveniment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Data & Ora Început *</label>
                <input className="form-input" type="datetime-local"
                  value={form.startDate} onChange={e => updateForm('startDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Data & Ora Sfârșit *</label>
                <input className="form-input" type="datetime-local"
                  value={form.endDate} onChange={e => updateForm('endDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pregătire Sală - Început</label>
                <input className="form-input" type="datetime-local"
                  value={form.setupStartDate} onChange={e => updateForm('setupStartDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pregătire Sală - Sfârșit</label>
                <input className="form-input" type="datetime-local"
                  value={form.setupEndDate} onChange={e => updateForm('setupEndDate', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Săli & Spații</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSpace}>
                <Plus className="w-3.5 h-3.5" /> Adaugă Spațiu
              </button>
            </div>
            {selectedSpaces.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Niciun spațiu selectat</p>
            ) : selectedSpaces.map((sp, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                <div className="col-span-5">
                  <label className="form-label text-xs">Sală</label>
                  <select className="form-input text-sm" value={sp.spaceId}
                    onChange={e => setSelectedSpaces(s => s.map((x,j) => j===i ? {...x, spaceId: e.target.value} : x))}>
                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name} ({s.capacity} loc.)</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="form-label text-xs">Rol</label>
                  <select className="form-input text-sm" value={sp.role}
                    onChange={e => setSelectedSpaces(s => s.map((x,j) => j===i ? {...x, role: e.target.value} : x))}>
                    <option value="main">Principal</option>
                    <option value="technical">Tehnic</option>
                    <option value="coffee_break">Coffee Break</option>
                    <option value="registration">Înregistrare</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="form-label text-xs">Note</label>
                  <input className="form-input text-sm" placeholder="..."
                    value={sp.notes} onChange={e => setSelectedSpaces(s => s.map((x,j) => j===i ? {...x, notes: e.target.value} : x))} />
                </div>
                <div className="col-span-1 flex justify-center pb-1">
                  <button type="button" className="text-red-400 hover:text-red-600"
                    onClick={() => setSelectedSpaces(s => s.filter((_,j) => j !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Technical & Catering */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Necesar Tehnic</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addEquipment}>
                <Plus className="w-3.5 h-3.5" /> Adaugă Echipament
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Note tehnice generale</label>
              <textarea className="form-input" rows={3} placeholder="Specificații tehnice, cerințe speciale..."
                value={form.technicalNotes} onChange={e => updateForm('technicalNotes', e.target.value)} />
            </div>
            {equipment.map((eq, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                <div className="col-span-5">
                  <label className="form-label text-xs">Echipament</label>
                  <select className="form-input text-sm" value={eq.name}
                    onChange={e => setEquipment(s => s.map((x,j) => j===i ? {...x, name: e.target.value} : x))}>
                    {EQUIPMENT_ITEMS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label text-xs">Cantitate</label>
                  <input className="form-input text-sm" type="number" min={1}
                    value={eq.quantity} onChange={e => setEquipment(s => s.map((x,j) => j===i ? {...x, quantity: Number(e.target.value)} : x))} />
                </div>
                <div className="col-span-2">
                  <label className="form-label text-xs">Furnizor</label>
                  <select className="form-input text-sm" value={eq.provider}
                    onChange={e => setEquipment(s => s.map((x,j) => j===i ? {...x, provider: e.target.value} : x))}>
                    <option value="intern">Intern</option>
                    <option value="tehnic_extern">Extern</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label text-xs">Note</label>
                  <input className="form-input text-sm" placeholder="..."
                    value={eq.notes} onChange={e => setEquipment(s => s.map((x,j) => j===i ? {...x, notes: e.target.value} : x))} />
                </div>
                <div className="col-span-1 flex justify-center pb-1">
                  <button type="button" className="text-red-400 hover:text-red-600"
                    onClick={() => setEquipment(s => s.filter((_,j) => j !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-900">Catering</h2>
              <label className="flex items-center gap-2 cursor-pointer ml-auto">
                <input type="checkbox" checked={form.cateringRequired} onChange={e => updateForm('cateringRequired', e.target.checked)} className="rounded" />
                <span className="text-sm">Necesită catering</span>
              </label>
            </div>
            {form.cateringRequired && (
              <>
                <div className="form-group">
                  <label className="form-label">Furnizor Catering</label>
                  <select className="form-input" value={form.cateringType} onChange={e => updateForm('cateringType', e.target.value)}>
                    <option value="">Selectați...</option>
                    <option value="agrocampus">Agrocampus (intern)</option>
                    <option value="extern">Catering extern</option>
                    <option value="both">Ambii furnizori</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Coffee Break (pers.)</label>
                    <input className="form-input" type="number" min={0} value={form.coffeeBreakCount} onChange={e => updateForm('coffeeBreakCount', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prânz (pers.)</label>
                    <input className="form-input" type="number" min={0} value={form.lunchCount} onChange={e => updateForm('lunchCount', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cină (pers.)</label>
                    <input className="form-input" type="number" min={0} value={form.dinnerCount} onChange={e => updateForm('dinnerCount', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mențiuni Catering</label>
                  <textarea className="form-input" rows={2} placeholder="Cerințe speciale, alergeni, meniu..."
                    value={form.cateringNotes} onChange={e => updateForm('cateringNotes', e.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="card p-6">
            <div className="form-group">
              <label className="form-label">Alte Cerințe</label>
              <textarea className="form-input" rows={3} placeholder="Orice alte necesități..."
                value={form.otherRequirements} onChange={e => updateForm('otherRequirements', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Revizuire & Salvare</h2>
          <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm" style={{background:'#f0f4fb'}}>
            <p className="font-medium" style={{color:'#1a3a6e'}}>Rezumat Eveniment</p>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <p><strong>Titlu:</strong> {form.title || '–'}</p>
              <p><strong>Tip:</strong> {form.eventType}</p>
              <p><strong>Organizator:</strong> {form.organizatorEntity || form.organizatorCompany || '–'}</p>
              <p><strong>Participanți:</strong> {form.estimatedParticipants || 0}</p>
              <p><strong>Început:</strong> {form.startDate ? new Date(form.startDate).toLocaleString('ro-RO') : '–'}</p>
              <p><strong>Sfârșit:</strong> {form.endDate ? new Date(form.endDate).toLocaleString('ro-RO') : '–'}</p>
              <p><strong>Spații:</strong> {selectedSpaces.length}</p>
              <p><strong>Echipamente:</strong> {equipment.length}</p>
              <p><strong>Catering:</strong> {form.cateringRequired ? `Da (${form.cateringType})` : 'Nu'}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Evenimentul va fi salvat ca <strong>Ciornă</strong>. Îl puteți trimite spre validare ulterior.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}>
          ← Înapoi
        </button>
        {step < 4 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep(s => Math.min(4, s+1))}>
            Înainte →
          </button>
        ) : (
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Se salvează...' : <><Save className="w-4 h-4" /> Salvează Evenimentul</>}
          </button>
        )}
      </div>
    </form>
  )
}
