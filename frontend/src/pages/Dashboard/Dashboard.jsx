import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI, employeesAPI, payrollAPI, auditAPI } from '../../services/api'
import {
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user, hasPermission } = useAuth()
  const [stats, setStats] = useState({
    users: 0,
    employees: 0,
    payrolls: 0,
    pendingPayrolls: 0
  })
  const [auditStats, setAuditStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const promises = []

      if (hasPermission('read_user')) {
        promises.push(usersAPI.getAll({ limit: 1 }))
      }
      if (hasPermission('read_employee')) {
        promises.push(employeesAPI.getAll({ limit: 1 }))
      }
      if (hasPermission('read_payroll')) {
        promises.push(payrollAPI.getAll({ limit: 1 }))
        promises.push(payrollAPI.getAll({ status: 'Pending', limit: 1 }))
      }
      if (hasPermission('read_audit')) {
        promises.push(auditAPI.getStats())
      }

      const results = await Promise.allSettled(promises)
      
      let index = 0
      const newStats = { ...stats }

      if (hasPermission('read_user') && results[index]?.status === 'fulfilled') {
        newStats.users = results[index].value.data.data.pagination.total
        index++
      }
      if (hasPermission('read_employee') && results[index]?.status === 'fulfilled') {
        newStats.employees = results[index].value.data.data.pagination.total
        index++
      }
      if (hasPermission('read_payroll')) {
        if (results[index]?.status === 'fulfilled') {
          newStats.payrolls = results[index].value.data.data.pagination.total
          index++
        }
        if (results[index]?.status === 'fulfilled') {
          newStats.pendingPayrolls = results[index].value.data.data.pagination.total
          index++
        }
      }
      if (hasPermission('read_audit') && results[index]?.status === 'fulfilled') {
        setAuditStats(results[index].value.data.data)
      }

      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats.users,
      icon: UsersIcon,
      color: 'bg-blue-500',
      show: hasPermission('read_user')
    },
    {
      name: 'Total Employees',
      value: stats.employees,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      show: hasPermission('read_employee')
    },
    {
      name: 'Total Payrolls',
      value: stats.payrolls,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      show: hasPermission('read_payroll')
    },
    {
      name: 'Pending Payrolls',
      value: stats.pendingPayrolls,
      icon: ChartBarIcon,
      color: 'bg-yellow-500',
      show: hasPermission('read_payroll')
    },
  ].filter(card => card.show)

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your HR system today.
        </p>
      </div>

      {/* Stats Cards */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      {auditStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={auditStats.actionBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Actions</span>
                <span className="text-lg font-semibold text-gray-900">{auditStats.totalActions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-lg font-semibold text-gray-900">{auditStats.uniqueUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time Period</span>
                <span className="text-sm text-gray-500 capitalize">{auditStats.timeframe}</span>
              </div>
            </div>
            
            {auditStats.actionBreakdown.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Top Actions</h4>
                <div className="space-y-2">
                  {auditStats.actionBreakdown.slice(0, 5).map((action, index) => (
                    <div key={action._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{action._id}</span>
                      <span className="text-sm font-medium text-gray-900">{action.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasPermission('create_employee') && (
            <a
              href="/employees/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <UserGroupIcon className="h-8 w-8 text-primary-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add Employee</h4>
              <p className="text-sm text-gray-600">Create a new employee profile</p>
            </a>
          )}
          
          {hasPermission('create_payroll') && (
            <a
              href="/payroll/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mb-2" />
              <h4 className="font-medium text-gray-900">Create Payroll</h4>
              <p className="text-sm text-gray-600">Generate new payroll entry</p>
            </a>
          )}
          
          {user?.role === 'SuperAdmin' && (
            <a
              href="/users/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <UsersIcon className="h-8 w-8 text-primary-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add User</h4>
              <p className="text-sm text-gray-600">Create a new system user</p>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard