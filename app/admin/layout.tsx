'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Admin access required</p>
          <Button
            onClick={() => {
              logout()
              router.push('/login')
            }}
            variant="outline"
          >
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-blue-700 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold">QMS Admin</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { name: 'Dashboard', href: '/admin', icon: '📊' },
            { name: 'Branches', href: '/admin/branches', icon: '🏢' },
            { name: 'Services', href: '/admin/services', icon: '⚙️' },
            { name: 'Devices', href: '/admin/devices', icon: '📱' },
            { name: 'Operators', href: '/admin/operators', icon: '👥' },
            { name: 'Settings', href: '/admin/settings', icon: '⚡' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          {sidebarOpen && (
            <div className="mb-3 text-xs">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-blue-200 text-xs">{user?.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Queue Management System</h1>
          <p className="text-sm text-gray-600">Admin Dashboard</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
