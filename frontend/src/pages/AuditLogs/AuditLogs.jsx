import React, { useState, useEffect } from 'react'
import { auditAPI } from '../../services/api'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import toast from 'react-hot-toast'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [pagination.current, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 20,
        ...filters
      }
      const response = await auditAPI.getLogs(params)
      setLogs(response.data.data.auditLogs)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeVariant = (action) => {
    if (action.includes('CREATE')) return 'success'
    if (action.includes('UPDATE')) return 'warning'
    if (action.includes('DELETE')) return 'danger'
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'info'
    return 'default'
  }

  const formatDetails = (details) => {
    if (!details || typeof details !== 'object') return 'N/A'
    
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">Track system activities and user actions</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="input-field"
              placeholder="Filter by action"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <input
              type="text"
              value={filters.resource}
              onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
              className="input-field"
              placeholder="Filter by resource"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                user: '',
                action: '',
                resource: '',
                startDate: '',
                endDate: ''
              })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">User</th>
                <th className="table-header-cell">Action</th>
                <th className="table-header-cell">Resource</th>
                <th className="table-header-cell">Details</th>
                <th className="table-header-cell">Timestamp</th>
                <th className="table-header-cell">IP Address</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">
                        {log.user?.username || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.user?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">{log.resource}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {formatDetails(log.details)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {log.ipAddress || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current}
        totalPages={pagination.pages}
        onPageChange={(page) => setPagination({ ...pagination, current: page })}
      />
    </div>
  )
}

export default AuditLogs