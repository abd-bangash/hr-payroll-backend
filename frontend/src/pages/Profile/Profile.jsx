import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Badge from '../../components/UI/Badge'
import Modal from '../../components/UI/Modal'

const Profile = () => {
  const { user, changePassword } = useAuth()
  const [passwordModal, setPasswordModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return
    }

    try {
      setLoading(true)
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      
      if (result.success) {
        setPasswordModal(false)
        reset()
      }
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user?.role)}>
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Login</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setPasswordModal(true)}
                className="w-full btn-primary"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {user?.permissions && user.permissions.length > 0 ? (
            user.permissions.map((permission) => (
              <div key={permission} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700 capitalize">
                  {permission.replace(/_/g, ' ')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">No permissions assigned</p>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModal}
        onClose={() => {
          setPasswordModal(false)
          reset()
        }}
        title="Change Password"
      >
        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              {...register('currentPassword', { required: 'Current password is required' })}
              type="password"
              className="input-field"
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              {...register('newPassword', { 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              type="password"
              className="input-field"
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: (value, { newPassword }) => 
                  value === newPassword || 'Passwords do not match'
              })}
              type="password"
              className="input-field"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setPasswordModal(false)
                reset()
              }}
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
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Profile