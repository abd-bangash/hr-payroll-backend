import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { payrollAPI } from '../../services/api'
import { EyeIcon, DocumentArrowDownIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import toast from 'react-hot-toast'

const MyPayrolls = () => {
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchMyPayrolls()
  }, [pagination.current])

  const fetchMyPayrolls = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 10
      }
      const response = await payrollAPI.getMyPayrolls(params)
      setPayrolls(response.data.data.payrolls)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch payrolls')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPayslip = async (payrollId) => {
    try {
      const response = await payrollAPI.generatePayslip(payrollId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payslip.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Failed to download payslip')
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
      <div className="flex items-center space-x-4">
        <Link
          to="/payroll"
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payrolls</h1>
          <p className="text-gray-600">View your salary history and download payslips</p>
        </div>
      </div>

      {/* Payrolls Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Pay Period</th>
                <th className="table-header-cell">Gross Salary</th>
                <th className="table-header-cell">Deductions</th>
                <th className="table-header-cell">Net Salary</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {months[payroll.payPeriod.month - 1]} {payroll.payPeriod.year}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payroll.payPeriod.startDate).toLocaleDateString()} - {new Date(payroll.payPeriod.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      ${payroll.earnings.totalEarnings.toLocaleString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      ${payroll.deductions.totalDeductions.toLocaleString()}
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
                      {(payroll.status === 'Approved' || payroll.status === 'Paid') && (
                        <button
                          onClick={() => handleDownloadPayslip(payroll._id)}
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
    </div>
  )
}

export default MyPayrolls