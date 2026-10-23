import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import driveService from '../../services/driveService';
import companyService from '../../services/companyService';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Modal,
} from '../../components/ui';
import {
  Building2,
  Search,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Globe,
  HelpCircle,
  MessageSquareText,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['All', 'CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const EMPLOYMENT_TYPES = ['All', 'Full-time', 'Internship', 'Internship + PPO'];

export default function StudentCompanies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'companies';
  const [activeTab, setActiveTab] = useState(initialTab); // 'companies' or 'drives'

  // Loading states
  const [loading, setLoading] = useState(true);

  // Drives state
  const [drives, setDrives] = useState([]);
  const [drivePagination, setDrivePagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [companyPagination, setCompanyPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Selected company modal state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [loadingCompanyDetail, setLoadingCompanyDetail] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [industries, setIndustries] = useState(['All']);

  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies(1);
    } else {
      fetchDrives(1);
    }
  }, [activeTab, searchParams]);

  // Fetch all registered companies (including newly added by Admin)
  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const res = await companyService.getCompanies({
        search: searchParams.get('search') || '',
        page,
        limit: 12,
      });
      if (res.success) {
        const companyList = res.data || [];
        setCompanies(companyList);
        if (res.pagination) setCompanyPagination(res.pagination);

        // Extract distinct industries
        const indSet = new Set(['All']);
        companyList.forEach((c) => {
          if (c.industry) indSet.add(c.industry);
        });
        setIndustries(Array.from(indSet));
      }
    } catch (err) {
      toast.error('Failed to load corporate partners.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active placement drives
  const fetchDrives = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: searchParams.get('search') || '',
        department: department !== 'All' ? department : '',
        employment_type: employmentType !== 'All' ? employmentType : '',
        status: 'published',
      };

      const res = await driveService.getDrives(params);
      if (res.success) {
        setDrives(res.data);
        if (res.pagination) setDrivePagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search.trim()) newParams.search = search.trim();
    newParams.tab = activeTab;
    setSearchParams(newParams);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newParams = {};
    if (search.trim()) newParams.search = search.trim();
    newParams.tab = tab;
    setSearchParams(newParams);
  };

  // Open rich company detail modal
  const handleOpenCompanyModal = async (company) => {
    try {
      setSelectedCompany(company);
      setCompanyModalOpen(true);
      setLoadingCompanyDetail(true);
      const res = await companyService.getCompanyById(company.id);
      if (res.success) {
        setSelectedCompany(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompanyDetail(false);
    }
  };

  // Filter companies by industry in UI
  const filteredCompanies = companies.filter((c) => {
    if (selectedIndustry !== 'All' && c.industry !== selectedIndustry) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── Page Header & Mode Selector ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-primary" /> Placement Companies & Drives
          </h1>
          <p className="text-xs text-muted mt-1">
            Browse all visiting campus recruiting companies, explore past placement stats, and apply to open drives.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-secondary-100 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleTabChange('companies')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'companies'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Partner Companies
            {companyPagination.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-100 text-primary-800">
                {companyPagination.total}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('drives')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'drives'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Active Placement Drives
            {drivePagination.total > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-100 text-primary-800">
                {drivePagination.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Search & Filters Bar ──────────────────────────────── */}
      <Card className="p-4 shadow-sm border-border">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className={activeTab === 'companies' ? 'sm:col-span-7 relative' : 'sm:col-span-5 relative'}>
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder={
                  activeTab === 'companies'
                    ? 'Search partner companies by name, industry, or location...'
                    : 'Search drives by role, company name, or location...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-xs font-medium text-slate-900 placeholder:text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* If on Companies Tab: Industry Filter */}
            {activeTab === 'companies' && (
              <div className="sm:col-span-3">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full py-2 px-3 bg-surface border border-border rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind === 'All' ? 'All Industries' : ind}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If on Drives Tab: Department & Employment Type */}
            {activeTab === 'drives' && (
              <>
                <div className="sm:col-span-3">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full py-2 px-3 bg-surface border border-border rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        Branch: {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full py-2 px-3 bg-surface border border-border rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" variant="primary" size="sm" className="w-full text-xs font-semibold">
                Filter
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* ─── TAB 1: ALL PARTNER COMPANIES ──────────────────────── */}
      {activeTab === 'companies' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredCompanies && filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((c) => (
                <Card
                  key={c.id}
                  className="flex flex-col justify-between hover:shadow-card-hover transition-all duration-200 border-border group"
                >
                  <CardBody className="p-5 space-y-4">
                    {/* Top: Initial Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary font-bold text-lg flex items-center justify-center border border-primary-200 shrink-0 shadow-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-100 text-secondary-800 border border-secondary-200">
                          {c.industry || 'Corporate Partner'}
                        </span>
                        {c.total_drives > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-50 text-success-800 border border-success-200">
                            {c.total_drives} Drive{c.total_drives > 1 ? 's' : ''} Listed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary-50 text-muted">
                            New Partner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Company Name & Location */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-secondary-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {c.name}
                      </h3>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
                        {c.headquarters || 'India'}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-secondary-600 line-clamp-2 leading-relaxed">
                      {c.description || 'Verified campus corporate recruiting partner.'}
                    </p>

                    {/* Official Website */}
                    {c.website && (
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-[11px] text-muted flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-secondary-400" /> Official Careers
                        </span>
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </CardBody>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCompanyModal(c)}
                      className="w-full text-xs font-semibold py-2 group-hover:border-primary group-hover:text-primary transition-all flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" /> View Company Profile
                    </Button>
                    {c.total_drives > 0 && (
                      <button
                        onClick={() => {
                          setSearch(c.name);
                          handleTabChange('drives');
                        }}
                        className="w-full text-[11px] font-semibold text-primary hover:underline text-center block pt-1"
                      >
                        View {c.total_drives} Active Placement Drive{c.total_drives > 1 ? 's' : ''} →
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Companies Found"
              description="No registered partner companies match your search criteria."
              actionText="Clear Search"
              onAction={() => {
                setSearch('');
                setSelectedIndustry('All');
                setSearchParams({ tab: 'companies' });
              }}
            />
          )}

          {/* Companies Pagination */}
          {companyPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={companyPagination.page <= 1}
                onClick={() => fetchCompanies(companyPagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-secondary-700 px-3">
                Page {companyPagination.page} of {companyPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={companyPagination.page >= companyPagination.totalPages}
                onClick={() => fetchCompanies(companyPagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: ACTIVE PLACEMENT DRIVES ────────────────────── */}
      {activeTab === 'drives' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : drives && drives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive) => {
                const isDeadlinePassed = new Date(drive.application_deadline) < new Date();
                return (
                  <Card
                    key={drive.id}
                    className="flex flex-col justify-between hover:shadow-card-hover transition-all duration-200 border-border group"
                  >
                    <CardBody className="p-5 space-y-4">
                      {/* Top: Logo & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary-100 text-secondary-900 font-bold text-base flex items-center justify-center border border-border shrink-0">
                          {drive.company_name.charAt(0)}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge status="published">{drive.employment_type}</Badge>
                          {drive.student_application_status && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">
                              {drive.student_application_status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Company & Role */}
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-secondary-900 group-hover:text-primary transition-colors">
                          {drive.company_name}
                        </h3>
                        <p className="text-xs font-medium text-secondary-600 line-clamp-1">{drive.job_title}</p>
                      </div>

                      {/* Key Details (Salary, Location, Branches) */}
                      <div className="p-3 bg-secondary-50/70 rounded-xl space-y-1.5 text-xs text-secondary-700">
                        <div className="flex items-center justify-between font-bold text-secondary-900">
                          <span>Package (CTC):</span>
                          <span className="text-primary text-sm">₹{drive.package_lpa} LPA</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>Location:</span>
                          <span className="truncate max-w-[150px]">{drive.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>Min CGPA:</span>
                          <span>{drive.min_cgpa} CGPA</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>Eligible Branches:</span>
                          <span className="truncate max-w-[140px] font-medium text-secondary-800">
                            {drive.eligible_departments}
                          </span>
                        </div>
                      </div>

                      {/* Deadline Notice */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border">
                        <span className="text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-warning" />
                          {isDeadlinePassed ? 'Deadline Closed' : `Closes ${new Date(drive.application_deadline).toLocaleDateString()}`}
                        </span>
                        <span className="text-muted text-[10px]">
                          Drive: {new Date(drive.drive_date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardBody>

                    <div className="p-4 pt-0">
                      <Link to={`/student/companies/${drive.id}`} className="block">
                        <Button variant="outline" className="w-full text-xs font-semibold py-2 group-hover:bg-primary group-hover:text-white transition-all">
                          View Details & Eligibility <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Placement Drives Found"
              description="Try modifying your search keywords or branch filters to find recruitment opportunities."
              actionText="Clear Filters"
              onAction={() => {
                setSearch('');
                setDepartment('All');
                setEmploymentType('All');
                setSearchParams({ tab: 'drives' });
              }}
            />
          )}

          {/* Drives Pagination */}
          {drivePagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={drivePagination.page <= 1}
                onClick={() => fetchDrives(drivePagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-secondary-700 px-3">
                Page {drivePagination.page} of {drivePagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={drivePagination.page >= drivePagination.totalPages}
                onClick={() => fetchDrives(drivePagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ─── Company Details Modal ─────────────────────────────── */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title={selectedCompany?.name || 'Company Profile'}
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-5 text-secondary-900">
            {/* Top Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary font-bold text-2xl flex items-center justify-center border border-primary-200 shrink-0 shadow-sm">
                {selectedCompany.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-secondary-900">{selectedCompany.name}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-100 font-semibold text-secondary-800">
                    {selectedCompany.industry}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedCompany.headquarters || 'India'}
                  </span>
                </div>
              </div>
            </div>

            {/* About Company */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">About Company</h4>
              <p className="text-xs text-secondary-700 leading-relaxed bg-secondary-50/60 p-3.5 rounded-xl border border-border">
                {selectedCompany.description || 'Corporate recruitment partner at campus placement portal.'}
              </p>
            </div>

            {/* Official Website */}
            {selectedCompany.website && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50 border border-primary-100 text-xs">
                <span className="font-semibold text-secondary-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" /> Official Company Website
                </span>
                <a
                  href={selectedCompany.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {selectedCompany.website} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Historical Campus Hiring (if available) */}
            {selectedCompany.history && selectedCompany.history.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-secondary-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Past Recruitment History
                </h4>
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary-50 text-secondary-600 font-semibold border-b border-border">
                      <tr>
                        <th className="px-3.5 py-2">Batch Year</th>
                        <th className="px-3.5 py-2">Offers Given</th>
                        <th className="px-3.5 py-2">Avg CTC (LPA)</th>
                        <th className="px-3.5 py-2">Highest CTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedCompany.history.map((h, i) => (
                        <tr key={i} className="hover:bg-secondary-50/40">
                          <td className="px-3.5 py-2 font-bold text-secondary-900">{h.year}</td>
                          <td className="px-3.5 py-2 font-semibold text-primary">{h.students_placed} Offers</td>
                          <td className="px-3.5 py-2 text-secondary-700">₹{h.average_package_lpa} LPA</td>
                          <td className="px-3.5 py-2 font-bold text-success-700">₹{h.highest_package_lpa} LPA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Links for Exam Prep */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">
                Preparation Materials for {selectedCompany.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to={`/student/questions?company=${encodeURIComponent(selectedCompany.name)}`}
                  className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary-100 text-primary">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-secondary-900 group-hover:text-primary">Previous Questions</p>
                      <p className="text-[11px] text-muted">Aptitude & Technical</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-400 group-hover:text-primary" />
                </Link>

                <Link
                  to={`/student/experiences?company=${encodeURIComponent(selectedCompany.name)}`}
                  className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <MessageSquareText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-secondary-900 group-hover:text-primary">Interview Experiences</p>
                      <p className="text-[11px] text-muted">Real Senior Reviews</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-400 group-hover:text-primary" />
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="primary" size="sm" onClick={() => setCompanyModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
