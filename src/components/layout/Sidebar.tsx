'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import { ROLE_LABELS } from '@/types'
import type { UserRole } from '@/types'
import { useSidebar } from './SidebarContext'
import {
  LayoutDashboard, Calendar, CalendarDays, Users, Building2,
  Award, Settings, LogOut, Megaphone, ClipboardList,
  UserCheck, FileText, ChevronRight, X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ['superadmin','administrator','organizator','imagine','rectorat','voluntar','sponsor','agrocampus','catering_extern','tehnic','partener','auditor'],
  },
  {
    label: 'Calendar Evenimente',
    href: '/calendar',
    icon: <CalendarDays className="w-4 h-4" />,
    roles: ['superadmin','administrator','organizator','imagine','rectorat','voluntar','sponsor','agrocampus','catering_extern','tehnic','partener','auditor'],
  },
  {
    label: 'Evenimente',
    href: '/events',
    icon: <Megaphone className="w-4 h-4" />,
    roles: ['superadmin','administrator','organizator','imagine','rectorat','sponsor','agrocampus','catering_extern','tehnic','partener','auditor'],
  },
  {
    label: 'Evenimente Mele',
    href: '/my-events',
    icon: <ClipboardList className="w-4 h-4" />,
    roles: ['voluntar'],
  },
  {
    label: 'Voluntariat',
    href: '/volunteers',
    icon: <UserCheck className="w-4 h-4" />,
    roles: ['superadmin','administrator','imagine'],
  },
  {
    label: 'Adeverințe Mele',
    href: '/my-certificates',
    icon: <Award className="w-4 h-4" />,
    roles: ['voluntar'],
  },
  {
    label: 'Adeverințe',
    href: '/certificates',
    icon: <FileText className="w-4 h-4" />,
    roles: ['superadmin','administrator'],
  },
  {
    label: 'Săli & Spații',
    href: '/spaces',
    icon: <Building2 className="w-4 h-4" />,
    roles: ['superadmin','administrator'],
  },
  {
    label: 'Utilizatori',
    href: '/users',
    icon: <Users className="w-4 h-4" />,
    roles: ['superadmin','administrator'],
  },
  {
    label: 'Setări',
    href: '/settings',
    icon: <Settings className="w-4 h-4" />,
    roles: ['superadmin'],
  },
]

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role: UserRole
    organizatorEntity?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role))

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full w-64 usvt-gradient flex flex-col z-40 shadow-xl',
      'transition-transform duration-300 ease-in-out',
      // Mobile: hidden by default, shown when open
      open ? 'translate-x-0' : '-translate-x-full',
      // Desktop: always visible
      'md:translate-x-0',
    )}>
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0">
            <Image
              src="/logos/usvt-main.png"
              alt="USVT"
              width={48}
              height={48}
              className="rounded-full border-2 border-white/30 object-contain bg-white p-0.5"
            />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white font-bold text-sm leading-tight">USVT Events</p>
            <p className="text-blue-200 text-xs leading-tight mt-0.5">Management Evenimente</p>
          </div>
          {/* Close button — mobile only */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 md:hidden flex-shrink-0"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn('sidebar-nav-item', isActive && 'active')}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors mb-2">
          <div className="w-9 h-9 rounded-full bg-usvt-gold flex items-center justify-center flex-shrink-0"
               style={{ background: '#c9a84c' }}>
            <span className="text-white text-xs font-bold">
              {getInitials(user.name || user.email)}
            </span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-sm font-medium truncate leading-tight">
              {user.name || 'Utilizator'}
            </p>
            <p className="text-blue-200 text-xs truncate leading-tight">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sidebar-nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Deconectare</span>
        </button>
      </div>
    </aside>
  )
}
