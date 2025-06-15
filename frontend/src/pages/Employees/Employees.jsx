import React from 'react'
import { Routes, Route } from 'react-router-dom'
import EmployeesList from './EmployeesList'
import EmployeeForm from './EmployeeForm'
import EmployeeDetails from './EmployeeDetails'

const Employees = () => {
  return (
    <Routes>
      <Route index element={<EmployeesList />} />
      <Route path="new" element={<EmployeeForm />} />
      <Route path=":id" element={<EmployeeDetails />} />
      <Route path=":id/edit" element={<EmployeeForm />} />
    </Routes>
  )
}

export default Employees