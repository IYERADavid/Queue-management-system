'use client'

import { useEffect, useState } from 'react'
import { useQueue } from '@/context/queue-context'
import { getBranches } from '@/lib/db/api'
import { Branch, Ticket } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const statusStyles = {
  waiting: 'bg-yellow-50 border-yellow-300',
  called: 'bg-blue-50 border-blue-300 animate-pulse',
  serving: 'bg-green-50 border-green-300 animate-pulse',
  completed: 'bg-gray-50 border-gray-300',
  skipped: 'bg-red-50 border-red-300',
  'on-hold': 'bg-orange-50 border-orange-300',
}

const statusLabels = {
  waiting: 'Waiting',
  called: 'Being Called',
  serving: 'Being Served',
  completed: 'Completed',
  skipped: 'Skipped',
  'on-hold': 'On Hold',
}

export default function QueueDisplay() {
  const { queueData, isRefreshing, currentBranchId, setCurrentBranchId } = useQueue()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
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
    loadBranches()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const nowServing = queueData?.tickets.filter((t) => t.status === 'serving' || t.status === 'called')
  const waitingTickets = queueData?.tickets.filter((t) => t.status === 'waiting')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p>Initializing queue display...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-4 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-6">
          <h1 className="text-5xl font-bold mb-2">Queue Display System</h1>
          <p className="text-xl text-blue-200">
            {queueData?.branchName || 'Loading...'} - {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Branch Selector */}
        <div className="flex gap-2 justify-center flex-wrap">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => setCurrentBranchId(branch.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentBranchId === branch.id
                  ? 'bg-white text-blue-900'
                  : 'bg-blue-800 text-white hover:bg-blue-700'
              }`}
            >
              {branch.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Now Serving */}
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <h2 className="text-2xl font-bold">NOW SERVING</h2>
              </div>
              <div className="p-4 space-y-3 min-h-96">
                {nowServing && nowServing.length > 0 ? (
                  nowServing.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white bg-opacity-20 backdrop-blur p-4 rounded-lg border-2 border-green-400 animate-pulse"
                    >
                      <p className="text-4xl font-bold mb-2">{ticket.ticketNumber}</p>
                      <p className="text-sm text-blue-100">{ticket.serviceName}</p>
                      <p className="text-sm mt-2">{ticket.customerName}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <p className="text-xl text-blue-200">No one is being served</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Waiting Queue */}
          <div className="lg:col-span-2">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
                <h2 className="text-2xl font-bold">WAITING QUEUE</h2>
                <p className="text-sm text-blue-100">
                  {waitingTickets?.length || 0} customers waiting
                </p>
              </div>
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {waitingTickets && waitingTickets.length > 0 ? (
                  waitingTickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className={`border-2 p-3 rounded-lg ${
                        statusStyles[ticket.status as keyof typeof statusStyles]
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900">#{index + 1}</p>
                          <p className="text-sm text-gray-700">{ticket.ticketNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{ticket.ticketNumber}</p>
                          <p className="text-xs text-gray-600">{ticket.serviceName}</p>
                          <p className="text-xs text-gray-600">{ticket.customerName}</p>
                        </div>
                        <div className="text-right">
                          {ticket.estimatedWaitTime !== undefined && (
                            <p className="text-sm font-medium text-gray-700">
                              Wait: {ticket.estimatedWaitTime}m
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1">
                            {statusLabels[ticket.status as keyof typeof statusLabels]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-blue-100">
                    <p className="text-lg">No customers waiting</p>
                    <p className="text-sm">Great service!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg border border-white border-opacity-20 text-center">
            <p className="text-3xl font-bold text-yellow-300 mb-1">
              {queueData?.stats.totalWaiting || 0}
            </p>
            <p className="text-sm text-blue-200">Waiting</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg border border-white border-opacity-20 text-center">
            <p className="text-3xl font-bold text-green-300 mb-1">
              {queueData?.stats.totalServing || 0}
            </p>
            <p className="text-sm text-blue-200">Serving</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg border border-white border-opacity-20 text-center">
            <p className="text-3xl font-bold text-emerald-300 mb-1">
              {queueData?.stats.totalCompleted || 0}
            </p>
            <p className="text-sm text-blue-200">Completed</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur p-4 rounded-lg border border-white border-opacity-20 text-center">
            <p className="text-3xl font-bold text-blue-300 mb-1">
              {queueData?.stats.averageWaitTime || 0}m
            </p>
            <p className="text-sm text-blue-200">Avg Wait</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-300 text-sm pb-6">
          <p>Last updated: {currentTime.toLocaleTimeString()}</p>
          {isRefreshing && <p className="text-xs mt-1">Updating...</p>}
        </div>
      </div>
    </div>
  )
}
