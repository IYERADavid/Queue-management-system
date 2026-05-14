import type { Service, Ticket } from '@/lib/types'

export type CreateWaitingTicketInput = {
  branchId: string
  service: Service
  customerName: string
  customerPhone?: string
  customerEmail?: string
  /** Waiting tickets for this branch + service (for position and ETA). */
  waitingSameService: Ticket[]
  /** All tickets in memory (for numbering). */
  allTickets: Ticket[]
}

/**
 * Factory: centralizes construction of new queue tickets so creation rules stay in one place.
 */
export class TicketFactory {
  static createWaitingTicket(input: CreateWaitingTicketInput): Ticket {
    const { branchId, service, customerName, customerPhone, customerEmail, waitingSameService, allTickets } = input
    const ticketNumber = TicketFactory.generateTicketNumber(branchId, allTickets)
    const positionInQueue = waitingSameService.length + 1
    const estimatedWaitTime = waitingSameService.length * service.averageTimeMinutes

    return {
      id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      ticketNumber,
      branchId,
      serviceId: service.id,
      serviceName: service.name,
      customerId: `cust-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail,
      status: 'waiting',
      positionInQueue,
      createdAt: new Date().toISOString(),
      estimatedWaitTime,
    }
  }

  private static generateTicketNumber(branchId: string, allTickets: Ticket[]): string {
    const ticketsInBranch = allTickets.filter((t) => t.branchId === branchId)
    const nextNumber = ticketsInBranch.length + 1
    const letter = branchId === 'branch-1' ? 'A' : branchId === 'branch-2' ? 'B' : 'C'
    return `${letter}${String(nextNumber).padStart(3, '0')}`
  }
}
