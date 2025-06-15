import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PayrollList from './PayrollList'
import PayrollForm from './PayrollForm'
import PayrollDetails from './PayrollDetails'
import MyPayrolls from './MyPayrolls'

const Payroll = () => {
  return (
    <Routes>
      <Route index element={<PayrollList />} />
      <Route path="new" element={<PayrollForm />} />
      <Route path="my-payrolls" element={<MyPayrolls />} />
      <Route path=":id" element={<PayrollDetails />} />
      <Route path=":id/edit" element={<PayrollForm />} />
    </Routes>
  )
}

export default Payroll