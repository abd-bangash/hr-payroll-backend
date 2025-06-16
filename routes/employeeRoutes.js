const express = require('express');
const { validate, employeeValidation } = require('../middlewares/validation');
const { authenticateJWT, authorizePermission } = require('../middlewares/auth');
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile
} = require('../controllers/employeeController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Employee self-service routes
router.get('/my-profile', getMyProfile);

// Routes with permission checks
router.post('/', authorizePermission('create_employee'), validate(employeeValidation.create), createEmployee);
router.get('/', authorizePermission('read_employee'), getEmployees);
router.get('/:id', authorizePermission('read_employee'), getEmployeeById);
router.put('/:id', authorizePermission('update_employee'), updateEmployee);
router.delete('/:id', authorizePermission('delete_employee'), deleteEmployee);

module.exports = router;