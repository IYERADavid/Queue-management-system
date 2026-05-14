import {
  User,
  Branch,
  Service,
  Ticket,
  Device,
  Operator,
  SystemSettings,
  TicketStatus,
  OperatorStatus,
  QueueStats,
  BranchQueue,
  ApiResponse,
} from '../types'
import {
  delay,
  mockUsers,
  mockBranches,
  mockServices,
  mockDevices,
  mockOperators,
  mockSystemSettings,
  getInMemoryData,
  updateInMemoryTickets,
  updateInMemoryOperators,
} from './mock-data'
import { TicketFactory } from '@/lib/patterns/ticket-factory'
import { applyTicketStatusStrategy } from '@/lib/patterns/ticket-status-strategies'

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

/** Demo passwords aligned with `context/auth-context.tsx` (simulated backend check). */
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@institution.com': 'admin123',
  'john@institution.com': 'operator123',
  'sarah@institution.com': 'operator123',
  'mike@institution.com': 'operator123',
  'customer@email.com': 'customer123',
}

export async function loginUser(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
  await delay()
  const user = mockUsers.find((u) => u.email === email)
  if (!user || DEMO_PASSWORDS[email] !== password) {
    return { success: false, error: 'Invalid credentials' }
  }
  const token = btoa(JSON.stringify({ userId: user.id, role: user.role, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }))
  return { success: true, data: { user, token } }
}

export async function registerUser(userData: Partial<User>): Promise<ApiResponse<User>> {
  await delay()
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name || 'New User',
    email: userData.email || '',
    role: userData.role || 'customer',
    createdAt: new Date().toISOString(),
  }
  return { success: true, data: newUser }
}

// ============================================================================
// BRANCH ENDPOINTS
// ============================================================================

export async function getBranches(): Promise<ApiResponse<Branch[]>> {
  await delay()
  return { success: true, data: mockBranches }
}

export async function getBranchById(id: string): Promise<ApiResponse<Branch>> {
  await delay()
  const branch = mockBranches.find((b) => b.id === id)
  return branch ? { success: true, data: branch } : { success: false, error: 'Branch not found' }
}

export async function createBranch(branchData: Partial<Branch>): Promise<ApiResponse<Branch>> {
  await delay()
  const newBranch: Branch = {
    id: `branch-${Date.now()}`,
    name: branchData.name || 'New Branch',
    location: branchData.location || '',
    address: branchData.address || '',
    phoneNumber: branchData.phoneNumber || '',
    isActive: true,
    createdAt: new Date().toISOString(),
  }
  mockBranches.push(newBranch)
  return { success: true, data: newBranch }
}

export async function updateBranch(id: string, branchData: Partial<Branch>): Promise<ApiResponse<Branch>> {
  await delay()
  const branch = mockBranches.find((b) => b.id === id)
  if (!branch) return { success: false, error: 'Branch not found' }
  Object.assign(branch, branchData)
  return { success: true, data: branch }
}

// ============================================================================
// SERVICE ENDPOINTS
// ============================================================================

export async function getServices(branchId?: string): Promise<ApiResponse<Service[]>> {
  await delay()
  const services = branchId ? mockServices.filter((s) => s.branchId === branchId) : mockServices
  return { success: true, data: services }
}

export async function getServiceById(id: string): Promise<ApiResponse<Service>> {
  await delay()
  const service = mockServices.find((s) => s.id === id)
  return service ? { success: true, data: service } : { success: false, error: 'Service not found' }
}

export async function createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
  await delay()
  const newService: Service = {
    id: `service-${Date.now()}`,
    branchId: serviceData.branchId || '',
    name: serviceData.name || 'New Service',
    description: serviceData.description || '',
    averageTimeMinutes: serviceData.averageTimeMinutes || 15,
    maxWaitTime: serviceData.maxWaitTime || 120,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  mockServices.push(newService)
  return { success: true, data: newService }
}

// ============================================================================
// TICKET ENDPOINTS
// ============================================================================

export async function createTicket(
  branchId: string,
  serviceId: string,
  customerName: string,
  customerPhone?: string
): Promise<ApiResponse<Ticket>> {
  await delay()
  const service = mockServices.find((s) => s.id === serviceId)
  if (!service) return { success: false, error: 'Service not found' }

  const tickets = getInMemoryData().tickets
  const waitingTickets = tickets.filter((t) => t.branchId === branchId && t.serviceId === serviceId && t.status === 'waiting')

  const newTicket = TicketFactory.createWaitingTicket({
    branchId,
    service,
    customerName,
    customerPhone,
    waitingSameService: waitingTickets,
    allTickets: tickets,
  })

  tickets.push(newTicket)
  updateInMemoryTickets(tickets)
  return { success: true, data: newTicket }
}

export async function getTickets(branchId?: string, serviceId?: string): Promise<ApiResponse<Ticket[]>> {
  await delay()
  let tickets = getInMemoryData().tickets
  if (branchId) tickets = tickets.filter((t) => t.branchId === branchId)
  if (serviceId) tickets = tickets.filter((t) => t.serviceId === serviceId)
  return { success: true, data: tickets.sort((a, b) => a.positionInQueue - b.positionInQueue) }
}

export async function getTicketById(id: string): Promise<ApiResponse<Ticket>> {
  await delay()
  const ticket = getInMemoryData().tickets.find((t) => t.id === id)
  return ticket ? { success: true, data: ticket } : { success: false, error: 'Ticket not found' }
}

