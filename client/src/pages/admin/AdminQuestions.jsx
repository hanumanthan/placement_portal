import { useState, useEffect } from 'react';
import { questionService } from '../../services/questionService';
import { companyService } from '../../services/companyService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Building2,
  Layers,
  Sparkles,
  CheckCircle,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Aptitude', 'Technical', 'Verbal', 'Coding', 'Logical Reasoning'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export default function AdminQuestions() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Dropdown data
  const [filterOptions, setFilterOptions] = useState({ companies: [], years: [], categories: [] });
  const [allCompanies, setAllCompanies] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_id: '',
    year: new Date().getFullYear(),
    category: 'Technical',
    difficulty: 'medium',
    question_text: '',
    options: '',
    correct_answer: '',
    explanation: '',
  });

  useEffect(() => {
    loadFilterOptions();
    loadAllCompanies();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [page, companyId, category, year, difficulty]);

  const loadFilterOptions = async () => {
    try {
      const res = await questionService.getFilterOptions();
      if (res.success && res.data) {
        setFilterOptions(res.data);
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

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionService.getQuestions({
        company_id: companyId || undefined,
        category: category || undefined,
        year: year || undefined,
        difficulty: difficulty || undefined,
        search: search.trim() || undefined,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setQuestions(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCompanyId('');
    setCategory('');
    setYear('');
    setDifficulty('');
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      company_id: allCompanies[0]?.id || '',
      year: new Date().getFullYear(),
      category: 'Technical',
      difficulty: 'medium',
      question_text: '',
      options: '',
      correct_answer: '',
      explanation: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingId(q.id);
    let optionsStr = '';
    if (q.options) {
      if (Array.isArray(q.options)) {
        optionsStr = q.options.join('\n');
      } else if (typeof q.options === 'string') {
        try {
          const parsed = JSON.parse(q.options);
          optionsStr = Array.isArray(parsed) ? parsed.join('\n') : q.options;
        } catch {
          optionsStr = q.options;
        }
      }
    }

    setFormData({
      company_id: q.company_id || '',
      year: q.year || new Date().getFullYear(),
      category: q.category || 'Technical',
      difficulty: q.difficulty || 'medium',
      question_text: q.question_text || '',
      options: optionsStr,
      correct_answer: q.correct_answer || '',
      explanation: q.explanation || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      toast.error('Question text is required.');
      return;
    }
    if (!formData.company_id) {
      toast.error('Please select a company.');
      return;
    }

    setSubmitting(true);
    try {
      // Process options if multi-line
      let formattedOptions = null;
      if (formData.options.trim()) {
        const lines = formData.options
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        formattedOptions = lines.length > 0 ? JSON.stringify(lines) : null;
      }

      const payload = {
        company_id: parseInt(formData.company_id, 10),
        year: parseInt(formData.year, 10),
        category: formData.category,
        difficulty: formData.difficulty,
        question_text: formData.question_text.trim(),
        options: formattedOptions,
        correct_answer: formData.correct_answer.trim() || null,
        explanation: formData.explanation.trim() || null,
      };

      if (editingId) {
        const res = await questionService.updateQuestion(editingId, payload);
        if (res.success) {
          toast.success('Question updated successfully!');
          setModalOpen(false);
          loadQuestions();
          loadFilterOptions();
        }
      } else {
        const res = await questionService.createQuestion(payload);
        if (res.success) {
          toast.success('Question added successfully!');
          setModalOpen(false);
          loadQuestions();
          loadFilterOptions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this previous question?')) return;
    try {
      const res = await questionService.deleteQuestion(id);
      if (res.success) {
        toast.success('Question deleted successfully.');
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error('Failed to delete question.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Previous Placement Questions
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Maintain real past assessment questions by company, category, and recruitment year.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Question
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardBody className="p-4 space-y-3">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4 relative">
              <input
                type="text"
                placeholder="Search question text or explanation..."
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
                {filterOptions.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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

          {(search || companyId || category || year || difficulty) && (
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

      {/* Questions Table / List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Company & Year</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Question Preview</th>
                <th className="py-3 px-4">Answer / Explanation</th>
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
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted">
                    No questions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-secondary-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-secondary-900">{q.company_name}</div>
                      <div className="text-[11px] text-muted">{q.year} Placement Drive</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" size="sm">
                        {q.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={DIFFICULTY_COLORS[q.difficulty?.toLowerCase()] || 'secondary'} size="sm">
                        {q.difficulty?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-secondary-800 font-medium">{q.question_text}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {q.correct_answer ? (
                        <div className="text-emerald-700 font-semibold line-clamp-1">
                          Ans: {q.correct_answer}
                        </div>
                      ) : (
                        <span className="text-muted italic">No direct answer</span>
                      )}
                      {q.explanation && (
                        <div className="text-[11px] text-muted line-clamp-1">{q.explanation}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(q)}
                          className="h-7 w-7 p-0 text-secondary-600 hover:text-secondary-900"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(q.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
            <span className="font-semibold text-secondary-900">{totalPages}</span> ({total} questions)
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
        title={editingId ? 'Edit Previous Question' : 'Add New Previous Question'}
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
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Drive Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                min="2015"
                max="2030"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Question Text *
            </label>
            <textarea
              rows={4}
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              required
              placeholder="Enter full question or problem statement..."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Options (Optional - One per line for MCQ)
            </label>
            <textarea
              rows={3}
              value={formData.options}
              onChange={(e) => setFormData({ ...formData, options: e.target.value })}
              placeholder={'Option A\nOption B\nOption C\nOption D'}
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Correct Answer (Optional)
              </label>
              <input
                type="text"
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                placeholder="e.g. O(log N) or Option B"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Explanation / Solution Note (Optional)
              </label>
              <input
                type="text"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Brief reason or derivation steps"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Question' : 'Create Question'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
