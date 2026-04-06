'use client'
import { Bell, Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { setOpen } = useSidebar()
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center px-3 sm:px-6 gap-3 sticky top-0 z-30">
      {/* Hamburger — mobile only */}
      <button
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0 md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Deschide meniu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-gray-500 leading-tight truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 relative">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
