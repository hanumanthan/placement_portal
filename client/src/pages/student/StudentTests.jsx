import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Play,
  RotateCcw,
  Search,
  Filter,
  BarChart2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { testService } from '../../services/testService';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Technical MCQ',
  'Company Specific',
];

const DIFFICULTY_CONFIG = {
  easy: { color: 'success', label: 'Easy' },
  medium: { color: 'warning', label: 'Medium' },
  hard: { color: 'danger', label: 'Hard' },
};

export default function StudentTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startingTestId, setStartingTestId] = useState(null);

  // Past Attempts Modal
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [selectedCategory, selectedDifficulty]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await testService.getAllTests({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        difficulty: selectedDifficulty || undefined,
      });
      if (res.success) {
        setTests(res.data);
      }
    } catch (err) {
      toast.error('Failed to load mock tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (test) => {
    try {
      setStartingTestId(test.id);
      const res = await testService.startTest(test.id);
      if (res.success) {
        toast.success(res.data.attempt.resumed ? 'Resuming test session...' : 'Test started! Good luck!');
        navigate(`/student/tests/taker/${res.data.attempt.attempt_id}`, {
          state: { test: res.data.test, attempt: res.data.attempt },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not start test');
    } finally {
      setStartingTestId(null);
    }
  };

  const handleOpenMyAttempts = async () => {
    try {
      setShowAttemptsModal(true);
      setLoadingAttempts(true);
      const res = await testService.getMyAttempts();
      if (res.success) {
        setMyAttempts(res.data);
      }
    } catch (err) {
      toast.error('Failed to load past attempts');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      t.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mock Aptitude Tests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Practice company-level aptitude, technical, and reasoning tests with timed assessments
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleOpenMyAttempts}
          className="flex items-center gap-2"
        >
          <BarChart2 className="w-4 h-4 text-primary" />
          My Test History
        </Button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <Card>
        <CardBody className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mock tests by name, topic, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy Level</option>
              <option value="medium">Medium Level</option>
              <option value="hard">Hard Level</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Tests Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-2">Loading mock tests...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No mock tests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try switching category filters or search terms to view available practice tests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const diffCfg = DIFFICULTY_CONFIG[test.difficulty] || {
              color: 'default',
              label: test.difficulty,
            };
            const hasAttempted = test.student_attempt_count > 0;
            const hasActiveAttempt = !!test.active_attempt_id;
            const bestScore = test.student_best_percentage;
            const isPassed = bestScore !== null && Number(bestScore) >= Number(test.pass_percentage);

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">
                      {test.category}
                    </span>
                    <Badge variant={diffCfg.color}>{diffCfg.label}</Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{test.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {test.description || 'Test your proficiency with standardized campus placement questions.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 py-3 px-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                      <span className="text-xs font-bold text-slate-800">{test.total_questions || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                      <span className="text-xs font-bold text-slate-800">{test.duration_minutes} mins</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pass Mark</span>
                      <span className="text-xs font-bold text-slate-800">{test.pass_percentage}%</span>
                    </div>
                  </div>

                  {/* Attempt status if any */}
                  {hasAttempted && (
                    <div className="mt-3.5 flex items-center justify-between p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Award className={`w-4 h-4 ${isPassed ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <span className="text-slate-600 font-medium">Best Score:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{bestScore}%</span>
                        <Badge variant={isPassed ? 'success' : 'danger'}>
                          {isPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{test.total_attempts} student(s) taken</span>
                  </div>

                  <Button
                    size="sm"
                    variant={hasActiveAttempt ? 'warning' : 'primary'}
                    onClick={() => handleStartTest(test)}
                    loading={startingTestId === test.id}
                    className="text-xs font-semibold shadow-sm"
                  >
                    {hasActiveAttempt ? (
                      <>
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Resume Test
                      </>
                    ) : hasAttempted ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Retake Test
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Start Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Attempts History Modal */}
      {showAttemptsModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAttemptsModal(false)}
          title="My Test Assessment History"
        >
          <div className="space-y-4">
            {loadingAttempts ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading attempt history...</p>
              </div>
            ) : myAttempts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No past test attempts found. Start your first mock test today!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {myAttempts.map((att) => {
                  const isPassed = Number(att.percentage) >= Number(att.pass_percentage);
                  return (
                    <div
                      key={att.id}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{att.test_title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{att.test_category}</span>
                          <span>&bull;</span>
                          <span>{new Date(att.started_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">
                            {att.score} / {att.test_total_marks || att.total_questions}
                          </div>
                          <Badge variant={isPassed ? 'success' : 'danger'}>
                            {att.percentage}% ({isPassed ? 'Pass' : 'Fail'})
                          </Badge>
                        </div>
                        {att.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setShowAttemptsModal(false);
                              navigate(`/student/tests/results/${att.id}`);
                            }}
                            className="text-xs px-2.5 py-1"
                          >
                            Solutions
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
