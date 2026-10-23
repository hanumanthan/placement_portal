const CompanyModel = require('../models/company.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

/**
 * @desc    Get all companies with search and filters
 * @route   GET /api/companies
 * @access  Public / Private
 */
const getCompanies = catchAsync(async (req, res) => {
  const { search, industry, page, limit } = req.query;
  const result = await CompanyModel.findAll({ search, industry, page, limit });
  sendPaginated(res, result.companies, result.pagination, 'Companies retrieved successfully');
});

/**
 * @desc    Get company by ID
 * @route   GET /api/companies/:id
 * @access  Public / Private
 */
const getCompanyById = catchAsync(async (req, res, next) => {
  const company = await CompanyModel.findById(req.params.id);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }
  sendSuccess(res, company, 'Company retrieved successfully');
});

/**
 * @desc    Create a new company
 * @route   POST /api/companies
 * @access  Private (Admin)
 */
const createCompany = catchAsync(async (req, res, next) => {
  const { name, website, industry, headquarters, description, logo_url } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError('Company name is required.', 400));
  }

  const companyId = await CompanyModel.create({
    name: name.trim(),
    website,
    industry,
    headquarters,
    description,
    logo_url,
  });

  const newCompany = await CompanyModel.findById(companyId);
  sendCreated(res, newCompany, 'Company created successfully');
});

/**
 * @desc    Update an existing company
 * @route   PUT /api/companies/:id
 * @access  Private (Admin)
 */
const updateCompany = catchAsync(async (req, res, next) => {
  const { name, website, industry, headquarters, description, logo_url } = req.body;
  const companyId = req.params.id;

  const updated = await CompanyModel.update(companyId, {
    name,
    website,
    industry,
    headquarters,
    description,
    logo_url,
  });

  if (!updated) {
    return next(new AppError('Company not found or no changes provided.', 404));
  }

  const updatedCompany = await CompanyModel.findById(companyId);
  sendSuccess(res, updatedCompany, 'Company updated successfully');
});

/**
 * @desc    Delete a company
 * @route   DELETE /api/companies/:id
 * @access  Private (Admin)
 */
const deleteCompany = catchAsync(async (req, res, next) => {
  const deleted = await CompanyModel.delete(req.params.id);
  if (!deleted) {
    return next(new AppError('Company not found.', 404));
  }
  sendSuccess(res, null, 'Company deleted successfully');
});

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
