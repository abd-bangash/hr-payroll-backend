import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { payrollAPI } from '../../services/api'
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  CheckIcon, 
  DocumentArrowDownIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import Modal from '../../components/UI/Modal'
import toast from 'react-hot-toast'

const PayrollList = () => {
  const { hasPermission, user } = useAuth()
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ month: '', year: '', status: '', employee: '' })
  const [approveModal, setApproveModal] = useState({ open: false, payroll: null })
  const [approvalNotes, setApprovalNotes] = useState('')

  useEffect(() => {
    fetchPayrolls()
  }, [pagination.current, filters])

  const fetchPayrolls = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      }
      const response = await payrollAPI.getAll(params)
      setPayrolls(response.data.data.payrolls)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch payrolls')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      await payrollAPI.approve(approveModal.payroll._id, { notes: approvalNotes })
      toast.success('Payroll approved successfully')
      setApproveModal({ open: false, payroll: null })
      setApprovalNotes('')
      fetchPayrolls()
    } catch (error) {
      toast.error('Failed to approve payroll')
    }
  }

  const handleDownloadPayslip = async (payrollId, employeeName) => {
    try {
      const response = await payrollAPI.generatePayslip(payrollId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payslip-${employeeName}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Failed to download payslip')
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const response = await payrollAPI.generateCSV(filters)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payroll-${filters.month}-${filters.year}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Failed to download CSV')
    }
  }

  const getStatusBadgeVariant = (status) => {
    const variants = {
      Draft: 'default',
      Pending: 'warning',
      Approved: 'success',
      Paid: 'info',
      Rejected: 'danger'
    }
    return variants[status] || 'default'
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">Manage employee payrolls and salary processing</p>
        </div>
        <div className="flex space-x-3">
          {user?.role === 'Employee' && (
            <Link to="/payroll/my-payrolls" className="btn-secondary">
              My Payrolls
            </Link>
          )}
          {hasPermission('create_payroll') && (
            <Link to="/payroll/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Payroll
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="input-field"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="input-field"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ month: '', year: '', status: '', employee: '' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
          <div className="flex items-end">
            {filters.month && filters.year && (
              <button
                onClick={handleDownloadCSV}
                className="btn-secondary"
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payrolls Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Gross Salary</th>
                <th className="table-header-cell">Net Salary</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">
                        {payroll.employee.personalInfo.firstName} {payroll.employee.personalInfo.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {payroll.employee.employeeId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payroll.employee.employmentDetails.department}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {months.find(m => m.value === payroll.payPeriod.month)?.label} {payroll.payPeriod.year}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      ${payroll.earnings.totalEarnings.toLocaleString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      ${payroll.netSalary.toLocaleString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant={getStatusBadgeVariant(payroll.status)}>
                      {payroll.status}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <Link
                        to={`/payroll/${payroll._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {hasPermission('update_payroll') && payroll.status === 'Draft' && (
                        <Link
                          to={`/payroll/${payroll._id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      )}
                      {hasPermission('approve_payroll') && payroll.status === 'Pending' && (
                        <button
                          onClick={() => setApproveModal({ open: true, payroll })}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      {(payroll.status === 'Approved' || payroll.status === 'Paid') && (
                        <button
                          onClick={() => handleDownloadPayslip(
                            payroll._id, 
                            `${payroll.employee.personalInfo.firstName}-${payroll.employee.personalInfo.lastName}`
                          )}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payrolls.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payrolls found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current}
        totalPages={pagination.pages}
        onPageChange={(page) => setPagination({ ...pagination, current: page })}
      />

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.open}
        onClose={() => {
          setApproveModal({ open: false, payroll: null })
          setApprovalNotes('')
        }}
        title="Approve Payroll"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Approve payroll for {approveModal.payroll?.employee?.personalInfo?.firstName} {approveModal.payroll?.employee?.personalInfo?.lastName}?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Notes (Optional)
            </label>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Enter any notes for this approval"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setApproveModal({ open: false, payroll: null })
                setApprovalNotes('')
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleApprove} className="btn-primary">
              Approve Payroll
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PayrollList