import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { employeesAPI } from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import Modal from '../../components/UI/Modal'
import toast from 'react-hot-toast'

const EmployeesList = () => {
  const { hasPermission } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ department: '', type: '', isActive: '' })
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null })

  useEffect(() => {
    fetchEmployees()
  }, [pagination.current, filters])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      }
      const response = await employeesAPI.getAll(params)
      setEmployees(response.data.data.employees)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await employeesAPI.delete(deleteModal.employee._id)
      toast.success('Employee deleted successfully')
      setDeleteModal({ open: false, employee: null })
      fetchEmployees()
    } catch (error) {
      toast.error('Failed to delete employee')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage employee profiles and information</p>
        </div>
        {hasPermission('create_employee') && (
          <Link to="/employees/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Employee
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="input-field"
              placeholder="Filter by department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="Permanent">Permanent</option>
              <option value="Contractual">Contractual</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ department: '', type: '', isActive: '' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Position</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">
                        {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {employee.employeeId}
                      </div>
                      {employee.userId && (
                        <div className="text-sm text-gray-500">
                          {employee.userId.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {employee.employmentDetails.department}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {employee.employmentDetails.position}
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant={getTypeBadgeVariant(employee.employmentDetails.type)}>
                      {employee.employmentDetails.type}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <Badge variant={employee.isActive ? 'success' : 'danger'}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <Link
                        to={`/employees/${employee._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {hasPermission('update_employee') && (
                        <Link
                          to={`/employees/${employee._id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      )}
                      {hasPermission('delete_employee') && (
                        <button
                          onClick={() => setDeleteModal({ open: true, employee })}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current}
        totalPages={pagination.pages}
        onPageChange={(page) => setPagination({ ...pagination, current: page })}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, employee: null })}
        title="Delete Employee"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete employee "{deleteModal.employee?.personalInfo?.firstName} {deleteModal.employee?.personalInfo?.lastName}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal({ open: false, employee: null })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EmployeesList