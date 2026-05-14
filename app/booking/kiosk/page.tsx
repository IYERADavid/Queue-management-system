'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueue } from '@/context/queue-context'
import { getBranches, getServices } from '@/lib/db/api'
import { Branch, Service, Ticket } from '@/lib/types'
import { AlertCircle, CheckCircle, Printer, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TicketBookingKiosk() {
  const router = useRouter()
  const { createNewTicket, currentBranchId, setCurrentBranchId } = useQueue()
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [step, setStep] = useState<'branch' | 'service' | 'details' | 'confirmation'>('branch')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null)
  const [autoResetSeconds, setAutoResetSeconds] = useState(30)

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

    try {
      const ticket = await createNewTicket(currentBranchId, selectedServiceId, customerName, customerPhone)
      setCreatedTicket(ticket)
      setStep('confirmation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNewTicket = useCallback(() => {
    setStep('branch')
    setSelectedServiceId('')
    setCustomerName('')
    setCustomerPhone('')
    setError('')
    setCreatedTicket(null)
    setAutoResetSeconds(30)
  }, [])

  useEffect(() => {
    if (step !== 'confirmation') return
    setAutoResetSeconds(30)
    let remaining = 30
    const id = window.setInterval(() => {
      remaining -= 1
      setAutoResetSeconds(remaining)
      if (remaining <= 0) {
        window.clearInterval(id)
        handleNewTicket()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [step, handleNewTicket])

  const handleBackToHome = () => {
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Queue Ticket System</h1>
          <p className="text-gray-600">Kiosk Self-Service</p>
        </div>

        {/* Step 1: Select Branch */}
        {step === 'branch' && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Select Your Branch</CardTitle>
              <CardDescription>Choose the location you&apos;re visiting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <p className="font-semibold text-gray-900">{branch.name}</p>
                  <p className="text-sm text-gray-600">{branch.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{branch.address}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Service */}
        {step === 'service' && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
              <CardDescription>
                Choose the service you need at {branches.find((b) => b.id === currentBranchId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No services available</p>
              ) : (
                services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                  >
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>⏱️ Avg: {service.averageTimeMinutes} mins</span>
                      <span>⌛ Max wait: {service.maxWaitTime} mins</span>
                    </div>
                  </button>
                ))
              )}
              <Button
                variant="outline"
                onClick={() => setStep('branch')}
                className="w-full mt-4"
              >
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Enter Details */}
        {step === 'details' && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your details for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                {error && (
                  <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1-555-0000"
                    type="tel"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Service:</span> {services.find((s) => s.id === selectedServiceId)?.name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Get Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('service')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-green-50">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <CardTitle className="text-green-700">Ticket Created Successfully!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              {/* Ticket Display */}
              <div className="border-4 border-dashed border-blue-300 p-6 rounded-lg bg-blue-50 text-center">
                <p className="text-sm text-gray-600 mb-2">Your Ticket Number</p>
                <p className="text-6xl font-bold text-blue-600 mb-4" data-testid="kiosk-ticket-number">
                  {createdTicket?.ticketNumber ?? '—'}
                </p>
                <div className="bg-white p-4 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Service:</span>{' '}
                    {createdTicket?.serviceName ?? services.find((s) => s.id === selectedServiceId)?.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {customerName}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <span className="font-medium">Estimated Wait Time:</span>{' '}
                  {createdTicket?.estimatedWaitTime != null
                    ? `~${createdTicket.estimatedWaitTime} minutes`
                    : '15–20 minutes'}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 border border-blue-200 px-4 py-3 text-center">
                <p className="text-sm font-medium text-blue-900">
                  Returning to branch selection in <span className="tabular-nums font-bold">{autoResetSeconds}</span>s
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Your ticket is ready</p>
                <p>✓ Check the display screen for queue updates</p>
                <p>✓ Keep your ticket number visible</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Ticket
                </Button>
                <Button onClick={handleNewTicket} variant="outline" className="flex-1">
                  Start now
                </Button>
              </div>

              <Button
                onClick={handleBackToHome}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
