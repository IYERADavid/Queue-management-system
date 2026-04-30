'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Device, Branch } from '@/lib/types'
import { getDevices, getBranches, registerDevice } from '@/lib/db/api'
import { Plus, Wifi, WifiOff } from 'lucide-react'

const deviceTypeIcons = {
  kiosk: '🎫',
  display: '📊',
  operator: '👨‍💼',
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState('branch-1')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'kiosk' as const,
    location: '',
  })

  useEffect(() => {
    loadData()
  }, [selectedBranchId])

  const loadData = async () => {
    try {
      const [devRes, brRes] = await Promise.all([
        getDevices(selectedBranchId),
        getBranches(),
      ])
      if (devRes.success && devRes.data) {
        setDevices(devRes.data)
      }
      if (brRes.success && brRes.data) {
        setBranches(brRes.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registerDevice({
        branchId: selectedBranchId,
        ...formData,
      })
      setFormData({ name: '', type: 'kiosk', location: '' })
      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Error registering device:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Devices</h2>
          <p className="text-gray-600">Manage kiosks, displays, and operator terminals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Register Device
        </Button>
      </div>

      {/* Branch Filter */}
      <div className="flex gap-2 flex-wrap">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranchId(branch.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedBranchId === branch.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {branch.name}
          </button>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Register New Device</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kiosk-01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="kiosk">Kiosk (Ticket Booking)</option>
                  <option value="display">Display Screen</option>
                  <option value="operator">Operator Terminal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Entrance Hall"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Register Device
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <Card key={device.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-3xl mb-2">
                      {deviceTypeIcons[device.type as keyof typeof deviceTypeIcons]}
                    </div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <CardDescription>{device.type}</CardDescription>
                  </div>
                  <div>
                    {device.isActive ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{device.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className={`font-medium ${device.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {device.isActive ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Heartbeat:</span>
                    <p className="font-medium text-xs">
                      {new Date(device.lastHeartbeat).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
