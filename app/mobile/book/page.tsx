'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueue } from '@/context/queue-context'
import { getBranches, getServices } from '@/lib/db/api'
import { Branch, Service } from '@/lib/types'
import { ArrowRight, CheckCircle, Smartphone, Clock, MapPin } from 'lucide-react'

export default function MobileBooking() {
  const { createNewTicket, currentBranchId, setCurrentBranchId } = useQueue()
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [step, setStep] = useState<'branch' | 'service' | 'details' | 'confirmation'>('branch')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [ticketNumber, setTicketNumber] = useState('A001')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (step === 'service' && currentBranchId) {
      loadServices()
    }
  }, [step, currentBranchId])

  const loadInitialData = async () => {
    try {
      const res = await getBranches()
      if (res.success && res.data) {
        setBranches(res.data)
        if (res.data.length > 0 && !currentBranchId) {
          setCurrentBranchId(res.data[0].id)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      const res = await getServices(currentBranchId)
      if (res.success && res.data) {
        setServices(res.data)
      }
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }

  const handleBranchSelect = (branchId: string) => {
    setCurrentBranchId(branchId)
    setStep('service')
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setStep('details')
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerName.trim()) {
      setError('Please enter your name')
      return
    }

    if (!customerEmail.trim()) {
      setError('Please enter your email')
      return
    }

    try {
      await createNewTicket(currentBranchId, selectedServiceId, customerName, customerPhone)
      setStep('confirmation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    }
  }

  const handleNewBooking = () => {
    setStep('branch')
    setSelectedServiceId('')
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 mt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mobile Booking</h1>
          </div>
          <p className="text-gray-600 text-sm">Book your service appointment online</p>
        </div>

        {/* Step 1: Select Branch */}
        {step === 'branch' && (
          <Card className="shadow-lg border-0 mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Select Location</CardTitle>
              <CardDescription>Which branch are you visiting?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{branch.name}</p>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {branch.location}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Service */}
        {step === 'service' && (
          <Card className="shadow-lg border-0 mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Choose Service</CardTitle>
              <CardDescription>
                {branches.find((b) => b.id === currentBranchId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    Avg wait: {service.averageTimeMinutes} mins
                  </div>
                </button>
              ))}
              <Button
                variant="outline"
                onClick={() => setStep('branch')}
                className="w-full mt-3"
              >
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter Details */}
        {step === 'details' && (
          <Card className="shadow-lg border-0 mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Your Information</CardTitle>
              <CardDescription>We&apos;ll send your ticket via email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                {error && (
                  <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <span>⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1-555-0000"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Service:</span>{' '}
                    {services.find((s) => s.id === selectedServiceId)?.name}
                  </p>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Book Appointment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('service')}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && (
          <>
            <Card className="shadow-lg border-0 mb-4">
              <CardHeader className="bg-green-50">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                  <CardTitle className="text-green-700">Booking Confirmed!</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Ticket Box */}
                <div className="border-4 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-xs text-gray-600 mb-1">Your Ticket Number</p>
                  <p className="text-5xl font-bold text-blue-600">{ticketNumber}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {services.find((s) => s.id === selectedServiceId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">
                      {branches.find((b) => b.id === currentBranchId)?.name}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                  <p className="font-medium mb-1">What&apos;s Next?</p>
                  <ul className="text-xs space-y-1">
                    <li>✓ Ticket sent to {customerEmail}</li>
                    <li>✓ You can visit the branch at your convenience</li>
                    <li>✓ Check the queue display when you arrive</li>
                  </ul>
                </div>

                <Button onClick={handleNewBooking} className="w-full bg-blue-600 hover:bg-blue-700">
                  Make Another Booking
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="border-0 shadow">
              <CardContent className="pt-6">
                <div className="space-y-2 text-xs text-gray-600">
                  <p>This is a mobile booking system for your convenience.</p>
                  <p>Your appointment is reserved with your ticket number.</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
