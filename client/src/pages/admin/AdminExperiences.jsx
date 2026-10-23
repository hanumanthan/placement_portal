import { useState, useEffect } from 'react';
import { experienceService } from '../../services/experienceService';
import { companyService } from '../../services/companyService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  MessageSquareText,
  Plus,
  Trash2,
  Edit3,
  Search,
  Building2,
  CheckCircle2,
  Award,
  XCircle,
  HelpCircle,
  User,
  Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';

const VERDICT_CONFIG = {
  Selected: { label: 'Selected', color: 'success', icon: CheckCircle2 },
  Offered: { label: 'Offered', color: 'success', icon: Award },
  Rejected: { label: 'Rejected', color: 'secondary', icon: XCircle },
  'In Progress': { label: 'In Progress', color: 'warning', icon: HelpCircle },
};

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export default function AdminExperiences() {
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [verdict, setVerdict] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Dropdown data
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_id: '',
    author_name: '',
    role_title: '',
    batch_year: new Date().getFullYear(),
    verdict: 'Selected',
    difficulty: 'medium',
    rounds_count: 3,
    content: '',
    tips: '',
  });

  useEffect(() => {
    loadFilterOptions();
    loadAllCompanies();
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [page, companyId, verdict, difficulty]);

  const loadFilterOptions = async () => {
    try {
      const res = await experienceService.getFilterOptions();
      if (res.success && res.data) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadAllCompanies = async () => {
    try {
      const res = await companyService.getCompanies({ limit: 100 });
      if (res.success && res.data) {
        setAllCompanies(res.data.companies || res.data.items || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load all companies:', err);
    }
  };

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const res = await experienceService.getExperiences({
        company_id: companyId || undefined,
        verdict: verdict || undefined,
        difficulty: difficulty || undefined,
        search: search.trim() || undefined,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setExperiences(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load experiences.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadExperiences();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCompanyId('');
    setVerdict('');
    setDifficulty('');
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      company_id: allCompanies[0]?.id || '',
      author_name: '',
      role_title: '',
      batch_year: new Date().getFullYear(),
      verdict: 'Selected',
      difficulty: 'medium',
      rounds_count: 3,
      content: '',
      tips: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingId(exp.id);
    setFormData({
      company_id: exp.company_id || '',
      author_name: exp.author_name || '',
      role_title: exp.role_title || '',
      batch_year: exp.batch_year || new Date().getFullYear(),
      verdict: exp.verdict || 'Selected',
      difficulty: exp.difficulty || 'medium',
      rounds_count: exp.rounds_count || 3,
      content: exp.content || '',
      tips: exp.tips || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_id) {
      toast.error('Please select a company.');
      return;
    }
    if (!formData.author_name.trim()) {
      toast.error('Author name is required.');
      return;
    }
    if (!formData.role_title.trim()) {
      toast.error('Role title is required.');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Experience content is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company_id: parseInt(formData.company_id, 10),
        author_name: formData.author_name.trim(),
        role_title: formData.role_title.trim(),
        batch_year: parseInt(formData.batch_year, 10),
        verdict: formData.verdict,
        difficulty: formData.difficulty,
        rounds_count: parseInt(formData.rounds_count, 10),
        content: formData.content.trim(),
        tips: formData.tips.trim() || null,
      };

      if (editingId) {
        const res = await experienceService.updateExperience(editingId, payload);
        if (res.success) {
          toast.success('Interview experience updated!');
          setModalOpen(false);
          loadExperiences();
          loadFilterOptions();
        }
      } else {
        const res = await experienceService.createExperience(payload);
        if (res.success) {
          toast.success('Interview experience created!');
          setModalOpen(false);
          loadExperiences();
          loadFilterOptions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save experience.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview experience?')) return;
    try {
      const res = await experienceService.deleteExperience(id);
      if (res.success) {
        toast.success('Experience deleted successfully.');
        setExperiences((prev) => prev.filter((e) => e.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error('Failed to delete experience.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Interview Experiences Management
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Curate and manage alumni interview stories, round breakdowns, and preparation advice.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Experience
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardBody className="p-4 space-y-3">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4 relative">
              <input
                type="text"
                placeholder="Search by author, role, tips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="lg:col-span-3">
              <select
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={verdict}
                onChange={(e) => {
                  setVerdict(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Verdicts</option>
                <option value="Selected">Selected</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1 flex items-center">
              <Button type="submit" variant="primary" className="w-full py-1.5 text-xs justify-center">
                Filter
              </Button>
            </div>
          </form>

          {(search || companyId || verdict || difficulty) && (
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted">
              <span>Active filters applied</span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-primary hover:underline font-medium"
              >
                Reset filters
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Experiences Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Candidate & Batch</th>
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Rounds & Difficulty</th>
                <th className="py-3 px-4">Experience Content Preview</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan="6" className="py-3 px-4">
                      <Skeleton className="w-full h-8" />
                    </td>
                  </tr>
                ))
              ) : experiences.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted">
                    No interview experiences found matching your filters.
                  </td>
                </tr>
              ) : (
                experiences.map((exp) => {
                  const verdictInfo = VERDICT_CONFIG[exp.verdict] || {
                    label: exp.verdict,
                    color: 'secondary',
                  };

                  return (
                    <tr key={exp.id} className="hover:bg-secondary-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-secondary-900">{exp.author_name}</div>
                        <div className="text-[11px] text-muted">Batch {exp.batch_year}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-secondary-900">{exp.role_title}</div>
                        <div className="text-[11px] text-muted font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {exp.company_name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={verdictInfo.color} size="sm">
                          {verdictInfo.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" size="sm">
                            {exp.rounds_count} Rounds
                          </Badge>
                          <Badge variant={DIFFICULTY_COLORS[exp.difficulty?.toLowerCase()] || 'secondary'} size="sm">
                            {exp.difficulty?.toUpperCase()}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-secondary-700">{exp.content}</p>
                        {exp.tips && (
                          <div className="text-[11px] text-amber-700 font-medium line-clamp-1 mt-0.5 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                            {exp.tips}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(exp)}
                            className="h-7 w-7 p-0 text-secondary-600 hover:text-secondary-900"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exp.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">
            Showing Page <span className="font-semibold text-secondary-900">{page}</span> of{' '}
            <span className="font-semibold text-secondary-900">{totalPages}</span> ({total} experiences)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Interview Experience' : 'Add New Interview Experience'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Company *</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Company</option>
                {allCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Candidate / Author Name *</label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                required
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Role Title *</label>
              <input
                type="text"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                required
                placeholder="e.g. Software Development Engineer - I"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Batch Year *</label>
              <input
                type="number"
                value={formData.batch_year}
                onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                required
                min="2018"
                max="2030"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Verdict *</label>
              <select
                value={formData.verdict}
                onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Selected">Selected</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Rounds Count *</label>
              <input
                type="number"
                value={formData.rounds_count}
                onChange={(e) => setFormData({ ...formData, rounds_count: e.target.value })}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Interview Experience & Rounds Story *
            </label>
            <textarea
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              placeholder="Round 1 (OA): 2 coding problems on arrays & graphs...&#10;Round 2 (Tech): System design and DSA...&#10;Round 3 (HR): Cultural fit..."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Preparation Tips & Advice (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Focus on Striver's SDE sheet for Round 2, brush up OOP fundamentals and resume projects thoroughly."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Experience' : 'Create Experience'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