export async function updateTicketStatus(id: string, status: TicketStatus, operatorId?: string): Promise<ApiResponse<Ticket>> {
  await delay()
  const tickets = getInMemoryData().tickets
  const ticket = tickets.find((t) => t.id === id)

  if (!ticket) return { success: false, error: 'Ticket not found' }

  ticket.status = status
  applyTicketStatusStrategy(ticket, status, { allTickets: tickets, operatorId })

  updateInMemoryTickets(tickets)
  return { success: true, data: ticket }
}

// ============================================================================
// QUEUE ENDPOINTS
// ============================================================================

function calculateQueueStats(tickets: Ticket[]): QueueStats {
  return {
    totalWaiting: tickets.filter((t) => t.status === 'waiting').length,
    totalServing: tickets.filter((t) => t.status === 'called' || t.status === 'serving').length,
    totalCompleted: tickets.filter((t) => t.status === 'completed').length,
    totalSkipped: tickets.filter((t) => t.status === 'skipped').length,
    averageWaitTime: 12,
  }
}

export async function getQueueForBranch(branchId: string): Promise<ApiResponse<BranchQueue>> {
  await delay()
  const branch = mockBranches.find((b) => b.id === branchId)
  if (!branch) return { success: false, error: 'Branch not found' }

  const tickets = getInMemoryData().tickets.filter((t) => t.branchId === branchId)
  const stats = calculateQueueStats(tickets)

  return {
    success: true,
    data: {
      branchId,
      branchName: branch.name,
      tickets: tickets.sort((a, b) => a.positionInQueue - b.positionInQueue),
      stats,
    },
  }
}

export async function getQueueStatsForBranch(branchId: string): Promise<ApiResponse<QueueStats>> {
  await delay()
  const tickets = getInMemoryData().tickets.filter((t) => t.branchId === branchId)
  const stats = calculateQueueStats(tickets)
  return { success: true, data: stats }
}

// ============================================================================
// DEVICE ENDPOINTS
// ============================================================================

export async function getDevices(branchId?: string): Promise<ApiResponse<Device[]>> {
  await delay()
  const devices = branchId ? mockDevices.filter((d) => d.branchId === branchId) : mockDevices
  return { success: true, data: devices }
}

export async function registerDevice(deviceData: Partial<Device>): Promise<ApiResponse<Device>> {
  await delay()
  const newDevice: Device = {
    id: `device-${Date.now()}`,
    branchId: deviceData.branchId || '',
    name: deviceData.name || 'New Device',
    type: deviceData.type || 'kiosk',
    location: deviceData.location || '',
    isActive: true,
    lastHeartbeat: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  mockDevices.push(newDevice)
  return { success: true, data: newDevice }
}

// ============================================================================
// OPERATOR ENDPOINTS
// ============================================================================

export async function getOperators(branchId?: string): Promise<ApiResponse<Operator[]>> {
  await delay()
  const operators = branchId ? getInMemoryData().operators.filter((o) => o.branchId === branchId) : getInMemoryData().operators
  return { success: true, data: operators }
}

export async function getOperatorById(id: string): Promise<ApiResponse<Operator>> {
  await delay()
  const operator = getInMemoryData().operators.find((o) => o.id === id)
  return operator ? { success: true, data: operator } : { success: false, error: 'Operator not found' }
}

export async function updateOperatorStatus(id: string, status: OperatorStatus, currentTicketId?: string): Promise<ApiResponse<Operator>> {
  await delay()
  const operators = getInMemoryData().operators
  const operator = operators.find((o) => o.id === id)

  if (!operator) return { success: false, error: 'Operator not found' }

  operator.status = status
  operator.currentTicketId = currentTicketId

  if (status === 'serving' && currentTicketId) {
    // Ticket is already marked as served via updateTicketStatus
  }

  updateInMemoryOperators(operators)
  return { success: true, data: operator }
}

export async function callNextCustomer(operatorId: string, branchId: string, serviceId?: string): Promise<ApiResponse<Ticket>> {
  await delay()
  const tickets = getInMemoryData().tickets
  let nextTicket: Ticket | undefined

  if (serviceId) {
    // Call next from specific service
    nextTicket = tickets.find(
      (t) => t.branchId === branchId && t.serviceId === serviceId && t.status === 'waiting' && !t.calledBy
    )
  } else {
    // Call next from any service
    nextTicket = tickets.find((t) => t.branchId === branchId && t.status === 'waiting' && !t.calledBy)
  }

  if (!nextTicket) {
    return { success: false, error: 'No waiting customers' }
  }

  nextTicket.status = 'called'
  nextTicket.calledBy = operatorId
  nextTicket.calledAt = new Date().toISOString()

  updateInMemoryTickets(tickets)

  // Update operator status
  const response = await updateOperatorStatus(operatorId, 'serving', nextTicket.id)
  if (!response.success) return response

  return { success: true, data: nextTicket }
}

export async function completeTicket(ticketId: string, operatorId: string): Promise<ApiResponse<Ticket>> {
  const response = await updateTicketStatus(ticketId, 'completed', operatorId)
  if (response.success) {
    await updateOperatorStatus(operatorId, 'idle')
  }
  return response
}

export async function skipTicket(ticketId: string, operatorId: string): Promise<ApiResponse<Ticket>> {
  const response = await updateTicketStatus(ticketId, 'skipped', operatorId)
  if (response.success) {
    await updateOperatorStatus(operatorId, 'idle')
  }
  return response
}

// ============================================================================
// SETTINGS ENDPOINTS
// ============================================================================

export async function getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
  await delay()
  return { success: true, data: mockSystemSettings }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
  await delay()
  Object.assign(mockSystemSettings, settings, { updatedAt: new Date().toISOString() })
  return { success: true, data: { ...mockSystemSettings } }
}
