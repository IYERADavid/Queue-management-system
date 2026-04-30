// User Types
export type UserRole = 'admin' | 'operator' | 'customer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  branchId?: string
  operatorId?: string
  createdAt: string
}

export interface AuthToken {
  userId: string
  role: UserRole
  branchId?: string
  expiresAt: number
}

// Branch Types
export interface Branch {
  id: string
  name: string
  location: string
  address: string
  phoneNumber: string
  isActive: boolean
  createdAt: string
}

// Service Types
export type ServiceStatus = 'active' | 'inactive'

export interface Service {
  id: string
  branchId: string
  name: string
  description: string
  averageTimeMinutes: number
  maxWaitTime: number
  status: ServiceStatus
  createdAt: string
}

// Ticket Types
export type TicketStatus = 'waiting' | 'called' | 'serving' | 'completed' | 'skipped' | 'on-hold'

export interface Ticket {
  id: string
  ticketNumber: string
  branchId: string
  serviceId: string
  serviceName: string
  customerId: string
  customerName: string
  customerPhone?: string
  status: TicketStatus
  positionInQueue: number
  calledBy?: string
  calledAt?: string
  servedBy?: string
  completedAt?: string
  createdAt: string
  estimatedWaitTime?: number
}

// Queue Types
export interface QueueStats {
  totalWaiting: number
  totalServing: number
  totalCompleted: number
  totalSkipped: number
  averageWaitTime: number
}

export interface BranchQueue {
  branchId: string
  branchName: string
  tickets: Ticket[]
  stats: QueueStats
}

// Device Types
export type DeviceType = 'kiosk' | 'display' | 'operator'

export interface Device {
  id: string
  branchId: string
  name: string
  type: DeviceType
  location: string
  isActive: boolean
  lastHeartbeat: string
  createdAt: string
}

// Operator Types
export type OperatorStatus = 'idle' | 'serving' | 'break' | 'offline'

export interface Operator {
  id: string
  userId: string
  name: string
  email: string
  branchId: string
  status: OperatorStatus
  currentTicketId?: string
  shiftsCompleted: number
  customersServed: number
  createdAt: string
}

// Settings Types
export interface SystemSettings {
  id: string
  institutionName: string
  institutionLogo?: string
  defaultTicketExpiryMinutes: number
  enableMobileBooking: boolean
  enableQRCode: boolean
  displayUpdateIntervalSeconds: number
  timeZone: string
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Form Types
export interface BookingFormData {
  branchId: string
  serviceId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
}

export interface OperatorAction {
  ticketId: string
  action: 'call' | 'serve' | 'skip' | 'hold' | 'complete'
  operatorId: string
}

export interface DeviceRegistration {
  branchId: string
  name: string
  type: DeviceType
  location: string
}
