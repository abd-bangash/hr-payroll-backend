import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { employeesAPI } from '../../services/api'
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import toast from 'react-hot-toast'

const EmployeeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    try {
      const response = await employeesAPI.getById(id)
      setEmployee(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch employee details')
      navigate('/employees')
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadgeVariant = (type) => {
    const variants = {
      Permanent: 'success',
      Contractual: 'warning',
      Freelancer: 'info'
    }
    return variants[type] || 'default'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employee not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
            <p className="text-gray-600">View employee information and details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {hasPermission('update_employee') && (
            <Link
              to={`/employees/${employee._id}/edit`}
              className="btn-secondary"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Employee
            </Link>
          )}
        </div>
      </div>

      {/* Employee Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                <p className="mt-1 text-sm text-gray-900">{employee.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                </p>
              </div>
              {employee.personalInfo.dateOfBirth && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(employee.personalInfo.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
              {employee.personalInfo.gender && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{employee.personalInfo.gender}</p>
                </div>
              )}
              {employee.personalInfo.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{employee.personalInfo.phone}</p>
                </div>
              )}
            </div>

            {/* Address */}
            {employee.personalInfo.address && Object.values(employee.personalInfo.address).some(val => val) && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                <div className="text-sm text-gray-900">
                  {employee.personalInfo.address.street && (
                    <p>{employee.personalInfo.address.street}</p>
                  )}
                  <p>
                    {[
                      employee.personalInfo.address.city,
                      employee.personalInfo.address.state,
                      employee.personalInfo.address.zipCode
                    ].filter(Boolean).join(', ')}
                  </p>
                  {employee.personalInfo.address.country && (
                    <p>{employee.personalInfo.address.country}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Employment Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Department</label>
                <p className="mt-1 text-sm text-gray-900">{employee.employmentDetails.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Position</label>
                <p className="mt-1 text-sm text-gray-900">{employee.employmentDetails.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Employment Type</label>
                <div className="mt-1">
                  <Badge variant={getTypeBadgeVariant(employee.employmentDetails.type)}>
                    {employee.employmentDetails.type}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Joining Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(employee.employmentDetails.joiningDate).toLocaleDateString()}
                </p>
              </div>
              {employee.employmentDetails.reportingManager && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reporting Manager</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.employmentDetails.reportingManager.personalInfo.firstName}{' '}
                    {employee.employmentDetails.reportingManager.personalInfo.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Salary Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Base Salary</label>
                <p className="mt-1 text-sm text-gray-900">
                  {employee.salaryDetails.currency} {employee.salaryDetails.baseSalary.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Pay Frequency</label>
                <p className="mt-1 text-sm text-gray-900">{employee.salaryDetails.payFrequency}</p>
              </div>
            </div>

            {/* Bank Details */}
            {employee.salaryDetails.bankDetails && Object.values(employee.salaryDetails.bankDetails).some(val => val) && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employee.salaryDetails.bankDetails.bankName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Bank Name</label>
                      <p className="mt-1 text-sm text-gray-900">{employee.salaryDetails.bankDetails.bankName}</p>
                    </div>
                  )}
                  {employee.salaryDetails.bankDetails.accountNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Account Number</label>
                      <p className="mt-1 text-sm text-gray-900">****{employee.salaryDetails.bankDetails.accountNumber.slice(-4)}</p>
                    </div>
                  )}
                  {employee.salaryDetails.bankDetails.routingNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Routing Number</label>
                      <p className="mt-1 text-sm text-gray-900">{employee.salaryDetails.bankDetails.routingNumber}</p>
                    </div>
                  )}
                  {employee.salaryDetails.bankDetails.accountType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Account Type</label>
                      <p className="mt-1 text-sm text-gray-900">{employee.salaryDetails.bankDetails.accountType}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Employee Status</label>
                <div className="mt-1">
                  <Badge variant={employee.isActive ? 'success' : 'danger'}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* User Account */}
          {employee.userId && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Account</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Username</label>
                  <p className="mt-1 text-sm text-gray-900">{employee.userId.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{employee.userId.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{employee.userId.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetails