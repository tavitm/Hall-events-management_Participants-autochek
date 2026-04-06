// ─────────────────────────────────────────────────────────────────────
// USER ROLES & PERMISSIONS
// ─────────────────────────────────────────────────────────────────────
export type UserRole =
  | 'superadmin'
  | 'administrator'
  | 'organizator'
  | 'imagine'
  | 'rectorat'
  | 'voluntar'
  | 'sponsor'
  | 'agrocampus'
  | 'catering_extern'
  | 'tehnic'
  | 'partener'
  | 'auditor'

export type OrgType = 'intern' | 'extern'

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Administrator',
  administrator: 'Administrator',
  organizator: 'Organizator',
  imagine: 'Departament Imagine',
  rectorat: 'Rectorat',
  voluntar: 'Voluntar',
  sponsor: 'Sponsor',
  agrocampus: 'Agrocampus (Catering Intern)',
  catering_extern: 'Catering Extern',
  tehnic: 'Furnizor Tehnic Extern',
  partener: 'Partener Eveniment',
  auditor: 'Auditor',
}

export const INTERNAL_ENTITIES = [
  'Facultatea de Agricultură',
  'Facultatea de Inginerie și Tehnologii Aplicate',
  'Facultatea de Management și Turism Rural',
  'Facultatea de Medicină Veterinară Timișoara',
  'Facultatea de Inginerie Alimentară',
  'Facultatea de Bioingineria Resurselor Animaliere',
  'Universitatea de Științele Vieții "Regele Mihai I" din Timișoara',
  'Liga Studențească USVT',
  'Fundația Universității',
  'Departamentul Imagine',
  'Rectorat',
  'Alte entități universitare',
]

// ─────────────────────────────────────────────────────────────────────
// EVENT STATUS
// ─────────────────────────────────────────────────────────────────────
export type EventStatus =
  | 'draft'
  | 'submitted'
  | 'validated'
  | 'approved'
  | 'open'
  | 'closed'
  | 'cancelled'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Ciornă',
  submitted: 'Trimis spre validare',
  validated: 'Validat (Rectorat)',
  approved: 'Aprobat (Imagine)',
  open: 'Eveniment activ',
  closed: 'Finalizat',
  cancelled: 'Anulat',
}

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  submitted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  validated: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-purple-100 text-purple-800 border-purple-200',
  open: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export const EVENT_TYPES = [
  { value: 'conferinta', label: 'Conferință' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'simpozion', label: 'Simpozion' },
  { value: 'gala', label: 'Gală' },
  { value: 'lansare', label: 'Lansare' },
  { value: 'competitie', label: 'Competiție' },
  { value: 'other', label: 'Altul' },
]

export const SPACE_TYPES = [
  { value: 'conferinta', label: 'Sală Conferință', icon: '🎤' },
  { value: 'tehnica', label: 'Sală Tehnică/Organizare', icon: '⚙️' },
  { value: 'coffee_break', label: 'Spațiu Coffee Break', icon: '☕' },
  { value: 'other', label: 'Altul', icon: '🏛️' },
]

export const EQUIPMENT_ITEMS = [
  'Proiector',
  'Ecran proiecție',
  'Sistem audio',
  'Microfon wireless',
  'Microfon podium',
  'Laptop prezentare',
  'Cameră video',
  'Sistem streaming live',
  'Tablă interactivă',
  'Flip chart',
  'Cablu HDMI',
  'Adaptoare prezentare',
  'Lumini scenă',
  'Podium/Pupitru',
  'Mese prezidiu',
  'Bannere/Roll-up',
  'Sistemul de traducere simultană',
  'Altele',
]

// ─────────────────────────────────────────────────────────────────────
// EXTENDED TYPES (with relations)
// ─────────────────────────────────────────────────────────────────────
export interface ExtendedEvent {
  id: string
  title: string
  description?: string | null
  eventType: string
  startDate: string | Date
  endDate: string | Date
  setupStartDate?: string | Date | null
  setupEndDate?: string | Date | null
  organizatorId: string
  organizatorName?: string | null
  organizatorType: string
  organizatorEntity?: string | null
  status: EventStatus
  estimatedParticipants: number
  actualParticipants?: number | null
  technicalRequirements?: string | null
  technicalNotes?: string | null
  cateringRequired: boolean
  cateringType?: string | null
  cateringNotes?: string | null
  coffeeBreakCount?: number | null
  lunchCount?: number | null
  dinnerCount?: number | null
  isPublic: boolean
  websiteUrl?: string | null
  promoQrCode?: string | null
  attendanceQrCode?: string | null
  attendanceQrToken?: string | null
  attendanceQrExpiry?: string | Date | null
  validatedById?: string | null
  validatedAt?: string | Date | null
  openedById?: string | null
  openedAt?: string | Date | null
  closedById?: string | null
  closedAt?: string | Date | null
  cancelledReason?: string | null
  otherRequirements?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  creator?: { id: string; name?: string | null; email?: string | null; organizatorEntity?: string | null }
  validator?: { id: string; name?: string | null } | null
  opener?: { id: string; name?: string | null } | null
  closer?: { id: string; name?: string | null } | null
  eventSpaces?: Array<{
    id: string
    role: string
    notes?: string | null
    space: { id: string; name: string; type: string; capacity: number }
  }>
  volunteerRecords?: Array<{
    id: string
    status: string
    role?: string | null
    checkedInAt?: string | Date | null
    user: { id: string; name?: string | null; email?: string | null }
  }>
  observations?: Array<{
    id: string
    content: string
    category: string
    isUrgent: boolean
    createdAt: string | Date
    user: { id: string; name?: string | null; role: string }
  }>
  equipment?: Array<{
    id: string
    name: string
    quantity: number
    status: string
    provider: string
  }>
  _count?: { volunteerRecords?: number; observations?: number }
}
