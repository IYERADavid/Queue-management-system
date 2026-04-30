'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueue } from '@/context/queue-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getBranches, getDevices, getOperators, getSystemSettings } from '@/lib/db/api'
import { Branch, Device, Operator, SystemSettings } from '@/lib/types'

export default function AdminDashboard() {
  const router = useRouter()
  const { queueData, isRefreshing } = useQueue()
  const [branches, setBranches] = useState<Branch[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [brRes, devRes, opRes, setRes] = await Promise.all([
          getBranches(),
          getDevices(),
          getOperators(),
          getSystemSettings(),
        ])
        if (brRes.success && brRes.data) setBranches(brRes.data)
        if (devRes.success && devRes.data) setDevices(devRes.data)
        if (opRes.success && opRes.data) setOperators(opRes.data)
        if (setRes.success && setRes.data) setSettings(setRes.data)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const chartData = [
    {
      name: 'Mon',
      waiting: 12,
      served: 45,
      skipped: 3,
    },
    {
      name: 'Tue',
      waiting: 8,
      served: 52,
      skipped: 2,
    },
    {
      name: 'Wed',
      waiting: 15,
      served: 48,
      skipped: 4,
    },
    {
      name: 'Thu',
      waiting: 10,
      served: 61,
      skipped: 1,
    },
    {
      name: 'Fri',
      waiting: 22,
      served: 55,
      skipped: 5,
    },
  ]

  const services = [
    { name: 'Ticket Booking', href: '/booking/kiosk', description: 'Customer self-service kiosk', icon: '🎫' },
    { name: 'Queue Display', href: '/display/queue', description: 'Real-time queue display', icon: '📊' },
    { name: 'Operator Service', href: '/operator/dashboard', description: 'Staff service interface', icon: '👨‍💼' },
    { name: 'Mobile Booking', href: '/mobile/book', description: 'Remote booking without visit', icon: '📱' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome to Admin Hub</h2>
        <p className="text-blue-100">Manage your institution's queue management system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{branches.length}</div>
            <p className="text-xs text-gray-500 mt-1">Operational locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Waiting Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{queueData?.stats.totalWaiting || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Across all branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Being Served</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{queueData?.stats.totalServing || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Currently serving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{devices.length}</div>
            <p className="text-xs text-gray-500 mt-1">Kiosks & displays</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <Card key={i} className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <div className="text-4xl mb-2">{service.icon}</div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <Button
                  onClick={() => router.push(service.href)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Queue Activity</CardTitle>
          <CardDescription>Customer service metrics for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="waiting" fill="#f97316" name="Waiting" />
              <Bar dataKey="served" fill="#10b981" name="Served" />
              <Bar dataKey="skipped" fill="#ef4444" name="Skipped" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branches Info */}
        <Card>
          <CardHeader>
            <CardTitle>Branches</CardTitle>
            <CardDescription>Your operational locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {branches.slice(0, 3).map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{branch.name}</p>
                    <p className="text-xs text-gray-600">{branch.location}</p>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${branch.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
            <Button onClick={() => router.push('/admin/branches')} variant="outline" size="sm" className="w-full">
              Manage Branches
            </Button>
          </CardContent>
        </Card>

        {/* Operators Info */}
        <Card>
          <CardHeader>
            <CardTitle>Operators</CardTitle>
            <CardDescription>Staff working today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {operators.slice(0, 3).map((operator) => (
                <div key={operator.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{operator.name}</p>
                    <p className="text-xs text-gray-600">{operator.branchId}</p>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      operator.status === 'serving'
                        ? 'bg-green-100 text-green-700'
                        : operator.status === 'idle'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {operator.status}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => router.push('/admin/operators')} variant="outline" size="sm" className="w-full">
              Manage Operators
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
