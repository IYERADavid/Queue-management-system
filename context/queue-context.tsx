'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Ticket, Operator, BranchQueue } from '@/lib/types'
import {
  getTickets,
  getOperators,
  getQueueForBranch,
  createTicket,
  updateTicketStatus,
  updateOperatorStatus,
  callNextCustomer,
  completeTicket,
  skipTicket,
} from '@/lib/db/api'

interface QueueContextType {
  // Data
  currentBranchId: string
  setCurrentBranchId: (id: string) => void
  tickets: Ticket[]
  operators: Operator[]
  queueData: BranchQueue | null

  // Loading states
  isLoading: boolean
  isRefreshing: boolean

  // Queue operations
  refreshQueue: () => Promise<void>
  createNewTicket: (branchId: string, serviceId: string, customerName: string, customerPhone?: string) => Promise<void>
  callNext: (operatorId: string, serviceId?: string) => Promise<void>
  completeCustomer: (ticketId: string, operatorId: string) => Promise<void>
  skipCustomer: (ticketId: string, operatorId: string) => Promise<void>
  setOperatorStatus: (operatorId: string, status: string) => Promise<void>
}

const QueueContext = createContext<QueueContextType | undefined>(undefined)

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [currentBranchId, setCurrentBranchId] = useState('branch-1')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [queueData, setQueueData] = useState<BranchQueue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initial load
  useEffect(() => {
    refreshQueue()
    // Set up auto-refresh every 2 seconds
    const interval = setInterval(refreshQueue, 2000)
    return () => clearInterval(interval)
  }, [currentBranchId])

  const refreshQueue = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [ticketsRes, operatorsRes, queueRes] = await Promise.all([
        getTickets(currentBranchId),
        getOperators(currentBranchId),
        getQueueForBranch(currentBranchId),
      ])

      if (ticketsRes.success && ticketsRes.data) {
        setTickets(ticketsRes.data)
      }
      if (operatorsRes.success && operatorsRes.data) {
        setOperators(operatorsRes.data)
      }
      if (queueRes.success && queueRes.data) {
        setQueueData(queueRes.data)
      }
    } catch (error) {
      console.error('Failed to refresh queue:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [currentBranchId])

  const createNewTicket = useCallback(async (branchId: string, serviceId: string, customerName: string, customerPhone?: string) => {
    setIsLoading(true)
    try {
      const result = await createTicket(branchId, serviceId, customerName, customerPhone)
      if (result.success) {
        await refreshQueue()
      } else {
        throw new Error(result.error || 'Failed to create ticket')
      }
    } finally {
      setIsLoading(false)
    }
  }, [refreshQueue])

  const callNext = useCallback(async (operatorId: string, serviceId?: string) => {
    setIsLoading(true)
    try {
      const result = await callNextCustomer(operatorId, currentBranchId, serviceId)
      if (result.success) {
        await refreshQueue()
      } else {
        throw new Error(result.error || 'Failed to call next customer')
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentBranchId, refreshQueue])

  const completeCustomer = useCallback(async (ticketId: string, operatorId: string) => {
    setIsLoading(true)
    try {
      const result = await completeTicket(ticketId, operatorId)
      if (result.success) {
        await refreshQueue()
      } else {
        throw new Error(result.error || 'Failed to complete customer')
      }
    } finally {
      setIsLoading(false)
    }
  }, [refreshQueue])

  const skipCustomer = useCallback(async (ticketId: string, operatorId: string) => {
    setIsLoading(true)
    try {
      const result = await skipTicket(ticketId, operatorId)
      if (result.success) {
        await refreshQueue()
      } else {
        throw new Error(result.error || 'Failed to skip customer')
      }
    } finally {
      setIsLoading(false)
    }
  }, [refreshQueue])

  const setOperatorStatus = useCallback(async (operatorId: string, status: string) => {
    try {
      await updateOperatorStatus(operatorId, status as any)
      await refreshQueue()
    } catch (error) {
      console.error('Failed to update operator status:', error)
    }
  }, [refreshQueue])

  const value: QueueContextType = {
    currentBranchId,
    setCurrentBranchId,
    tickets,
    operators,
    queueData,
    isLoading,
    isRefreshing,
    refreshQueue,
    createNewTicket,
    callNext,
    completeCustomer,
    skipCustomer,
    setOperatorStatus,
  }

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}

export function useQueue() {
  const context = useContext(QueueContext)
  if (context === undefined) {
    throw new Error('useQueue must be used within QueueProvider')
  }
  return context
}
