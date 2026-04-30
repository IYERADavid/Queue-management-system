'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Operator, Branch } from '@/lib/types'
import { getOperators, getBranches } from '@/lib/db/api'
import { Edit2, Trash2, Activity } from 'lucide-react'

const statusColors = {
  idle: 'bg-blue-100 text-blue-700',
  serving: 'bg-green-100 text-green-700',
  break: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-700',
}

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [opRes, brRes] = await Promise.all([getOperators(), getBranches()])
      if (opRes.success && opRes.data) {
        setOperators(opRes.data)
      }
      if (brRes.success && brRes.data) {
        setBranches(brRes.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredOperators =
    selectedBranchId === 'all'
      ? operators
      : operators.filter((op) => op.branchId === selectedBranchId)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Operators</h2>
          <p className="text-gray-600">Manage service staff and their assignments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Assign Operator
        </Button>
      </div>

      {/* Branch Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedBranchId('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedBranchId === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Branches
        </button>
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranchId(branch.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedBranchId === branch.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {branch.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOperators.map((operator) => (
            <Card key={operator.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{operator.name}</CardTitle>
                    <CardDescription>{operator.email}</CardDescription>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      statusColors[operator.status as keyof typeof statusColors]
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    {operator.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <p className="font-medium">
                      {branches.find((b) => b.id === operator.branchId)?.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Shifts Completed:</span>
                      <p className="font-medium text-lg">{operator.shiftsCompleted}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Customers Served:</span>
                      <p className="font-medium text-lg">{operator.customersServed}</p>
                    </div>
                  </div>
                  {operator.currentTicketId && (
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Currently serving:</p>
                      <p className="font-medium text-blue-600">{operator.currentTicketId}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
