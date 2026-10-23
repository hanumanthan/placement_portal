import { useState, useEffect } from 'react';
import { questionService } from '../../services/questionService';
import { Card, CardBody, Button, Badge, Skeleton } from '../../components/ui';
import {
  HelpCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

const CATEGORY_ICONS = {
  Aptitude: '🧮',
  Technical: '💻',
  Verbal: '📝',
  Coding: '🖥️',
  'Logical Reasoning': '🧠',
};

export default function StudentQuestions() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({ companies: [], years: [], categories: [] });

  // Practice mode: track revealed answers
  const [revealedIds, setRevealedIds] = useState(new Set());

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [page, companyId, year, category, difficulty]);

  const loadFilterOptions = async () => {
    try {
      const res = await questionService.getFilterOptions();
      if (res.success) {
        setFilterOptions(res.data);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionService.getQuestions({
        search: search || undefined,
        company_id: companyId || undefined,
        year: year || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        page,
        limit: 10,
      });

      if (res.success) {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCompanyId('');
    setYear('');
    setCategory('');
    setDifficulty('');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-secondary-900 tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-7 h-7 text-primary" />
          Company Previous Questions
        </h1>
        <p className="text-sm text-secondary-500">
          Practice real questions asked by top recruiters in campus placement drives. Click "Reveal Answer" to study solutions.
        </p>
      </div>

      {/* ─── Search & Filters ────────────────────────────────────────── */}
      <Card className="border-border">
        <CardBody className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search question text or explanation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <Button variant="primary" size="sm" type="submit">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-secondary-500 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              Filters:
            </div>

            <select
              value={companyId}
              onChange={(e) => { setCompanyId(e.target.value); setPage(1); }}
              className="input py-1.5 text-xs w-44"
            >
              <option value="">All Companies</option>
              {filterOptions.companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              className="input py-1.5 text-xs w-28"
            >
              <option value="">All Years</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="input py-1.5 text-xs w-40"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="input py-1.5 text-xs w-28"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {(companyId || year || category || difficulty || search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-primary hover:underline cursor-pointer font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ─── Results Count ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-500 font-medium">
          Showing {questions.length} of {total} questions
        </p>
      </div>

      {/* ─── Question Cards ──────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card className="border-border">
          <CardBody className="py-16 text-center">
            <HelpCircle className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="text-base font-semibold text-secondary-900">No questions found</h3>
            <p className="text-xs text-secondary-500 mt-1">
              Try adjusting your search or filter criteria.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isRevealed = revealedIds.has(q.id);
            const globalIndex = (page - 1) * 10 + idx + 1;

            return (
              <Card key={q.id} className="border-border hover:shadow-card-hover transition-shadow duration-150">
                <CardBody className="p-5 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                        {globalIndex}
                      </span>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-700 bg-secondary-100 px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3 text-muted" />
                          {q.company_name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-secondary-500">
                          <Calendar className="w-3 h-3" />
                          {q.year}
                        </span>
                        <Badge variant={DIFFICULTY_COLORS[q.difficulty] || 'muted'}>
                          {q.difficulty}
                        </Badge>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-medium">
                          {CATEGORY_ICONS[q.category] || '📋'} {q.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="bg-secondary-50 rounded-xl p-4 border border-border/60">
                    <p className="text-sm text-secondary-900 font-medium leading-relaxed whitespace-pre-line">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Options (if stored as JSON or text) */}
                  {q.options && (
                    <div className="text-xs text-secondary-700 pl-2 space-y-1">
                      {q.options.split('\n').filter(Boolean).map((opt, oi) => (
                        <div key={oi} className="flex items-start gap-2">
                          <span className="text-muted font-bold shrink-0">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reveal / Hide Answer Button */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => toggleReveal(q.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-700 cursor-pointer transition-colors"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide Answer & Explanation
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Reveal Answer & Explanation
                        </>
                      )}
                    </button>
                  </div>

                  {/* Revealed Answer + Explanation */}
                  {isRevealed && (
                    <div className="space-y-3 bg-success-50/40 border border-success-200/60 rounded-xl p-4 animate-in">
                      {q.correct_answer && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success shrink-0" />
                          <span className="text-sm font-bold text-success-800">
                            Correct Answer: {q.correct_answer}
                          </span>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="text-sm text-secondary-800 leading-relaxed whitespace-pre-line">
                          <span className="font-semibold text-secondary-900 block mb-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-secondary-600 font-medium px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
