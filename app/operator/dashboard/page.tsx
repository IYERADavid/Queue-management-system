'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useQueue } from '@/context/queue-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Operator, Ticket } from '@/lib/types'
import { getOperatorById } from '@/lib/db/api'
import { CheckCircle2, SkipForward, LogOut, Phone } from 'lucide-react'

export default function OperatorDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const {
    currentBranchId,
    tickets,
    callNext,
    completeCustomer,
    skipCustomer,
    setOperatorStatus,
    setCurrentBranchId,
    isLoading,
  } = useQueue()

  const [operator, setOperator] = useState<Operator | null>(null)
  const [loading, setLoading] = useState(true)
  const [operatorStatus, setOperatorStatusLocal] = useState<Operator['status']>('idle')

  const loadOperatorData = useCallback(async () => {
    if (!user?.operatorId) return
    try {
      const res = await getOperatorById(user.operatorId)
      if (res.success && res.data) {
        const op = res.data
        setOperator(op)
        setOperatorStatusLocal(op.status)
        if (op.branchId) setCurrentBranchId(op.branchId)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.operatorId, setCurrentBranchId])

  useEffect(() => {
    if (!user || user.role !== 'operator' || !user.operatorId) {
      router.push('/login')
      return
    }
    loadOperatorData()
  }, [user, router, loadOperatorData])

  const branchTickets = tickets.filter((t) => t.branchId === currentBranchId)
  const waitingList = branchTickets.filter((t) => t.status === 'waiting')
  const nextWaitingTicket = waitingList.find((t) => !t.calledBy) ?? null

  const currentTicket: Ticket | null =
    operator?.currentTicketId != null
      ? branchTickets.find((t) => t.id === operator.currentTicketId) ?? null
      : null

  useEffect(() => {
    if (!operator?.currentTicketId) return
    const t = branchTickets.find((x) => x.id === operator.currentTicketId)
    if (!t || (t.status !== 'called' && t.status !== 'serving')) {
      void loadOperatorData()
    }
  }, [branchTickets, operator?.currentTicketId, loadOperatorData])

  const handleCallNext = async () => {
    if (!user?.operatorId) return
    try {
      await callNext(user.operatorId)
      await loadOperatorData()
    } catch (error) {
      console.error('Error calling next customer:', error)
    }
  }

  const handleComplete = async () => {
    if (!currentTicket || !user?.operatorId) return
    try {
      await completeCustomer(currentTicket.id, user.operatorId)
      await loadOperatorData()
    } catch (error) {
      console.error('Error completing customer:', error)
    }
  }

  const handleSkip = async () => {
    if (!currentTicket || !user?.operatorId) return
    try {
      await skipCustomer(currentTicket.id, user.operatorId)
      await loadOperatorData()
    } catch (error) {
      console.error('Error skipping customer:', error)
    }
  }

  const handleStatusChange = async (newStatus: Operator['status']) => {
    if (!user?.operatorId) return
    try {
      setOperatorStatusLocal(newStatus)
      await setOperatorStatus(user.operatorId, newStatus)
      await loadOperatorData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const displayStatus: Operator['status'] =
    operator?.status === 'serving' && !currentTicket ? 'idle' : (operator?.status ?? 'idle')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    )
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Unable to load operator</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Return to login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const skippedCount = branchTickets.filter((t) => t.status === 'skipped').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Counter</h1>
            <p className="text-blue-100 text-sm">{operator.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-white/15 text-sm font-semibold uppercase tracking-wide">
              {displayStatus}
            </span>
            <Button onClick={handleLogout} variant="secondary" size="sm" className="bg-white text-blue-800 hover:bg-blue-50">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {nextWaitingTicket && (
            <Card className="border-2 border-amber-300 bg-amber-50/80">
              <CardHeader className="py-3">
                <CardTitle className="text-base text-amber-950">Next ticket to call</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-black text-amber-950 tabular-nums">{nextWaitingTicket.ticketNumber}</p>
                  <p className="text-sm font-medium text-amber-900 mt-1">{nextWaitingTicket.customerName}</p>
                  <p className="text-xs text-amber-800">{nextWaitingTicket.serviceName}</p>
                </div>
                {!currentTicket && (
                  <Button
                    onClick={handleCallNext}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                    aria-label="Call next customer"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call next
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {currentTicket ? (
            <Card className="border-2 border-green-300">
              <CardHeader className="bg-green-50 py-3 border-b border-green-200">
                <CardTitle className="text-green-900">Serving</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="text-center bg-green-50 rounded-lg py-6 border border-green-200">
                  <p className="text-xs text-green-800 uppercase tracking-wide mb-1">Ticket</p>
                  <p className="text-5xl font-black text-green-800 tabular-nums">{currentTicket.ticketNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-900">{currentTicket.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Service</p>
                    <p className="font-semibold text-gray-900">{currentTicket.serviceName}</p>
                  </div>
                </div>
                {currentTicket.customerPhone && (
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-500">Phone:</span> {currentTicket.customerPhone}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="border-orange-400 text-orange-700 hover:bg-orange-50"
                    disabled={isLoading}
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            !nextWaitingTicket && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Queue empty</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">No waiting tickets for this branch.</p>
                </CardContent>
              </Card>
            )
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Your status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Break or offline only when you are not serving a ticket.</p>
              {(['idle', 'break', 'offline'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`w-full p-2 rounded-md text-sm font-medium transition ${
                    operatorStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  disabled={isLoading || !!currentTicket}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Branch queue</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-2xl font-bold text-amber-900">{waitingList.length}</p>
                <p className="text-amber-800">Waiting</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-2xl font-bold text-blue-900">
                  {branchTickets.filter((t) => t.status === 'serving' || t.status === 'called').length}
                </p>
                <p className="text-blue-800">Called / serving</p>
              </div>
              <div className="rounded-lg bg-gray-100 border border-gray-200 p-3 col-span-2">
                <p className="text-2xl font-bold text-gray-900">{skippedCount}</p>
                <p className="text-gray-700">Skipped (session)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
