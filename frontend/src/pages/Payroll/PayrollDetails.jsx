import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { payrollAPI } from '../../services/api'
import { PencilIcon, ArrowLeftIcon, DocumentArrowDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Modal from '../../components/UI/Modal'
import toast from 'react-hot-toast'

const PayrollDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approveModal, setApproveModal] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')

  useEffect(() => {
    fetchPayroll()
  }, [id])

  const fetchPayroll = async () => {
    try {
      const response = await payrollAPI.getById(id)
      setPayroll(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch payroll details')
      navigate('/payroll')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      await payrollAPI.approve(payroll._id, { notes: approvalNotes })
      toast.success('Payroll approved successfully')
      setApproveModal(false)
      setApprovalNotes('')
      fetchPayroll()
    } catch (error) {
      toast.error('Failed to approve payroll')
    }
  }

  const handleDownloadPayslip = async () => {
    try {
      const response = await payrollAPI.generatePayslip(payroll._id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payslip-${payroll.employee.personalInfo.firstName}-${payroll.employee.personalInfo.lastName}.pdf`)
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

  if (!payroll) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Payroll not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/payroll')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Details</h1>
            <p className="text-gray-600">View payroll information and breakdown</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {hasPermission('update_payroll') && payroll.status === 'Draft' && (
            <Link
              to={`/payroll/${payroll._id}/edit`}
              className="btn-secondary"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Payroll
            </Link>
          )}
          {hasPermission('approve_payroll') && payroll.status === 'Pending' && (
            <button
              onClick={() => setApproveModal(true)}
              className="btn-primary"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Approve
            </button>
          )}
          {(payroll.status === 'Approved' || payroll.status === 'Paid') && (
            <button
              onClick={handleDownloadPayslip}
              className="btn-secondary"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download Payslip
            </button>
          )}
        </div>
      </div>

      {/* Payroll Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Employee Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {payroll.employee.personalInfo.firstName} {payroll.employee.personalInfo.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                <p className="mt-1 text-sm text-gray-900">{payroll.employee.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Department</label>
                <p className="mt-1 text-sm text-gray-900">{payroll.employee.employmentDetails.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Position</label>
                <p className="mt-1 text-sm text-gray-900">{payroll.employee.employmentDetails.position}</p>
              </div>
            </div>
          </div>

          {/* Pay Period */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pay Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Month</label>
                <p className="mt-1 text-sm text-gray-900">
                  {months[payroll.payPeriod.month - 1]}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Year</label>
                <p className="mt-1 text-sm text-gray-900">{payroll.payPeriod.year}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Period</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(payroll.payPeriod.startDate).toLocaleDateString()} - {new Date(payroll.payPeriod.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Basic Salary</span>
                <span className="text-sm font-medium text-gray-900">
                  ${payroll.earnings.basicSalary.toLocaleString()}
                </span>
              </div>
              {payroll.earnings.allowances && payroll.earnings.allowances.length > 0 && (
                <>
                  {payroll.earnings.allowances.map((allowance, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">{allowance.type}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${allowance.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </>
              )}
              {payroll.earnings.overtimePay > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Overtime Pay</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${payroll.earnings.overtimePay.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 font-medium">
                <span className="text-gray-900">Total Earnings</span>
                <span className="text-gray-900">
                  ${payroll.earnings.totalEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
            <div className="space-y-4">
              {payroll.deductions.tax > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${payroll.deductions.tax.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.deductions.insurance > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Insurance</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${payroll.deductions.insurance.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.deductions.providentFund > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Provident Fund</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${payroll.deductions.providentFund.toLocaleString()}
                  </span>
                </div>
              )}
              {payroll.deductions.otherDeductions && payroll.deductions.otherDeductions.length > 0 && (
                <>
                  {payroll.deductions.otherDeductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">{deduction.type}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${deduction.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex justify-between items-center py-2 font-medium">
                <span className="text-gray-900">Total Deductions</span>
                <span className="text-gray-900">
                  ${payroll.deductions.totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gross Salary</span>
                <span className="text-sm font-medium text-gray-900">
                  ${payroll.earnings.totalEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Deductions</span>
                <span className="text-sm font-medium text-gray-900">
                  ${payroll.deductions.totalDeductions.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Net Salary</span>
                  <span className="text-lg font-bold text-primary-600">
                    ${payroll.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(payroll.status)}>
                    {payroll.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(payroll.createdAt).toLocaleDateString()}
                </p>
              </div>
              {payroll.approvedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approved By</label>
                  <p className="mt-1 text-sm text-gray-900">{payroll.approvedBy.username}</p>
                </div>
              )}
              {payroll.approvalDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Approval Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(payroll.approvalDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {payroll.notes && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <p className="text-sm text-gray-700">{payroll.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal}
        onClose={() => {
          setApproveModal(false)
          setApprovalNotes('')
        }}
        title="Approve Payroll"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Approve payroll for {payroll.employee.personalInfo.firstName} {payroll.employee.personalInfo.lastName}?
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
                setApproveModal(false)
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

export default PayrollDetails