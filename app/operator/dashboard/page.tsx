'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useQueue } from '@/context/queue-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Operator, Ticket } from '@/lib/types'
import { getOperatorById, getBranches } from '@/lib/db/api'
import { AlertCircle, CheckCircle2, SkipForward, Pause, LogOut, Phone } from 'lucide-react'

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
    isLoading,
  } = useQueue()

  const [operator, setOperator] = useState<Operator | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCurrentDetails, setShowCurrentDetails] = useState(true)
  const [operatorStatus, setOperatorStatusLocal] = useState('idle')

  useEffect(() => {
    if (!user || user.role !== 'operator' || !user.operatorId) {
      router.push('/login')
      return
    }

    loadOperatorData()
  }, [user, router])

  const loadOperatorData = async () => {
    try {
      if (user?.operatorId) {
        const res = await getOperatorById(user.operatorId)
        if (res.success && res.data) {
          setOperator(res.data)
          setOperatorStatusLocal(res.data.status)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const currentTicket = operator?.currentTicketId
    ? tickets.find((t) => t.id === operator.currentTicketId)
    : null

  const nextWaitingTicket = tickets.find(
    (t) => t.status === 'waiting' && !t.calledBy
  )

  const handleCallNext = async () => {
    if (user?.operatorId) {
      try {
        await callNext(user.operatorId)
        await loadOperatorData()
      } catch (error) {
        console.error('Error calling next customer:', error)
      }
    }
  }

  const handleComplete = async () => {
    if (currentTicket && user?.operatorId) {
      try {
        await completeCustomer(currentTicket.id, user.operatorId)
        await loadOperatorData()
      } catch (error) {
        console.error('Error completing customer:', error)
      }
    }
  }

  const handleSkip = async () => {
    if (currentTicket && user?.operatorId) {
      try {
        await skipCustomer(currentTicket.id, user.operatorId)
        await loadOperatorData()
      } catch (error) {
        console.error('Error skipping customer:', error)
      }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (user?.operatorId) {
      try {
        setOperatorStatusLocal(newStatus)
        await setOperatorStatus(user.operatorId, newStatus)
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading operator dashboard...</p>
        </div>
      </div>
    )
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Unable to load operator information</p>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Operator Service</h1>
            <p className="text-blue-100">Welcome, {operator.name}</p>
          </div>
          <div className="flex gap-3">
            <div
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                operatorStatus === 'serving'
                  ? 'bg-green-500 text-white'
                  : operatorStatus === 'idle'
                    ? 'bg-blue-500 text-white'
                    : 'bg-orange-500 text-white'
              }`}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              {operatorStatus.toUpperCase()}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white hover:bg-gray-100 text-blue-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Service Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Customer */}
            {currentTicket ? (
              <Card className="border-2 border-green-200 shadow-lg">
                <CardHeader className="bg-green-50 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-700">Currently Serving</CardTitle>
                    <div className="animate-pulse">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Ticket Number Large Display */}
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-8 rounded-lg text-center border-2 border-green-300">
                      <p className="text-gray-600 text-sm mb-2">Ticket Number</p>
                      <p className="text-6xl font-bold text-green-600">{currentTicket.ticketNumber}</p>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                        <p className="font-bold text-lg text-gray-900">{currentTicket.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Service</p>
                        <p className="font-bold text-lg text-gray-900">{currentTicket.serviceName}</p>
                      </div>
                    </div>

                    {currentTicket.customerPhone && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Phone</p>
                        <p className="font-medium text-gray-900">{currentTicket.customerPhone}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                      <Button
                        onClick={handleComplete}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                      <Button
                        onClick={handleSkip}
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        disabled={isLoading}
                      >
                        <SkipForward className="w-4 h-4 mr-1" />
                        Skip
                      </Button>
                      <Button
                        onClick={() => handleStatusChange('break')}
                        variant="outline"
                        disabled={isLoading}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Break
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-700">No Customer Currently Being Served</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-6">
                    Click the &quot;Call Next Customer&quot; button to start serving
                  </p>
                  <Button
                    onClick={handleCallNext}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    disabled={!nextWaitingTicket || isLoading}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Next Customer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Next in Queue Preview */}
            {nextWaitingTicket && currentTicket && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Next in Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{nextWaitingTicket.ticketNumber}</p>
                      <p className="text-sm text-gray-600">{nextWaitingTicket.customerName}</p>
                    </div>
                    <Button
                      onClick={handleCallNext}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Statistics & Queue Status */}
          <div className="space-y-6">
            {/* Operator Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600">Shifts Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{operator.shiftsCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Customers Served</p>
                  <p className="text-3xl font-bold text-green-600">{operator.customersServed}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['idle', 'serving', 'break', 'offline'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full p-2 rounded text-sm font-medium transition ${
                      operatorStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Waiting Queue Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Queue Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-600 font-medium">Waiting</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {tickets.filter((t) => t.status === 'waiting').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Being Served</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {tickets.filter((t) => t.status === 'serving' || t.status === 'called').length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-600 font-medium">Completed Today</p>
                  <p className="text-2xl font-bold text-green-700">
                    {tickets.filter((t) => t.status === 'completed').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Waiting Customers List */}
        {tickets.filter((t) => t.status === 'waiting').length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Waiting Customers Queue</CardTitle>
              <CardDescription>
                {tickets.filter((t) => t.status === 'waiting').length} customers in queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tickets
                  .filter((t) => t.status === 'waiting')
                  .map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{ticket.ticketNumber}</p>
                          <p className="text-sm text-gray-600">{ticket.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{ticket.serviceName}</p>
                        <p className="text-xs text-gray-600">
                          Wait: {ticket.estimatedWaitTime}m
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
