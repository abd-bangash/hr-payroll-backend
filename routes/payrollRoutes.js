const express = require('express');
const { validate, payrollValidation } = require('../middlewares/validation');
const { authenticateJWT, authorizePermission } = require('../middlewares/auth');
const {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  approvePayroll,
  generatePayslip,
  handleGeneratePayrollCSV,
  getMyPayrolls
} = require('../controllers/payrollController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Employee self-service routes
router.get('/my-payrolls', getMyPayrolls);

// Routes with permission checks
router.post('/', authorizePermission('create_payroll'), validate(payrollValidation.create), createPayroll);
router.get('/', authorizePermission('read_payroll'), getPayrolls);
router.get('/csv', authorizePermission('read_payroll'), handleGeneratePayrollCSV);
router.get('/:id', authorizePermission('read_payroll'), getPayrollById);
router.put('/:id', authorizePermission('update_payroll'), updatePayroll);
router.post('/:id/approve', authorizePermission('approve_payroll'), approvePayroll);
router.get('/:id/payslip', authorizePermission('read_payroll'), generatePayslip);

module.exports = router;