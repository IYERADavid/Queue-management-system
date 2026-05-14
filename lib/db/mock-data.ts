import {
  User,
  Branch,
  Service,
  Ticket,
  Device,
  Operator,
  SystemSettings,
} from '../types'
import { InMemoryQueueStore } from '@/lib/patterns/in-memory-queue-store'
import { pushQueueSnapshotAfterLocalMutation } from './tab-queue-sync'

// Simulate network delay
const NETWORK_DELAY = Math.random() * 300 + 100 // 100-400ms

export const delay = (ms: number = NETWORK_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@institution.com',
    role: 'admin',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'user-op-1',
    name: 'John Operator',
    email: 'john@institution.com',
    role: 'operator',
    branchId: 'branch-1',
    operatorId: 'op-1',
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'user-op-2',
    name: 'Sarah Operator',
    email: 'sarah@institution.com',
    role: 'operator',
    branchId: 'branch-1',
    operatorId: 'op-2',
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'user-op-3',
    name: 'Mike Operator',
    email: 'mike@institution.com',
    role: 'operator',
    branchId: 'branch-2',
    operatorId: 'op-3',
    createdAt: new Date('2024-01-05').toISOString(),
  },
]

// Mock Branches
export const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Main Branch',
    location: 'Downtown',
    address: '123 Main Street, City Center',
    phoneNumber: '+1-555-0001',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'branch-2',
    name: 'East Branch',
    location: 'East Side',
    address: '456 East Avenue, East District',
    phoneNumber: '+1-555-0002',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'branch-3',
    name: 'West Branch',
    location: 'West Side',
    address: '789 West Boulevard, West District',
    phoneNumber: '+1-555-0003',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
]

// Mock Services
export const mockServices: Service[] = [
  {
    id: 'service-1',
    branchId: 'branch-1',
    name: 'General Consultation',
    description: 'Standard consultation service',
    averageTimeMinutes: 15,
    maxWaitTime: 120,
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service-2',
    branchId: 'branch-1',
    name: 'Payment Processing',
    description: 'Handle payments and transactions',
    averageTimeMinutes: 10,
    maxWaitTime: 60,
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service-3',
    branchId: 'branch-1',
    name: 'Document Processing',
    description: 'Process documents and applications',
    averageTimeMinutes: 20,
    maxWaitTime: 180,
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service-4',
    branchId: 'branch-1',
    name: 'ID Renewal',
    description: 'Renew identification documents',
    averageTimeMinutes: 25,
    maxWaitTime: 150,
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service-5',
    branchId: 'branch-2',
    name: 'General Consultation',
    description: 'Standard consultation service',
    averageTimeMinutes: 15,
    maxWaitTime: 120,
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'service-6',
    branchId: 'branch-2',
    name: 'Payment Processing',
    description: 'Handle payments and transactions',
    averageTimeMinutes: 10,
    maxWaitTime: 60,
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
]

// No seed tickets — queue is filled from kiosk / mobile booking during the demo.
export const mockTickets: Ticket[] = []

// Mock Devices
export const mockDevices: Device[] = [
  {
    id: 'device-kiosk-1',
    branchId: 'branch-1',
    name: 'Kiosk 01',
    type: 'kiosk',
    location: 'Entrance Hall',
    isActive: true,
    lastHeartbeat: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'device-display-1',
    branchId: 'branch-1',
    name: 'Display Screen 01',
    type: 'display',
    location: 'Main Hall',
    isActive: true,
    lastHeartbeat: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'device-display-2',
    branchId: 'branch-1',
    name: 'Display Screen 02',
    type: 'display',
    location: 'Waiting Area',
    isActive: true,
    lastHeartbeat: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'device-operator-1',
    branchId: 'branch-1',
    name: 'Operator Terminal 01',
    type: 'operator',
    location: 'Counter 1',
    isActive: true,
    lastHeartbeat: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
  },
]

// Mock Operators
export const mockOperators: Operator[] = [
  {
    id: 'op-1',
    userId: 'user-op-1',
    name: 'John Operator',
    email: 'john@institution.com',
    branchId: 'branch-1',
    status: 'idle',
    shiftsCompleted: 45,
    customersServed: 342,
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'op-2',
    userId: 'user-op-2',
    name: 'Sarah Operator',
    email: 'sarah@institution.com',
    branchId: 'branch-1',
    status: 'idle',
    shiftsCompleted: 32,
    customersServed: 256,
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'op-3',
    userId: 'user-op-3',
    name: 'Mike Operator',
    email: 'mike@institution.com',
    branchId: 'branch-2',
    status: 'idle',
    shiftsCompleted: 28,
    customersServed: 198,
    createdAt: new Date('2024-01-05').toISOString(),
  },
]

// Mock System Settings
export const mockSystemSettings: SystemSettings = {
  id: 'settings-1',
  institutionName: 'Service Institution Management System',
  institutionLogo: '/logo.png',
  defaultTicketExpiryMinutes: 120,
  enableMobileBooking: true,
  enableQRCode: true,
  displayUpdateIntervalSeconds: 2,
  timeZone: 'UTC',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
}

// In-memory storage (Singleton) — see `lib/patterns/in-memory-queue-store.ts`
InMemoryQueueStore.initializeFromSeeds(mockTickets, mockOperators)

export const getInMemoryData = () => InMemoryQueueStore.getInstance().getData()

export const updateInMemoryTickets = (tickets: Ticket[]) => {
  InMemoryQueueStore.getInstance().setTickets(tickets)
  pushQueueSnapshotAfterLocalMutation()
}

export const updateInMemoryOperators = (operators: Operator[]) => {
  InMemoryQueueStore.getInstance().setOperators(operators)
  pushQueueSnapshotAfterLocalMutation()
}

export const resetInMemoryData = () => {
  InMemoryQueueStore.getInstance().reset(mockTickets, mockOperators)
  pushQueueSnapshotAfterLocalMutation()
}
