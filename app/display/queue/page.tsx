'use client'

import { useEffect, useState } from 'react'
import { useQueue } from '@/context/queue-context'
import { getBranches } from '@/lib/db/api'
import { Branch, Ticket } from '@/lib/types'

function isNowServing(ticket: Ticket) {
  return ticket.status === 'serving' || ticket.status === 'called'
}

const waitingCardClass =
  'border-2 border-slate-200 bg-white p-4 rounded-xl shadow-sm hover:border-slate-300 transition-colors'

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

  const nowServing = queueData?.tickets.filter(isNowServing) ?? []
  const waitingTickets = queueData?.tickets.filter((t) => t.status === 'waiting') ?? []

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mb-4" />
          <p className="text-lg text-slate-200">Initializing queue display…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center pt-4 md:pt-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">Queue Display</h1>
          <p className="text-lg md:text-xl text-amber-200/95 mt-2 font-medium">
            {queueData?.branchName ?? 'Loading…'} · {currentTime.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setCurrentBranchId(branch.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition shadow-md ${
                currentBranchId === branch.id
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200 ring-offset-2 ring-offset-slate-900'
                  : 'bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              {branch.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Now serving — opaque light panel so text stays readable at a distance */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400 ring-1 ring-white/10">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 border-b border-emerald-800/30">
                <h2 className="text-2xl md:text-3xl font-black tracking-wide text-white">NOW SERVING</h2>
                <p className="text-sm text-emerald-100 font-medium mt-1">Please proceed when your number appears</p>
              </div>
              <div className="bg-white p-4 md:p-5 min-h-[22rem]">
                {nowServing.length > 0 ? (
                  <div className="space-y-4">
                    {nowServing.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="rounded-2xl border-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white p-5 md:p-6 shadow-lg"
                      >
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800/80 mb-1">
                          {ticket.status === 'called' ? 'Called — please come forward' : 'Being served'}
                        </p>
                        <p className="text-5xl md:text-6xl font-black tabular-nums text-emerald-900 leading-none mb-3">
                          {ticket.ticketNumber}
                        </p>
                        <p className="text-lg font-semibold text-slate-900">{ticket.serviceName}</p>
                        <p className="text-base text-slate-600 mt-1">{ticket.customerName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[18rem] text-center px-4">
                    <p className="text-2xl font-bold text-slate-800">No counter active</p>
                    <p className="text-slate-600 mt-2 max-w-xs">
                      When an operator calls the next customer, the ticket number will show here in large type.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Waiting queue */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-600 bg-slate-900/80">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-4">
                <h2 className="text-2xl md:text-3xl font-black text-white">WAITING</h2>
                <p className="text-sm text-amber-100 font-semibold mt-1">
                  {waitingTickets.length} in line
                </p>
              </div>
              <div className="p-4 md:p-5 bg-slate-100 max-h-[28rem] overflow-y-auto space-y-3">
                {waitingTickets.length > 0 ? (
                  waitingTickets.map((ticket, index) => (
                    <div key={ticket.id} className={waitingCardClass}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-black text-slate-400 tabular-nums">#{index + 1}</span>
                          <div>
                            <p className="text-2xl font-black text-slate-900 tabular-nums">{ticket.ticketNumber}</p>
                            <p className="text-sm font-medium text-slate-600">{ticket.serviceName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{ticket.customerName}</p>
                          {ticket.estimatedWaitTime !== undefined && (
                            <p className="text-sm font-medium text-amber-800 mt-1">
                              Est. wait ~{ticket.estimatedWaitTime} min
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-14 px-4 rounded-xl bg-white border border-slate-200">
                    <p className="text-xl font-bold text-slate-800">No one waiting</p>
                    <p className="text-slate-600 mt-2">New tickets from the kiosk will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: 'Waiting', value: queueData?.stats.totalWaiting ?? 0, accent: 'text-amber-300' },
            { label: 'Serving', value: queueData?.stats.totalServing ?? 0, accent: 'text-emerald-300' },
            { label: 'Completed', value: queueData?.stats.totalCompleted ?? 0, accent: 'text-slate-200' },
            { label: 'Skipped', value: queueData?.stats.totalSkipped ?? 0, accent: 'text-rose-300' },
            { label: 'Avg wait', value: `${queueData?.stats.averageWaitTime ?? 0}m`, accent: 'text-sky-300' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-slate-800/90 border border-slate-600 p-4 text-center shadow-lg"
            >
              <p className={`text-3xl md:text-4xl font-black tabular-nums ${stat.accent}`}>{stat.value}</p>
              <p className="text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wide mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center text-slate-400 text-sm pb-6">
          <p>Last updated {currentTime.toLocaleTimeString()}</p>
          {isRefreshing && <p className="text-xs mt-1 text-slate-500">Refreshing…</p>}
        </div>
      </div>
    </div>
  )
}
