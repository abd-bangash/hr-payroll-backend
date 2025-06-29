const express = require("express");
const { authenticateJWT, authorizePermission } = require("../middlewares/auth");
const {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments,
} = require("../controllers/departmentController");
const Joi = require("joi");

const router = express.Router();

router.use(authenticateJWT);

const departmentValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    head: Joi.string().optional().allow(null, ""),
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    head: Joi.string().optional().allow(null, ""),
  }),
};

// Create department
router.post("/", authorizePermission("create_department"), createDepartment);

// Update department
router.put("/:id", authorizePermission("update_department"), updateDepartment);

// Delete department
router.delete(
  "/:id",
  authorizePermission("delete_department"),
  deleteDepartment
);

// Get all departments
router.get("/", authorizePermission("read_department"), getDepartments);

module.exports = router;
