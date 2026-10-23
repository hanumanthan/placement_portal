import { useState, useEffect } from 'react';
import { experienceService } from '../../services/experienceService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  MessageSquareText,
  Search,
  Filter,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Lightbulb,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

const VERDICT_CONFIG = {
  Selected: { label: 'Selected', color: 'success', icon: CheckCircle2 },
  Offered: { label: 'Offered', color: 'success', icon: Award },
  Rejected: { label: 'Rejected', color: 'secondary', icon: XCircle },
  'In Progress': { label: 'In Progress', color: 'warning', icon: HelpCircle },
};

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export default function StudentExperiences() {
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

  // Dropdown options
  const [companies, setCompanies] = useState([]);

  // Expanded cards
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Detail Modal for reading deep
  const [selectedExp, setSelectedExp] = useState(null);

  useEffect(() => {
    loadFilterOptions();
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

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const res = await experienceService.getExperiences({
        company_id: companyId || undefined,
        verdict: verdict || undefined,
        difficulty: difficulty || undefined,
        search: search.trim() || undefined,
        page,
        limit: 8,
      });

      if (res.success && res.data) {
        setExperiences(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load interview experiences.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
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

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasActiveFilters = Boolean(search || companyId || verdict || difficulty);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Hero Header ─── */}
      <div className="bg-gradient-to-r from-primary-900 via-secondary-900 to-primary-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-primary-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold backdrop-blur-sm border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Seniors & Placed Alumni Insights
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interview Experiences & Debriefs
            </h1>
            <p className="text-secondary-300 text-sm max-w-2xl leading-relaxed">
              Learn the exact rounds, coding questions, and technical interview expectations from candidates who cracked top companies.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15">
            <div className="text-center px-2">
              <p className="text-2xl font-black text-white">{total}</p>
              <p className="text-[11px] uppercase tracking-wider text-secondary-300">Total Stories</p>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <div className="text-center px-2">
              <p className="text-2xl font-black text-emerald-400">
                {experiences.filter((e) => e.verdict === 'Selected' || e.verdict === 'Offered').length}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-secondary-300">Offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <Card>
        <CardBody className="p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search text */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search by role, author, questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-secondary-50 border border-border rounded-lg text-secondary-900 placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Company dropdown */}
              <div className="lg:col-span-3">
                <select
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">All Companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verdict filter */}
              <div className="lg:col-span-2">
                <select
                  value={verdict}
                  onChange={(e) => {
                    setVerdict(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">All Verdicts</option>
                  <option value="Selected">Selected</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Difficulty filter */}
              <div className="lg:col-span-2">
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Submit & Reset */}
              <div className="lg:col-span-1 flex items-center gap-1.5">
                <Button type="submit" variant="primary" className="w-full py-2 px-3 text-xs justify-center">
                  Filter
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted">
                <span>Active filters applied</span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-primary hover:underline font-medium"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* ─── Experience Cards ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="w-1/2 h-5" />
                    <Skeleton className="w-1/3 h-4" />
                  </div>
                </div>
                <Skeleton className="w-full h-20 rounded-lg" />
                <Skeleton className="w-1/4 h-8" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto text-secondary-500">
              <MessageSquareText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-secondary-900">No interview experiences found</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                No debriefs matched your search query or filters. Try relaxing filter criteria.
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {experiences.map((exp) => {
            const isExpanded = expandedIds.has(exp.id);
            const verdictInfo = VERDICT_CONFIG[exp.verdict] || {
              label: exp.verdict,
              color: 'secondary',
              icon: HelpCircle,
            };
            const VerdictIcon = verdictInfo.icon;

            return (
              <Card
                key={exp.id}
                className="hover:shadow-md transition-all duration-200 border-border/80 flex flex-col justify-between"
              >
                <CardBody className="p-5 sm:p-6 space-y-4 flex-1">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {exp.company_logo ? (
                        <img
                          src={exp.company_logo}
                          alt={exp.company_name}
                          className="w-11 h-11 rounded-xl object-contain border border-border p-1 bg-white"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 font-bold flex items-center justify-center border border-primary-100 text-lg">
                          {exp.company_name?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-secondary-900 text-base flex items-center gap-2">
                          {exp.role_title}
                        </h3>
                        <p className="text-xs text-muted font-medium flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="text-secondary-700 font-semibold">{exp.company_name}</span>
                          <span>•</span>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Batch {exp.batch_year}</span>
                        </p>
                      </div>
                    </div>

                    <Badge variant={verdictInfo.color} size="sm" className="flex items-center gap-1 shrink-0">
                      <VerdictIcon className="w-3 h-3" />
                      {verdictInfo.label}
                    </Badge>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" size="sm" className="bg-secondary-50">
                      <Layers className="w-3 h-3 mr-1 text-muted" />
                      {exp.rounds_count} Rounds
                    </Badge>
                    <Badge variant={DIFFICULTY_COLORS[exp.difficulty?.toLowerCase()] || 'secondary'} size="sm">
                      {exp.difficulty ? exp.difficulty.toUpperCase() : 'MEDIUM'}
                    </Badge>
                    <span className="text-xs text-muted flex items-center gap-1 ml-auto">
                      <User className="w-3.5 h-3.5" />
                      {exp.author_name}
                    </span>
                  </div>

                  {/* Preview Content */}
                  <div className="text-sm text-secondary-700 leading-relaxed bg-secondary-50/60 p-3.5 rounded-xl border border-secondary-100">
                    <p className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-3'}>
                      {exp.content}
                    </p>

                    {/* Tips Callout (if expanded) */}
                    {isExpanded && exp.tips && (
                      <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/70 rounded-lg text-amber-900 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          Advice & Tips for Aspirants:
                        </div>
                        <p className="whitespace-pre-line text-amber-950 font-normal pl-5">
                          {exp.tips}
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>

                {/* Footer Controls */}
                <div className="px-5 py-3 border-t border-border bg-secondary-50/40 rounded-b-xl flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => toggleExpand(exp.id)}
                    className="font-medium text-primary hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Read Full Story</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExp(exp)}
                    className="text-xs h-7 px-2.5 text-secondary-600 hover:text-secondary-900"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    Focus View
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
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

      {/* ─── Experience Focus Detail Modal ─── */}
      <Modal
        isOpen={Boolean(selectedExp)}
        onClose={() => setSelectedExp(null)}
        title={selectedExp ? `${selectedExp.company_name} • ${selectedExp.role_title}` : ''}
        size="lg"
      >
        {selectedExp && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-secondary-50 rounded-xl border border-border">
              <div className="space-y-1">
                <p className="text-xs text-muted font-medium">Candidate</p>
                <p className="text-sm font-bold text-secondary-900">{selectedExp.author_name}</p>
                <p className="text-xs text-muted">Batch {selectedExp.batch_year}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={VERDICT_CONFIG[selectedExp.verdict]?.color || 'secondary'}>
                  {selectedExp.verdict}
                </Badge>
                <Badge variant={DIFFICULTY_COLORS[selectedExp.difficulty?.toLowerCase()] || 'secondary'}>
                  {selectedExp.difficulty ? selectedExp.difficulty.toUpperCase() : 'MEDIUM'}
                </Badge>
                <Badge variant="outline">{selectedExp.rounds_count} Rounds</Badge>
              </div>
            </div>

            {/* Rounds / Experience Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Interview Rounds Breakdown
              </h4>
              <div className="p-4 bg-surface rounded-xl border border-border text-sm text-secondary-800 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto">
                {selectedExp.content}
              </div>
            </div>

            {/* Preparation Tips */}
            {selectedExp.tips && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Key Preparation Tips & Advice
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-line text-amber-900/90">
                  {selectedExp.tips}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedExp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
