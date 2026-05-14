'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueue } from '@/context/queue-context'
import { getBranches, getServices, getTicketById } from '@/lib/db/api'
import { getLastMobileEmail, getMobileBookingsForEmail, recordMobileBooking } from '@/lib/mobile-booking-storage'
import { Branch, Ticket } from '@/lib/types'
import { ArrowRight, CheckCircle, Smartphone, Clock, MapPin, List, TicketPlus, RefreshCw } from 'lucide-react'

type WizardStep = 'branch' | 'service' | 'details' | 'confirmation'

const BOOK_AGAIN_COOLDOWN = 30

export default function MobileBooking() {
  const { createNewTicket, currentBranchId, setCurrentBranchId } = useQueue()
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState<'list' | 'book'>('list')
  const [step, setStep] = useState<WizardStep>('branch')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null)

  const [listEmail, setListEmail] = useState('')
  const [listRows, setListRows] = useState<Array<{ record: { ticketId: string; email: string; branchId: string; createdAt: string }; ticket: Ticket | null }>>([])
  const [listLoading, setListLoading] = useState(false)

  const [bookAgainSeconds, setBookAgainSeconds] = useState(0)
  const bookAnotherArmed = useRef(false)

  const loadBranches = useCallback(async () => {
    const res = await getBranches()
    if (res.success && res.data) {
      setBranches(res.data)
      if (res.data.length > 0 && !currentBranchId) setCurrentBranchId(res.data[0].id)
    }
  }, [currentBranchId, setCurrentBranchId])

  useEffect(() => {
    ;(async () => {
      await loadBranches()
      setLoading(false)
    })()
  }, [loadBranches])

  useEffect(() => {
    if (view === 'book' && step === 'service' && currentBranchId) {
      void (async () => {
        const res = await getServices(currentBranchId)
        if (res.success && res.data) setServices(res.data)
      })()
    }
  }, [view, step, currentBranchId])

  useEffect(() => {
    setListEmail((e) => e || getLastMobileEmail())
  }, [])

  const refreshTicketList = useCallback(async () => {
    const email = listEmail.trim().toLowerCase()
    if (!email) {
      setListRows([])
      return
    }
    setListLoading(true)
    try {
      const records = getMobileBookingsForEmail(email)
      const rows = await Promise.all(
        records.map(async (record) => {
          const res = await getTicketById(record.ticketId)
          return { record, ticket: res.success && res.data ? res.data : null }
        })
      )
      setListRows(rows)
    } finally {
      setListLoading(false)
    }
  }, [listEmail])

  useEffect(() => {
    if (view !== 'list') return
    if (!listEmail.trim()) {
      setListRows([])
      return
    }
    void refreshTicketList()
    const id = window.setInterval(() => void refreshTicketList(), 2000)
    return () => window.clearInterval(id)
  }, [view, listEmail, refreshTicketList])

  useEffect(() => {
    if (bookAgainSeconds <= 0) return
    const id = window.setInterval(() => {
      setBookAgainSeconds((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [bookAgainSeconds])

  const resetWizard = useCallback(() => {
    setStep('branch')
    setSelectedServiceId('')
    setCustomerName('')
    setCustomerPhone('')
    setError('')
    setCreatedTicket(null)
  }, [])

  useEffect(() => {
    if (bookAgainSeconds !== 0) return
    if (!bookAnotherArmed.current) return
    bookAnotherArmed.current = false
    resetWizard()
  }, [bookAgainSeconds, resetWizard])

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
      const email = customerEmail.trim().toLowerCase()
      const ticket = await createNewTicket(currentBranchId, selectedServiceId, customerName, customerPhone, email)
      setCreatedTicket(ticket)
      recordMobileBooking({
        ticketId: ticket.id,
        email,
        branchId: currentBranchId,
        createdAt: new Date().toISOString(),
      })
      setStep('confirmation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    }
  }

  const handleDoneToList = () => {
    bookAnotherArmed.current = false
    setBookAgainSeconds(0)
    setListEmail(customerEmail.trim().toLowerCase() || getLastMobileEmail())
    resetWizard()
    setView('list')
    void refreshTicketList()
  }

  const handleBookAnotherWithCooldown = () => {
    if (bookAgainSeconds > 0) return
    bookAnotherArmed.current = true
    setBookAgainSeconds(BOOK_AGAIN_COOLDOWN)
  }

  const startNewBooking = () => {
    if (bookAgainSeconds > 0) return
    resetWizard()
    setView('book')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 pb-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 mt-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Smartphone className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mobile booking</h1>
          </div>
          <div className="flex gap-2 justify-center mt-4">
            <Button
              type="button"
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              className={view === 'list' ? 'bg-blue-600' : ''}
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4 mr-1" />
              My tickets
            </Button>
            <Button
              type="button"
              variant={view === 'book' ? 'default' : 'outline'}
              size="sm"
              className={view === 'book' ? 'bg-blue-600' : ''}
              onClick={startNewBooking}
              disabled={bookAgainSeconds > 0}
            >
              <TicketPlus className="w-4 h-4 mr-1" />
              Book
            </Button>
          </div>
        </div>

        {view === 'list' && (
          <Card className="shadow-lg border-0 mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Your tickets</CardTitle>
              <CardDescription>Enter the email you used when booking to see live status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={listEmail}
                  onChange={(e) => setListEmail(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => void refreshTicketList()} disabled={listLoading}>
                  <RefreshCw className={`w-4 h-4 ${listLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {!listEmail.trim() && <p className="text-sm text-gray-600">Type your email and tap refresh to load.</p>}
              {listRows.length === 0 && listEmail.trim() && !listLoading && (
                <p className="text-sm text-gray-600">No saved tickets for this email on this device yet.</p>
              )}
              <div className="space-y-3">
                {listRows.map(({ record, ticket }) => (
                  <div key={record.ticketId} className="rounded-lg border border-gray-200 bg-white p-3 text-sm space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-2xl font-black text-blue-700 tabular-nums">{ticket?.ticketNumber ?? '—'}</span>
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        {ticket?.status ?? 'unknown'}
                      </span>
                    </div>
                    {ticket ? (
                      <>
                        <p>
                          <span className="text-gray-500">Service:</span> {ticket.serviceName}
                        </p>
                        <p>
                          <span className="text-gray-500">Customer:</span> {ticket.customerName}
                        </p>
                        {ticket.customerPhone && (
                          <p>
                            <span className="text-gray-500">Phone:</span> {ticket.customerPhone}
                          </p>
                        )}
                        <p>
                          <span className="text-gray-500">Branch:</span>{' '}
                          {branches.find((b) => b.id === ticket.branchId)?.name ?? ticket.branchId}
                        </p>
                        <p>
                          <span className="text-gray-500">Booked:</span> {new Date(record.createdAt).toLocaleString()}
                        </p>
                        <p>
                          <span className="text-gray-500">Position:</span> #{ticket.positionInQueue} in line
                        </p>
                        {ticket.estimatedWaitTime != null && (
                          <p>
                            <span className="text-gray-500">Est. wait:</span> ~{ticket.estimatedWaitTime} min
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-amber-700 text-xs">Ticket no longer in queue (completed or removed).</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {view === 'book' && (
          <>
            {step === 'branch' && (
              <Card className="shadow-lg border-0 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Select location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
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

            {step === 'service' && (
              <Card className="shadow-lg border-0 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Choose service</CardTitle>
                  <CardDescription>{branches.find((b) => b.id === currentBranchId)?.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelect(service.id)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                    >
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        Avg {service.averageTimeMinutes} min
                      </div>
                    </button>
                  ))}
                  <Button variant="outline" onClick={() => setStep('branch')} className="w-full mt-2">
                    Back
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'details' && (
              <Card className="shadow-lg border-0 mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Your details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTicket} className="space-y-3">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                      <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                      <Input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Get ticket
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setStep('service')} className="w-full">
                      Back
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 'confirmation' && createdTicket && (
              <Card className="shadow-lg border-0 mb-4">
                <CardHeader className="bg-green-50">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                    <CardTitle className="text-green-800">Booked</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="border-4 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50 text-center" data-testid="mobile-ticket-confirmation">
                    <p className="text-xs text-gray-600 mb-1">Your ticket</p>
                    <p className="text-5xl font-bold text-blue-700 tabular-nums">{createdTicket.ticketNumber}</p>
                  </div>
                  <div className="text-sm space-y-1 text-gray-800">
                    <p>
                      <span className="text-gray-500">Service:</span> {createdTicket.serviceName}
                    </p>
                    <p>
                      <span className="text-gray-500">Name:</span> {customerName}
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span> {customerEmail}
                    </p>
                  </div>
                  {bookAgainSeconds > 0 && (
                    <p className="text-center text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md py-2">
                      You can book again in <span className="font-mono font-bold">{bookAgainSeconds}</span>s
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleDoneToList}>
                      Done — view my tickets
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={bookAgainSeconds > 0}
                      onClick={handleBookAnotherWithCooldown}
                    >
                      {bookAgainSeconds > 0 ? `Next booking in ${bookAgainSeconds}s` : 'Book another'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
