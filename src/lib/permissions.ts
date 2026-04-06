import { UserRole, EventStatus } from '@/types'

// ─────────────────────────────────────────────────────────────────────
// PERMISSION MATRIX
// ─────────────────────────────────────────────────────────────────────

export function canCreateEvent(role: UserRole): boolean {
  return ['superadmin', 'administrator', 'organizator'].includes(role)
}

export function canEditEvent(role: UserRole, status: EventStatus, hoursUntilEvent: number): boolean {
  if (['superadmin', 'administrator'].includes(role)) return true
  if (role === 'organizator') {
    return hoursUntilEvent >= 24 && ['draft', 'submitted'].includes(status)
  }
  return false
}

export function canValidateEvent(role: UserRole): boolean {
  return ['superadmin', 'administrator', 'rectorat'].includes(role)
}

export function canApproveEvent(role: UserRole): boolean {
  return ['superadmin', 'administrator', 'imagine'].includes(role)
}

export function canOpenEvent(role: UserRole): boolean {
  return ['superadmin', 'administrator', 'imagine', 'organizator'].includes(role)
}

export function canCloseEvent(role: UserRole): boolean {
  return ['superadmin', 'administrator', 'imagine', 'organizator'].includes(role)
}

export function canCancelEvent(role: UserRole): boolean {
  return ['superadmin'].includes(role)
}

export function canDeleteHistory(role: UserRole): boolean {
  return ['superadmin'].includes(role)
}

export function canManageUsers(role: UserRole): boolean {
  return ['superadmin', 'administrator'].includes(role)
}

export function canDeleteSuperadmin(role: UserRole): boolean {
  return role === 'superadmin'
}

export function canEditUniversityName(role: UserRole): boolean {
  return role === 'superadmin'
}

export function canAddObservation(role: UserRole): boolean {
  return [
    'superadmin', 'administrator', 'organizator', 'imagine',
    'rectorat', 'sponsor', 'agrocampus', 'catering_extern', 'tehnic'
  ].includes(role)
}

export function canSeeFullEventSheet(role: UserRole): boolean {
  return [
    'superadmin', 'administrator', 'organizator', 'imagine',
    'rectorat', 'sponsor', 'agrocampus', 'catering_extern', 'tehnic', 'partener'
  ].includes(role)
}

export function canSeeShortEventSheet(role: UserRole): boolean {
  return ['voluntar', 'auditor'].includes(role)
}

export function canViewCalendar(role: UserRole): boolean {
  return true // everyone can see calendar
}

export function canManageSpaces(role: UserRole): boolean {
  return ['superadmin', 'administrator'].includes(role)
}

export function canPreRegisterAsVolunteer(role: UserRole): boolean {
  return role === 'voluntar'
}

export function canCheckInVolunteer(role: UserRole): boolean {
  return ['superadmin', 'administrator', 'imagine', 'organizator'].includes(role)
}

export function canGenerateCertificate(role: UserRole): boolean {
  return role === 'voluntar'
}

export function canViewAllCertificates(role: UserRole): boolean {
  return ['superadmin', 'administrator'].includes(role)
}

export function getAccessibleRoutes(role: UserRole): string[] {
  const base = ['/dashboard', '/calendar']
  
  const routeMap: Partial<Record<UserRole, string[]>> = {
    superadmin: ['/dashboard', '/calendar', '/events', '/spaces', '/volunteers', '/users', '/certificates', '/settings'],
    administrator: ['/dashboard', '/calendar', '/events', '/spaces', '/volunteers', '/users', '/certificates'],
    organizator: ['/dashboard', '/calendar', '/events'],
    imagine: ['/dashboard', '/calendar', '/events'],
    rectorat: ['/dashboard', '/calendar', '/events'],
    voluntar: ['/dashboard', '/calendar', '/events', '/my-certificates', '/my-history'],
    sponsor: ['/dashboard', '/calendar', '/events'],
    agrocampus: ['/dashboard', '/calendar', '/events'],
    catering_extern: ['/dashboard', '/calendar', '/events'],
    tehnic: ['/dashboard', '/calendar', '/events'],
    partener: ['/dashboard', '/calendar', '/events'],
    auditor: ['/dashboard', '/calendar', '/events'],
  }
  
  return routeMap[role] || base
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    superadmin: 'bg-red-100 text-red-800 border-red-200',
    administrator: 'bg-orange-100 text-orange-800 border-orange-200',
    organizator: 'bg-blue-100 text-blue-800 border-blue-200',
    imagine: 'bg-purple-100 text-purple-800 border-purple-200',
    rectorat: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    voluntar: 'bg-green-100 text-green-800 border-green-200',
    sponsor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    agrocampus: 'bg-lime-100 text-lime-800 border-lime-200',
    catering_extern: 'bg-amber-100 text-amber-800 border-amber-200',
    tehnic: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    partener: 'bg-teal-100 text-teal-800 border-teal-200',
    auditor: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}
