'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

const demoCredentials = [
  { email: 'admin@institution.com', password: 'admin123', role: 'Admin' },
  { email: 'john@institution.com', password: 'operator123', role: 'Operator (Main Branch)' },
  { email: 'mike@institution.com', password: 'operator123', role: 'Operator (East Branch)' },
  { email: 'customer@email.com', password: 'customer123', role: 'Customer' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('admin@institution.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Queue System</h1>
          <p className="text-gray-600">Institution Queue Management Platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Welcome back to your queue management system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Demo Credentials:</p>
              <div className="space-y-2">
                {demoCredentials.map((cred, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setEmail(cred.email)
                      setPassword(cred.password)
                    }}
                    className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition"
                  >
                    <div className="font-medium text-gray-900">{cred.role}</div>
                    <div className="text-gray-600">{cred.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          This is a demonstration system for educational purposes
        </p>
      </div>
    </div>
  )
}
