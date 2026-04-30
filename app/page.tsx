'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const services = [
    {
      title: 'Admin Hub',
      description: 'Manage institution operations, branches, services, and staff',
      icon: '🏢',
      href: '/admin',
      roles: ['admin'],
    },
    {
      title: 'Ticket Booking (Kiosk)',
      description: 'Customer self-service ticket booking at physical locations',
      icon: '🎫',
      href: '/booking/kiosk',
      roles: ['customer', 'admin'],
    },
    {
      title: 'Queue Display',
      description: 'Real-time queue status and current service information',
      icon: '📊',
      href: '/display/queue',
      roles: ['customer', 'admin'],
    },
    {
      title: 'Operator Service',
      description: 'Staff interface to call and serve customers from queue',
      icon: '👨‍💼',
      href: '/operator/dashboard',
      roles: ['operator'],
    },
    {
      title: 'Mobile Booking',
      description: 'Remote ticket booking without visiting the branch',
      icon: '📱',
      href: '/mobile/book',
      roles: ['customer', 'admin'],
    },
  ]

  const features = [
    { title: 'Real-time Updates', description: 'Live queue status across all displays' },
    { title: 'Multi-branch Support', description: 'Manage multiple locations seamlessly' },
    { title: 'Role-based Access', description: 'Admin, Operator, and Customer portals' },
    { title: 'Ticket Management', description: 'Create, track, and manage customer tickets' },
    { title: 'Queue Analytics', description: 'Detailed statistics and performance metrics' },
    { title: 'Responsive Design', description: 'Works on all devices - desktop, tablet, mobile' },
  ]

  const handleLogin = () => {
    router.push('/login')
  }

  const handleAccessService = (href: string) => {
    if (!isAuthenticated && href !== '/booking/kiosk' && href !== '/mobile/book' && href !== '/display/queue') {
      handleLogin()
    } else {
      router.push(href)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-blue-600">QMS</div>
            <h1 className="text-xl font-semibold text-gray-900">Queue Management System</h1>
          </div>
          <Button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAuthenticated ? `Welcome, ${user?.name}` : 'Sign In'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Intelligent Queue Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Complete solution for managing high-volume walk-in customers with real-time queue tracking,
            automated ticket generation, and seamless operator service coordination.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/booking/kiosk')}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
            >
              Start Booking
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/display/queue')}
              className="text-lg px-8"
            >
              View Queue
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Integrated Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition cursor-pointer border-0"
              onClick={() => handleAccessService(service.href)}
            >
              <CardHeader>
                <div className="text-4xl mb-2">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Access Service
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-400 text-blue-900 font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle>Demo Credentials</CardTitle>
            <CardDescription>
              Use these credentials to explore different user roles and functionalities
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Administrator</p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>Email: <code className="text-blue-600">admin@institution.com</code></p>
                  <p>Password: <code className="text-blue-600">admin123</code></p>
                  <p className="text-xs text-gray-600 mt-2">Access: Full system management</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Operator</p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>Email: <code className="text-blue-600">john@institution.com</code></p>
                  <p>Password: <code className="text-blue-600">operator123</code></p>
                  <p className="text-xs text-gray-600 mt-2">Access: Serve customers from queue</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Customer Books', desc: 'Using kiosk or mobile app' },
              { step: 2, title: 'Gets Ticket', desc: 'Unique ticket number assigned' },
              { step: 3, title: 'Queue Updates', desc: 'Real-time display of position' },
              { step: 4, title: 'Gets Served', desc: 'Operator calls customer' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">About QMS</h4>
              <p className="text-sm">
                A comprehensive queue management solution for institutions handling high volumes of walk-in customers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Ticket Booking</a></li>
                <li><a href="#" className="hover:text-white">Queue Display</a></li>
                <li><a href="#" className="hover:text-white">Operator Portal</a></li>
                <li><a href="#" className="hover:text-white">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 Queue Management System. All rights reserved. | Educational Demo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
