'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Branch } from '@/lib/types'
import { getBranches, createBranch, updateBranch } from '@/lib/db/api'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phoneNumber: '',
  })

  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      const res = await getBranches()
      if (res.success && res.data) {
        setBranches(res.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateBranch(editingId, formData)
      } else {
        await createBranch(formData)
      }
      setFormData({ name: '', location: '', address: '', phoneNumber: '' })
      setEditingId(null)
      setShowForm(false)
      loadBranches()
    } catch (error) {
      console.error('Error saving branch:', error)
    }
  }

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      location: branch.location,
      address: branch.address,
      phoneNumber: branch.phoneNumber,
    })
    setEditingId(branch.id)
    setShowForm(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Branches</h2>
          <p className="text-gray-600">Manage your institutional branches</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', location: '', address: '', phoneNumber: '' })
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Branch
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Branch' : 'Create New Branch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Branch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Downtown"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1-555-0000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update' : 'Create'} Branch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
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
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{branch.name}</CardTitle>
                    <CardDescription>{branch.location}</CardDescription>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      branch.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Address:</span> {branch.address}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {branch.phoneNumber}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(branch)}
                    className="flex-1"
                  >
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
