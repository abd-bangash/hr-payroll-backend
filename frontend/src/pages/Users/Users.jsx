import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UsersList from './UsersList'
import UserForm from './UserForm'
import UserDetails from './UserDetails'

const Users = () => {
  return (
    <Routes>
      <Route index element={<UsersList />} />
      <Route path="new" element={<UserForm />} />
      <Route path=":id" element={<UserDetails />} />
      <Route path=":id/edit" element={<UserForm />} />
    </Routes>
  )
}

export default Users