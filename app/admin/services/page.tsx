'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Service, Branch } from '@/lib/types'
import { getServices, getBranches, createService } from '@/lib/db/api'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState('branch-1')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    averageTimeMinutes: 15,
    maxWaitTime: 120,
  })

  useEffect(() => {
    loadData()
  }, [selectedBranchId])

  const loadData = async () => {
    try {
      const [servRes, brRes] = await Promise.all([
        getServices(selectedBranchId),
        getBranches(),
      ])
      if (servRes.success && servRes.data) {
        setServices(servRes.data)
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
      await createService({
        branchId: selectedBranchId,
        ...formData,
      })
      setFormData({
        name: '',
        description: '',
        averageTimeMinutes: 15,
        maxWaitTime: 120,
      })
      setShowForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating service:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Services</h2>
          <p className="text-gray-600">Manage available services</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Service
        </Button>
      </div>

      {/* Branch Filter */}
      <div className="flex gap-2">
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
            <CardTitle>Create New Service</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., General Consultation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Service description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Time (minutes)</label>
                  <Input
                    type="number"
                    value={formData.averageTimeMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, averageTimeMinutes: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Wait Time (minutes)</label>
                  <Input
                    type="number"
                    value={formData.maxWaitTime}
                    onChange={(e) =>
                      setFormData({ ...formData, maxWaitTime: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Service
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
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Time:</span>
                    <span className="font-medium">{service.averageTimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Wait:</span>
                    <span className="font-medium">{service.maxWaitTime} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">{service.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
