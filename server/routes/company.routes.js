const express = require('express');
const router = express.Router();

const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/company.controller');

const { protect, restrictTo } = require('../middleware/auth');

// Public/student read routes
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Admin-only management routes
router.post('/', protect, restrictTo('admin'), createCompany);
router.put('/:id', protect, restrictTo('admin'), updateCompany);
router.delete('/:id', protect, restrictTo('admin'), deleteCompany);

module.exports = router;
