import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Download,
  Building2,
  GraduationCap,
  Layers,
  Edit3
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { driveService } from '../../services/driveService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Interested: { color: 'info', icon: Clock },
  Applied: { color: 'default', icon: Layers },
  Shortlisted: { color: 'warning', icon: UserCheck },
  'Test Completed': { color: 'primary', icon: CheckCircle },
  Interview: { color: 'warning', icon: Clock },
  Selected: { color: 'success', icon: CheckCircle },
  Rejected: { color: 'danger', icon: XCircle },
  Withdrawn: { color: 'default', icon: AlertCircle },
};

const ALL_STATUSES = [
  'Interested',
  'Applied',
  'Shortlisted',
  'Test Completed',
  'Interview',
  'Selected',
  'Rejected',
  'Withdrawn',
];

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [driveFilter, setDriveFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modals
  const [editModalApp, setEditModalApp] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editRound, setEditRound] = useState(0);
  const [editRemarks, setEditRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [viewStudentModal, setViewStudentModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, driveFilter, departmentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, drivesRes] = await Promise.all([
        applicationService.getAllApplications({
          status: statusFilter || undefined,
          drive_id: driveFilter || undefined,
          department: departmentFilter || undefined,
        }),
        driveService.getAllDrives(),
      ]);

      if (appsRes.success) {
        setApplications(appsRes.data);
      }
      if (drivesRes.success) {
        setDrives(drivesRes.data);
      }
    } catch (err) {
      toast.error('Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredApps.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenEdit = (app) => {
    setEditModalApp(app);
    setEditStatus(app.status);
    setEditRound(app.round_cleared || 0);
    setEditRemarks(app.remarks || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await applicationService.updateApplicationStatus(editModalApp.id, {
        status: editStatus,
        round_cleared: Number(editRound),
        remarks: editRemarks,
      });

      if (res.success) {
        toast.success('Application status updated successfully');
        setEditModalApp(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveBulk = async () => {
    if (!bulkStatus) {
      toast.error('Please select a target status');
      return;
    }
    try {
      setUpdating(true);
      const res = await applicationService.bulkUpdateStatus({
        application_ids: selectedIds,
        status: bulkStatus,
        remarks: bulkRemarks || undefined,
      });

      if (res.success) {
        toast.success(`Successfully updated ${selectedIds.length} applications`);
        setShowBulkModal(false);
        setSelectedIds([]);
        setBulkStatus('');
        setBulkRemarks('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.student_name?.toLowerCase().includes(term) ||
      app.register_number?.toLowerCase().includes(term) ||
      app.company_name?.toLowerCase().includes(term) ||
      app.job_role?.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: applications.length,
    selected: applications.filter((a) => a.status === 'Selected').length,
    shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length,
  };

  const departments = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage candidates, review qualifications, and update hiring pipeline stages
          </p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl animate-fade-in">
            <span className="text-xs font-semibold text-primary">
              {selectedIds.length} candidate(s) selected
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowBulkModal(true)}
              className="shadow-sm"
            >
              Bulk Status Update
            </Button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Applicants</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-amber-100 bg-amber-50/20 rounded-xl p-3.5 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Shortlisted</p>
          <p className="text-xl font-bold text-amber-900 mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-white border border-blue-100 bg-blue-50/20 rounded-xl p-3.5 shadow-sm">
          <p className="text-xs font-medium text-blue-700">In Interview</p>
          <p className="text-xl font-bold text-blue-900 mt-1">{stats.interview}</p>
        </div>
        <div className="bg-white border border-emerald-100 bg-emerald-50/20 rounded-xl p-3.5 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Selected / Offers</p>
          <p className="text-xl font-bold text-emerald-900 mt-1">{stats.selected}</p>
        </div>
        <div className="bg-white border border-rose-100 bg-rose-50/20 rounded-xl p-3.5 shadow-sm">
          <p className="text-xs font-medium text-rose-700">Rejected</p>
          <p className="text-xl font-bold text-rose-900 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate, reg #, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <select
              value={driveFilter}
              onChange={(e) => setDriveFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">All Drives & Companies</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company_name} — {d.job_role}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardBody className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 mt-2">Loading applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-medium text-slate-700">No applications found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search criteria or filter tags
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === filteredApps.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    />
                  </th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Drive & Company</th>
                  <th className="py-3.5 px-4">Academic Specs</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || { color: 'default' };
                  const isSelected = selectedIds.includes(app.id);

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(app.id)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-primary text-xs uppercase overflow-hidden flex-shrink-0">
                            {app.profile_photo_url ? (
                              <img
                                src={`http://localhost:5000${app.profile_photo_url}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              app.student_name?.charAt(0) || 'S'
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => setViewStudentModal(app)}
                              className="font-semibold text-slate-900 hover:text-primary transition-colors text-left"
                            >
                              {app.student_name}
                            </button>
                            <div className="text-xs text-slate-400 font-mono">
                              {app.register_number}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{app.company_name}</div>
                        <div className="text-xs text-slate-500">{app.job_role}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {app.department}
                          </span>
                          <span>CGPA: <strong>{app.cgpa}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          10th: {app.tenth_percentage}% | 12th: {app.twelfth_percentage}%
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={cfg.color}>{app.status}</Badge>
                        {app.round_cleared > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Round {app.round_cleared} cleared
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(app.applied_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.resume_url && (
                            <a
                              href={`http://localhost:5000${app.resume_url}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View Resume"
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenEdit(app)}
                            className="text-xs px-2.5 py-1"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Edit Single Application Modal */}
      {editModalApp && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalApp(null)}
          title={`Update Application: ${editModalApp.student_name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
              <p>
                <strong className="text-slate-700">Company:</strong> {editModalApp.company_name} (
                {editModalApp.job_role})
              </p>
              <p>
                <strong className="text-slate-700">Register No:</strong>{' '}
                {editModalApp.register_number}
              </p>
              <p>
                <strong className="text-slate-700">Branch & CGPA:</strong>{' '}
                {editModalApp.department} | {editModalApp.cgpa}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Stage / Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rounds Cleared (Count)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={editRound}
                onChange={(e) => setEditRound(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes & Feedback (Visible to Admin & Updates Logs)
              </label>
              <textarea
                rows="3"
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                placeholder="e.g., Shortlisted for Technical Round 2 on Monday 10:00 AM"
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditModalApp(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={updating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowBulkModal(false)}
          title={`Bulk Update (${selectedIds.length} Applicants)`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Apply this pipeline state change simultaneously across all selected student
              applications. Automated notifications will be sent to their accounts.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Status
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">-- Choose New Status --</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Broadcast Remarks / Message (Optional)
              </label>
              <textarea
                rows="3"
                value={bulkRemarks}
                onChange={(e) => setBulkRemarks(e.target.value)}
                placeholder="e.g., Congratulations! You have cleared Round 1. Interview scheduled shortly."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveBulk}
                loading={updating}
              >
                Apply Bulk Update
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Student Profile Summary Modal */}
      {viewStudentModal && (
        <Modal
          isOpen={true}
          onClose={() => setViewStudentModal(null)}
          title="Candidate Profile Summary"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-primary text-lg uppercase overflow-hidden flex-shrink-0">
                {viewStudentModal.profile_photo_url ? (
                  <img
                    src={`http://localhost:5000${viewStudentModal.profile_photo_url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  viewStudentModal.student_name?.charAt(0) || 'S'
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {viewStudentModal.student_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {viewStudentModal.register_number} &bull; {viewStudentModal.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                    {viewStudentModal.department} ({viewStudentModal.batch_year || '2025'})
                  </span>
                </div>
              </div>
            </div>

            {/* Academic stats */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">CGPA</span>
                <span className="font-bold text-slate-800">{viewStudentModal.cgpa}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">10th Std</span>
                <span className="font-bold text-slate-800">
                  {viewStudentModal.tenth_percentage}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">12th / Dip</span>
                <span className="font-bold text-slate-800">
                  {viewStudentModal.twelfth_percentage}%
                </span>
              </div>
            </div>

            {/* Arrears */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              <span className="text-slate-600">Standing Arrears:</span>
              <strong
                className={
                  viewStudentModal.standing_arrears > 0 ? 'text-rose-600' : 'text-emerald-600'
                }
              >
                {viewStudentModal.standing_arrears || 0}
              </strong>
            </div>

            {/* Resume button */}
            {viewStudentModal.resume_url ? (
              <a
                href={`http://localhost:5000${viewStudentModal.resume_url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                View & Download Resume PDF
              </a>
            ) : (
              <p className="text-xs text-center text-slate-400 italic">No resume uploaded</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
