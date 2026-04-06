'use client'
import { Sidebar } from './Sidebar'
import { SidebarProvider, useSidebar } from './SidebarContext'
import type { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email?: string | null
    role: UserRole
    organizatorEntity?: string
  }
}

function LayoutInner({ children, user }: DashboardLayoutProps) {
  const { open, setOpen } = useSidebar()
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <Sidebar user={user} />
      <main className="flex-1 md:ml-64 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutInner user={user}>{children}</LayoutInner>
    </SidebarProvider>
  )
}
