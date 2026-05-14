export type MobileBookingRecord = {
  ticketId: string
  email: string
  branchId: string
  createdAt: string
}

const BOOKINGS_KEY = 'qms-mobile-bookings-v1'
const LAST_EMAIL_KEY = 'qms-mobile-last-email'

function readBookings(): MobileBookingRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MobileBookingRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBookings(list: MobileBookingRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list))
}

export function recordMobileBooking(record: MobileBookingRecord) {
  if (typeof window === 'undefined') return
  const email = record.email.trim().toLowerCase()
  const next = readBookings().filter((r) => !(r.ticketId === record.ticketId && r.email === email))
  next.unshift({ ...record, email })
  writeBookings(next)
  localStorage.setItem(LAST_EMAIL_KEY, email)
}

export function getMobileBookingsForEmail(email: string): MobileBookingRecord[] {
  const e = email.trim().toLowerCase()
  return readBookings().filter((r) => r.email === e)
}

export function getLastMobileEmail(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(LAST_EMAIL_KEY) || ''
}
