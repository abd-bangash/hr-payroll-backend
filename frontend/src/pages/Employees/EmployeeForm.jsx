import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { employeesAPI, usersAPI } from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const EmployeeForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [users, setUsers] = useState([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    fetchUsers()
    if (isEdit) {
      fetchEmployee()
    }
  }, [id, isEdit])

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll({ limit: 100 })
      setUsers(response.data.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchEmployee = async () => {
    try {
      const response = await employeesAPI.getById(id)
      const employee = response.data.data
      reset({
        userId: employee.userId._id,
        personalInfo: employee.personalInfo,
        employmentDetails: employee.employmentDetails,
        salaryDetails: employee.salaryDetails,
        isActive: employee.isActive
      })
    } catch (error) {
      toast.error('Failed to fetch employee details')
      navigate('/employees')
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Format the data structure
      const formattedData = {
        userId: data.userId,
        personalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth || undefined,
          gender: data.gender || undefined,
          phone: data.phone || undefined,
          address: {
            street: data.street || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            zipCode: data.zipCode || undefined,
            country: data.country || undefined
          }
        },
        employmentDetails: {
          type: data.type,
          department: data.department,
          position: data.position,
          joiningDate: data.joiningDate,
          reportingManager: data.reportingManager || undefined
        },
        salaryDetails: {
          baseSalary: parseFloat(data.baseSalary),
          currency: data.currency || 'USD',
          payFrequency: data.payFrequency || 'Monthly',
          bankDetails: {
            accountNumber: data.accountNumber || undefined,
            bankName: data.bankName || undefined,
            routingNumber: data.routingNumber || undefined,
            accountType: data.accountType || undefined
          }
        }
      }

      if (isEdit) {
        formattedData.isActive = data.isActive
        await employeesAPI.update(id, formattedData)
        toast.success('Employee updated successfully')
      } else {
        await employeesAPI.create(formattedData)
        toast.success('Employee created successfully')
      }
      navigate('/employees')
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} employee`
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Employee' : 'Create Employee'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update employee information' : 'Add a new employee to the system'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* User Selection */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Account</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Account *
            </label>
            <select
              {...register('userId', { required: 'User account is required' })}
              className="input-field"
              disabled={isEdit}
            >
              <option value="">Select User Account</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="input-field"
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="input-field"
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register('gender')}
                className="input-field"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  {...register('street')}
                  type="text"
                  className="input-field"
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  {...register('city')}
                  type="text"
                  className="input-field"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  {...register('state')}
                  type="text"
                  className="input-field"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  {...register('zipCode')}
                  type="text"
                  className="input-field"
                  placeholder="Enter zip code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  className="input-field"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type *
              </label>
              <select
                {...register('type', { required: 'Employment type is required' })}
                className="input-field"
              >
                <option value="">Select Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Contractual">Contractual</option>
                <option value="Freelancer">Freelancer</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                {...register('department', { required: 'Department is required' })}
                type="text"
                className="input-field"
                placeholder="Enter department"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <input
                {...register('position', { required: 'Position is required' })}
                type="text"
                className="input-field"
                placeholder="Enter position"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                {...register('joiningDate', { required: 'Joining date is required' })}
                type="date"
                className="input-field"
              />
              {errors.joiningDate && (
                <p className="mt-1 text-sm text-red-600">{errors.joiningDate.message}</p>
              )}
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('isActive')}
                  className="input-field"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Salary Details */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Salary *
              </label>
              <input
                {...register('baseSalary', { 
                  required: 'Base salary is required',
                  min: { value: 0, message: 'Salary must be positive' }
                })}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="Enter base salary"
              />
              {errors.baseSalary && (
                <p className="mt-1 text-sm text-red-600">{errors.baseSalary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                {...register('currency')}
                className="input-field"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Frequency
              </label>
              <select
                {...register('payFrequency')}
                className="input-field"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  {...register('accountNumber')}
                  type="text"
                  className="input-field"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  {...register('bankName')}
                  type="text"
                  className="input-field"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  {...register('routingNumber')}
                  type="text"
                  className="input-field"
                  placeholder="Enter routing number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  {...register('accountType')}
                  className="input-field"
                >
                  <option value="">Select Account Type</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              isEdit ? 'Update Employee' : 'Create Employee'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm