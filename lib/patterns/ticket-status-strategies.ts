import type { Ticket, TicketStatus } from '@/lib/types'

export type TicketStatusStrategyContext = {
  allTickets: Ticket[]
  operatorId?: string
}

type StrategyFn = (ticket: Ticket, ctx: TicketStatusStrategyContext) => void

/**
 * Strategy: each terminal / workflow status applies its own side effects without growing one switch statement.
 */
function recalculateWaitingPositions(terminalTicket: Ticket, allTickets: Ticket[]): void {
  const sameServiceWaiting = allTickets.filter(
    (t) =>
      t.branchId === terminalTicket.branchId &&
      t.serviceId === terminalTicket.serviceId &&
      t.status === 'waiting',
  )
  sameServiceWaiting.forEach((t, index) => {
    t.positionInQueue = index + 1
  })
}

const strategies: Partial<Record<TicketStatus, StrategyFn>> = {
  called: (ticket, ctx) => {
    ticket.calledAt = new Date().toISOString()
    ticket.calledBy = ctx.operatorId
  },
  serving: (ticket, ctx) => {
    ticket.calledBy = ctx.operatorId
    ticket.calledAt = new Date().toISOString()
  },
  completed: (ticket, ctx) => {
    ticket.completedAt = new Date().toISOString()
    ticket.servedBy = ctx.operatorId
    recalculateWaitingPositions(ticket, ctx.allTickets)
  },
  skipped: (ticket, ctx) => {
    ticket.completedAt = new Date().toISOString()
    ticket.servedBy = ctx.operatorId
    recalculateWaitingPositions(ticket, ctx.allTickets)
  },
}

/**
 * Runs the strategy for the new status after `ticket.status` has been assigned.
 */
export function applyTicketStatusStrategy(
  ticket: Ticket,
  status: TicketStatus,
  ctx: TicketStatusStrategyContext,
): void {
  const run = strategies[status]
  if (run) run(ticket, ctx)
}
