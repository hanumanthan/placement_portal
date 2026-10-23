const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  getCategories,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resource.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All resource routes require authentication
router.use(protect);

// Student & Admin: Browse resources
router.get('/', getResources);
router.get('/categories', getCategories);
router.get('/:id', getResourceById);

// Admin only: CRUD
router.post('/', restrictTo('admin'), createResource);
router.put('/:id', restrictTo('admin'), updateResource);
router.delete('/:id', restrictTo('admin'), deleteResource);

module.exports = router;
