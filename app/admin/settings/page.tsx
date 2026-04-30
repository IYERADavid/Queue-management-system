'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SystemSettings } from '@/lib/types'
import { getSystemSettings, updateSystemSettings } from '@/lib/db/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState(false)
  const [formData, setFormData] = useState<Partial<SystemSettings>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await getSystemSettings()
      if (res.success && res.data) {
        setSettings(res.data)
        setFormData(res.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    setEdited(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateSystemSettings(formData)
      if (res.success && res.data) {
        setSettings(res.data)
        setEdited(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure your institution's queue management system</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Configuration</CardTitle>
          <CardDescription>Basic system information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
            <Input
              value={formData.institutionName || ''}
              onChange={(e) => handleChange('institutionName', e.target.value)}
              placeholder="Your Institution Name"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Ticket Expiry (minutes)</label>
              <Input
                type="number"
                value={formData.defaultTicketExpiryMinutes || 120}
                onChange={(e) => handleChange('defaultTicketExpiryMinutes', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Update Interval (seconds)</label>
              <Input
                type="number"
                value={formData.displayUpdateIntervalSeconds || 2}
                onChange={(e) => handleChange('displayUpdateIntervalSeconds', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
            <select
              value={formData.timeZone || 'UTC'}
              onChange={(e) => handleChange('timeZone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Standard Time</option>
              <option value="CST">Central Standard Time</option>
              <option value="MST">Mountain Standard Time</option>
              <option value="PST">Pacific Standard Time</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Enable or disable system features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Mobile Booking</p>
              <p className="text-sm text-gray-600">Allow customers to book tickets remotely</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableMobileBooking || false}
                onChange={(e) => handleChange('enableMobileBooking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="font-medium">QR Code Tickets</p>
              <p className="text-sm text-gray-600">Generate QR codes for quick check-in</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableQRCode || false}
                onChange={(e) => handleChange('enableQRCode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={!edited || saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {edited && (
          <Button
            variant="outline"
            onClick={() => {
              setFormData(settings || {})
              setEdited(false)
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
