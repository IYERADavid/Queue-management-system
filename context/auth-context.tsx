'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('qms-user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('qms-token')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const u = readStoredUser()
      const t = readStoredToken()
      if (u) setUser(u)
      if (t) setToken(t)
    } catch (error) {
      console.error('Failed to restore auth state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      // Simulate login with mock users
      const mockUsers: Array<{ email: string; password: string; user: User }> = [
        {
          email: 'admin@institution.com',
          password: 'admin123',
          user: {
            id: 'user-admin-1',
            name: 'Admin User',
            email: 'admin@institution.com',
            role: 'admin',
            createdAt: new Date('2024-01-01').toISOString(),
          },
        },
        {
          email: 'john@institution.com',
          password: 'operator123',
          user: {
            id: 'user-op-1',
            name: 'John Operator',
            email: 'john@institution.com',
            role: 'operator',
            branchId: 'branch-1',
            operatorId: 'op-1',
            createdAt: new Date('2024-01-05').toISOString(),
          },
        },
        {
          email: 'sarah@institution.com',
          password: 'operator123',
          user: {
            id: 'user-op-2',
            name: 'Sarah Operator',
            email: 'sarah@institution.com',
            role: 'operator',
            branchId: 'branch-1',
            operatorId: 'op-2',
            createdAt: new Date('2024-01-05').toISOString(),
          },
        },
        {
          email: 'mike@institution.com',
          password: 'operator123',
          user: {
            id: 'user-op-3',
            name: 'Mike Operator',
            email: 'mike@institution.com',
            role: 'operator',
            branchId: 'branch-2',
            operatorId: 'op-3',
            createdAt: new Date('2024-01-05').toISOString(),
          },
        },
        {
          email: 'customer@email.com',
          password: 'customer123',
          user: {
            id: 'user-cust-1',
            name: 'Test Customer',
            email: 'customer@email.com',
            role: 'customer',
            createdAt: new Date('2024-01-10').toISOString(),
          },
        },
      ]

      const credentials = mockUsers.find((u) => u.email === email && u.password === password)

      if (!credentials) {
        throw new Error('Invalid credentials')
      }

      // Simulate token generation
      const newToken = btoa(
        JSON.stringify({
          userId: credentials.user.id,
          role: credentials.user.role,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        })
      )

      setUser(credentials.user)
      setToken(newToken)

      // Store in localStorage
      localStorage.setItem('qms-user', JSON.stringify(credentials.user))
      localStorage.setItem('qms-token', newToken)

      return credentials.user
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('qms-user')
    localStorage.removeItem('qms-token')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
