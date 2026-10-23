import { useState, useEffect } from 'react';
import driveService from '../../services/driveService';
import companyService from '../../services/companyService';
import {
  Card,
  CardBody,
  Button,
  Modal,
  Badge,
  Skeleton,
} from '../../components/ui';
import {
  CalendarCheck2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_DEPTS = ['CSE', 'IT', 'AIDS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

export default function AdminDrives() {
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    company_id: '',
    job_title: '',
    job_description: '',
    location: '',
    employment_type: 'Full-time',
    package_lpa: '6.00',
    stipend_monthly: '0',
    drive_date: '',
    application_deadline: '',
    eligible_departments: ['CSE', 'IT', 'AIDS', 'ECE'],
    min_cgpa: '7.00',
    min_tenth_percentage: '65.00',
    min_twelfth_percentage: '65.00',
    max_standing_arrears: '0',
    max_history_arrears: '1',
    required_skills: 'Java, SQL, Data Structures',
    official_apply_link: '',
    instructions: '',
    status: 'published',
  });

  const [rounds, setRounds] = useState([
    { round_number: 1, round_name: 'Online Assessment (Aptitude & Coding)', description: 'MCQs and 2 coding questions' },
    { round_number: 2, round_name: 'Technical Interview', description: 'Problem solving and system architecture' },
    { round_number: 3, round_name: 'HR Interview', description: 'Culture fitment discussion' },
  ]);

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await driveService.getDrives({ search, limit: 50 });
      if (res.success) {
        setDrives(res.data);
      }
    } catch (err) {
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await companyService.getCompanies({ limit: 100 });
      if (res.success) {
        setCompanies(res.data);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleOpenAddModal = () => {
    setSelectedDrive(null);
    setFormData({
      company_id: companies[0]?.id || '',
      job_title: '',
      job_description: '',
      location: 'Chennai / Bengaluru',
      employment_type: 'Full-time',
      package_lpa: '6.50',
      stipend_monthly: '0',
      drive_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      application_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      eligible_departments: ['CSE', 'IT', 'AIDS', 'ECE'],
      min_cgpa: '7.00',
      min_tenth_percentage: '65.00',
      min_twelfth_percentage: '65.00',
      max_standing_arrears: '0',
      max_history_arrears: '1',
      required_skills: 'Java, SQL, Data Structures',
      official_apply_link: '',
      instructions: 'Please bring your college ID card and 2 copies of resume.',
      status: 'published',
    });
    setRounds([
      { round_number: 1, round_name: 'Online Assessment', description: 'Quantitative & coding evaluation' },
      { round_number: 2, round_name: 'Technical Interview', description: 'Core CS interview' },
      { round_number: 3, round_name: 'HR Discussion', description: 'Final round' },
    ]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (drive) => {
    setSelectedDrive(drive);
    setFormData({
      company_id: drive.company_id,
      job_title: drive.job_title || '',
      job_description: drive.job_description || '',
      location: drive.location || '',
      employment_type: drive.employment_type || 'Full-time',
      package_lpa: String(drive.package_lpa || '0'),
      stipend_monthly: String(drive.stipend_monthly || '0'),
      drive_date: drive.drive_date ? new Date(drive.drive_date).toISOString().split('T')[0] : '',
      application_deadline: drive.application_deadline ? new Date(drive.application_deadline).toISOString().slice(0, 16) : '',
      eligible_departments: drive.eligible_departments ? drive.eligible_departments.split(',').map((d) => d.trim()) : ['CSE'],
      min_cgpa: String(drive.min_cgpa || '0'),
      min_tenth_percentage: String(drive.min_tenth_percentage || '0'),
      min_twelfth_percentage: String(drive.min_twelfth_percentage || '0'),
      max_standing_arrears: String(drive.max_standing_arrears ?? '0'),
      max_history_arrears: String(drive.max_history_arrears ?? '0'),
      required_skills: drive.required_skills || '',
      official_apply_link: drive.official_apply_link || '',
      instructions: drive.instructions || '',
      status: drive.status || 'published',
    });

    // Fetch existing rounds for edit
    driveService.getDriveById(drive.id).then((res) => {
      if (res.success && res.data.rounds) {
        setRounds(res.data.rounds);
      }
    });

    setModalOpen(true);
  };

  const handleDeptToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.eligible_departments.includes(dept);
      return {
        ...prev,
        eligible_departments: exists
          ? prev.eligible_departments.filter((d) => d !== dept)
          : [...prev.eligible_departments, dept],
      };
    });
  };

  const handleAddRound = () => {
    setRounds([
      ...rounds,
      { round_number: rounds.length + 1, round_name: `Round ${rounds.length + 1}: Technical`, description: 'Technical round' },
    ]);
  };

  const handleRemoveRound = (idx) => {
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleSaveDrive = async (e) => {
    e.preventDefault();
    if (!formData.company_id || !formData.job_title || !formData.drive_date || !formData.application_deadline) {
      toast.error('Please complete all mandatory fields.');
      return;
    }

    const payload = {
      ...formData,
      eligible_departments: formData.eligible_departments.join(','),
      package_lpa: parseFloat(formData.package_lpa),
      stipend_monthly: parseFloat(formData.stipend_monthly),
      min_cgpa: parseFloat(formData.min_cgpa),
      min_tenth_percentage: parseFloat(formData.min_tenth_percentage),
      min_twelfth_percentage: parseFloat(formData.min_twelfth_percentage),
      max_standing_arrears: parseInt(formData.max_standing_arrears, 10),
      max_history_arrears: parseInt(formData.max_history_arrears, 10),
      rounds,
    };

    try {
      setSaving(true);
      if (selectedDrive) {
        await driveService.updateDrive(selectedDrive.id, payload);
        toast.success('Placement drive updated successfully!');
      } else {
        await driveService.createDrive(payload);
        toast.success('Placement drive created and published!');
      }
      setModalOpen(false);
      fetchDrives();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save drive.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDrive = async () => {
    if (!selectedDrive) return;
    try {
      setSaving(true);
      await driveService.deleteDrive(selectedDrive.id);
      toast.success('Drive removed successfully');
      setDeleteModalOpen(false);
      fetchDrives();
    } catch (err) {
      toast.error('Failed to delete drive.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarCheck2 className="w-6 h-6 text-primary" /> Placement Drives Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish recruitment schedules, set academic eligibility thresholds, and configure hiring rounds.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-600">
          <Plus className="w-4 h-4 mr-1.5" /> Create Placement Drive
        </Button>
      </div>

      {/* ─── Search ────────────────────────────────────────────── */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search drives by company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDrives()}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </Card>

      {/* ─── Drives Table ──────────────────────────────────────── */}
      <Card className="bg-slate-900 border-slate-800">
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Company & Role</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Eligible Branches</th>
                    <th className="px-4 py-3">Drive Date</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {drives && drives.length > 0 ? (
                    drives.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30 shrink-0">
                            {d.company_name.charAt(0)}
                          </div>
                          <div>
                            <span>{d.company_name}</span>
                            <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[200px]">
                              {d.job_title} ({d.employment_type})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-100">
                          ₹{d.package_lpa} LPA
                        </td>
                        <td className="px-4 py-4 text-slate-300 truncate max-w-[150px]">
                          {d.eligible_departments}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {new Date(d.drive_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-warning-400 font-mono text-[11px]">
                          {new Date(d.application_deadline).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <Badge status={d.status} />
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                            title="Edit Drive"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDrive(d);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition-colors"
                            title="Delete Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No placement drives found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── Add / Edit Placement Drive Modal ──────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDrive ? 'Edit Placement Drive' : 'Create New Placement Drive'}
        size="lg"
      >
        <form onSubmit={handleSaveDrive} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Row 1: Company & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Recruiting Company *
              </label>
              <select
                required
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Select Partner Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Job Title / Cadre *
              </label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g. Member Technical Staff"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 2: Location & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Job Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Chennai / Pan India"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Internship + PPO">Internship + PPO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Drive Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Row 3: Package & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Package (LPA) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.package_lpa}
                onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                placeholder="8.50"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Stipend / Month
              </label>
              <input
                type="number"
                value={formData.stipend_monthly}
                onChange={(e) => setFormData({ ...formData, stipend_monthly: e.target.value })}
                placeholder="25000"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Drive Date *
              </label>
              <input
                type="date"
                required
                value={formData.drive_date}
                onChange={(e) => setFormData({ ...formData, drive_date: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Row 4: Eligible Departments Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
              Eligible Departments *
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPTS.map((dept) => (
                <label
                  key={dept}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    formData.eligible_departments.includes(dept)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface text-secondary-700 border-border hover:bg-secondary-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.eligible_departments.includes(dept)}
                    onChange={() => handleDeptToggle(dept)}
                    className="hidden"
                  />
                  {dept}
                </label>
              ))}
            </div>
          </div>

          {/* Row 5: Academic Thresholds */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 bg-secondary-50/70 rounded-xl border border-border">
            <div>
              <label className="block text-[10px] font-bold text-secondary-700 uppercase">Min CGPA</label>
              <input
                type="number"
                step="0.01"
                value={formData.min_cgpa}
                onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary-700 uppercase">Min 10th %</label>
              <input
                type="number"
                step="0.01"
                value={formData.min_tenth_percentage}
                onChange={(e) => setFormData({ ...formData, min_tenth_percentage: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary-700 uppercase">Min 12th %</label>
              <input
                type="number"
                step="0.01"
                value={formData.min_twelfth_percentage}
                onChange={(e) => setFormData({ ...formData, min_twelfth_percentage: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary-700 uppercase">Max Standing</label>
              <input
                type="number"
                value={formData.max_standing_arrears}
                onChange={(e) => setFormData({ ...formData, max_standing_arrears: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary-700 uppercase">Max History</label>
              <input
                type="number"
                value={formData.max_history_arrears}
                onChange={(e) => setFormData({ ...formData, max_history_arrears: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-md text-xs"
              />
            </div>
          </div>

          {/* Job Description & Skills */}
          <div>
            <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              rows="3"
              required
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              placeholder="Responsibilities, technical stack, qualifications..."
              className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Required Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                placeholder="e.g. Java, C++, SQL, Algorithms"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Official Company Apply Link
              </label>
              <input
                type="url"
                value={formData.official_apply_link}
                onChange={(e) => setFormData({ ...formData, official_apply_link: e.target.value })}
                placeholder="https://company.com/apply/mts"
                className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Selection Rounds Manager */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-secondary-900 uppercase tracking-wider">
                Selection Process Rounds ({rounds.length})
              </label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRound}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Round
              </Button>
            </div>

            <div className="space-y-2">
              {rounds.map((r, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-secondary-50/80 rounded-lg border border-border">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Round Name (e.g. Technical Interview)"
                    value={r.round_name}
                    onChange={(e) => {
                      const updated = [...rounds];
                      updated[i].round_name = e.target.value;
                      setRounds(updated);
                    }}
                    className="flex-1 px-3 py-1 bg-surface border border-border rounded-md text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Round details..."
                    value={r.description || ''}
                    onChange={(e) => {
                      const updated = [...rounds];
                      updated[i].description = e.target.value;
                      setRounds(updated);
                    }}
                    className="flex-1 px-3 py-1 bg-surface border border-border rounded-md text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(i)}
                    className="p-1 text-muted hover:text-danger rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {selectedDrive ? 'Update Placement Drive' : 'Publish Placement Drive'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Drive Cancellation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-secondary-700 leading-relaxed">
            Are you sure you want to delete the placement drive for <strong>{selectedDrive?.company_name}</strong> ({selectedDrive?.job_title})?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={saving} onClick={handleDeleteDrive}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
