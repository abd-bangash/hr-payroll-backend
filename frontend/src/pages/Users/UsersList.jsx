import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI } from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Pagination from '../../components/UI/Pagination'
import Modal from '../../components/UI/Modal'
import toast from 'react-hot-toast'

const UsersList = () => {
  const { hasRole } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ role: '', isActive: '' })
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, user: null })
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [pagination.current, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      }
      const response = await usersAPI.getAll(params)
      setUsers(response.data.data.users)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await usersAPI.delete(deleteModal.user.id)
      toast.success('User deleted successfully')
      setDeleteModal({ open: false, user: null })
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleResetPassword = async () => {
    try {
      await usersAPI.resetPassword(resetPasswordModal.user.id, { newPassword })
      toast.success('Password reset successfully')
      setResetPasswordModal({ open: false, user: null })
      setNewPassword('')
    } catch (error) {
      toast.error('Failed to reset password')
    }
  }

  const getRoleBadgeVariant = (role) => {
    const variants = {
      SuperAdmin: 'danger',
      Admin: 'warning',
      HR: 'info',
      Finance: 'primary',
      Employee: 'default'
    }
    return variants[role] || 'default'
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        {hasRole('SuperAdmin') && (
          <Link to="/users/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Employee">Employee</option>
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
              onClick={() => setFilters({ role: '', isActive: '' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">User</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Last Login</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <Link
                        to={`/users/${user._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                      <Link
                        to={`/users/${user._id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      {hasRole('SuperAdmin') && (
                        <>
                          <button
                            onClick={() => setResetPasswordModal({ open: true, user })}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, user })}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
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
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete user "{deleteModal.user?.username}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal({ open: false, user: null })}
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

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetPasswordModal.open}
        onClose={() => {
          setResetPasswordModal({ open: false, user: null })
          setNewPassword('')
        }}
        title="Reset Password"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Reset password for user "{resetPasswordModal.user?.username}"
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setResetPasswordModal({ open: false, user: null })
                setNewPassword('')
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              disabled={!newPassword}
              className="btn-primary"
            >
              Reset Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UsersList