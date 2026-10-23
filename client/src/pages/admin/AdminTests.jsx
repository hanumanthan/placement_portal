import { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  BarChart2,
  Layers,
  Clock,
  Award,
  Search,
  BookOpen,
  Check,
  AlertCircle,
} from 'lucide-react';
import { testService } from '../../services/testService';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'General Aptitude',
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Technical MCQ',
  'Company Specific',
];

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create / Edit Test Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    category: 'General Aptitude',
    duration_minutes: 30,
    total_marks: 30,
    pass_percentage: 60,
    difficulty: 'medium',
    max_attempts: 1,
    is_published: true,
  });
  const [savingTest, setSavingTest] = useState(false);

  // Manage Questions Modal
  const [manageQuestionsTest, setManageQuestionsTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1,
    category: 'Aptitude',
    explanation: '',
  });
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Leaderboard / Stats Modal
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [currentTestStats, setCurrentTestStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [categoryFilter]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await testService.getAllTests({
        category: categoryFilter || undefined,
      });
      if (res.success) {
        setTests(res.data);
      }
    } catch (err) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateTest = () => {
    setEditingTest(null);
    setTestForm({
      title: '',
      description: '',
      category: 'General Aptitude',
      duration_minutes: 30,
      total_marks: 30,
      pass_percentage: 60,
      difficulty: 'medium',
      max_attempts: 1,
      is_published: true,
    });
    setTestModalOpen(true);
  };

  const handleOpenEditTest = (t) => {
    setEditingTest(t);
    setTestForm({
      title: t.title,
      description: t.description || '',
      category: t.category,
      duration_minutes: t.duration_minutes,
      total_marks: t.total_marks,
      pass_percentage: t.pass_percentage,
      difficulty: t.difficulty,
      max_attempts: t.max_attempts,
      is_published: !!t.is_published,
    });
    setTestModalOpen(true);
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      setSavingTest(true);
      if (editingTest) {
        const res = await testService.updateTest(editingTest.id, testForm);
        if (res.success) {
          toast.success('Test updated successfully');
        }
      } else {
        const res = await testService.createTest(testForm);
        if (res.success) {
          toast.success('Test created successfully');
        }
      }
      setTestModalOpen(false);
      fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test');
    } finally {
      setSavingTest(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test and all its questions/attempts?')) {
      return;
    }
    try {
      const res = await testService.deleteTest(id);
      if (res.success) {
        toast.success('Test deleted successfully');
        fetchTests();
      }
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  const handleTogglePublish = async (test) => {
    try {
      const res = await testService.updateTest(test.id, {
        is_published: !test.is_published,
      });
      if (res.success) {
        toast.success(`Test ${!test.is_published ? 'Published' : 'Unpublished'}`);
        fetchTests();
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // Manage Questions Handlers
  const handleOpenManageQuestions = async (test) => {
    setManageQuestionsTest(test);
    try {
      setLoadingQuestions(true);
      const res = await testService.getTestById(test.id);
      if (res.success) {
        setTestQuestions(res.data.questions || []);
      }
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      marks: 1,
      category: manageQuestionsTest.category || 'Aptitude',
      explanation: '',
    });
    setQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      marks: q.marks || 1,
      category: q.category || 'Aptitude',
      explanation: q.explanation || '',
    });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      setSavingQuestion(true);
      if (editingQuestion) {
        await testService.updateQuestion(editingQuestion.id, questionForm);
        toast.success('Question updated');
      } else {
        await testService.addQuestion(manageQuestionsTest.id, questionForm);
        toast.success('Question added');
      }
      setQuestionModalOpen(false);
      handleOpenManageQuestions(manageQuestionsTest);
      fetchTests();
    } catch (err) {
      toast.error('Failed to save question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await testService.deleteQuestion(qId);
      toast.success('Question removed');
      handleOpenManageQuestions(manageQuestionsTest);
      fetchTests();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  // Stats / Leaderboard
  const handleOpenStats = async (test) => {
    try {
      setStatsModalOpen(true);
      setLoadingStats(true);
      const res = await testService.getTestStats(test.id);
      if (res.success) {
        setCurrentTestStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load test stats');
    } finally {
      setLoadingStats(false);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mock Tests & Assessment Builder
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create online assessments, manage MCQ banks, and evaluate student performance
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreateTest}
          className="flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Mock Test
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardBody className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 mt-2">Loading mock tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="py-16 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-medium text-slate-700">No mock tests available</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "Create Mock Test" to publish your first assessment
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Test Title & Category</th>
                  <th className="py-3.5 px-4">Duration & Marks</th>
                  <th className="py-3.5 px-4">Questions</th>
                  <th className="py-3.5 px-4">Attempts</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{test.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {test.category}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">&bull; {test.difficulty}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {test.duration_minutes} mins | {test.total_marks} marks
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Pass: {test.pass_percentage}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                        <Layers className="w-3.5 h-3.5" />
                        {test.total_questions || 0} Questions
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenStats(test)}
                        className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-primary" />
                        {test.total_attempts} completed
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(test)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          test.is_published
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {test.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenManageQuestions(test)}
                          className="text-xs px-2.5 py-1"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-primary" />
                          Questions
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenEditTest(test)}
                          className="text-xs px-2.5 py-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Create / Edit Test Modal */}
      {testModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setTestModalOpen(false)}
          title={editingTest ? 'Edit Mock Test' : 'Create New Mock Test'}
        >
          <form onSubmit={handleSaveTest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Test Title *
              </label>
              <input
                type="text"
                required
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                placeholder="e.g., TCS NQT Quantitative Aptitude Mock 1"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows="2"
                value={testForm.description}
                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                placeholder="Brief guidelines or instructions for candidates"
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={testForm.category}
                  onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={testForm.difficulty}
                  onChange={(e) => setTestForm({ ...testForm, difficulty: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  required
                  value={testForm.duration_minutes}
                  onChange={(e) =>
                    setTestForm({ ...testForm, duration_minutes: Number(e.target.value) })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pass Mark %
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={testForm.pass_percentage}
                  onChange={(e) =>
                    setTestForm({ ...testForm, pass_percentage: Number(e.target.value) })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={testForm.max_attempts}
                  onChange={(e) =>
                    setTestForm({ ...testForm, max_attempts: Number(e.target.value) })
                  }
                  title="0 for unlimited"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_published"
                checked={testForm.is_published}
                onChange={(e) => setTestForm({ ...testForm, is_published: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="is_published" className="text-xs font-medium text-slate-700">
                Publish immediately (visible to students in catalog)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setTestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingTest}>
                {editingTest ? 'Save Changes' : 'Create Test'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Questions Modal */}
      {manageQuestionsTest && (
        <Modal
          isOpen={true}
          onClose={() => setManageQuestionsTest(null)}
          title={`Manage Questions: ${manageQuestionsTest.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Total Questions: {testQuestions.length}
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={handleOpenAddQuestion}
                className="text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question
              </Button>
            </div>

            {loadingQuestions ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading questions...</p>
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No questions added to this test yet. Click "Add Question" above.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {testQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-slate-900 flex items-start gap-2">
                        <span className="bg-white border px-1.5 py-0.5 rounded text-primary">
                          #{idx + 1}
                        </span>
                        <span>{q.question_text}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1 hover:bg-white text-slate-500 rounded border border-transparent hover:border-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const isCorrect = q.correct_option?.toUpperCase() === opt;
                        const optText = q[`option_${opt.toLowerCase()}`];
                        return (
                          <div
                            key={opt}
                            className={`p-2 rounded-lg border flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>
                              <strong>{opt}:</strong> {optText}
                            </span>
                            {isCorrect && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 bg-white/70 p-2 rounded border border-slate-200/60">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add / Edit Question Sub-Modal */}
      {questionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setQuestionModalOpen(false)}
          title={editingQuestion ? 'Edit MCQ Question' : 'Add MCQ Question'}
        >
          <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Question Text / Problem Statement *
              </label>
              <textarea
                required
                rows="3"
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, question_text: e.target.value })
                }
                placeholder="Enter complete question statement..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Option A *</label>
                <input
                  type="text"
                  required
                  value={questionForm.option_a}
                  onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Option B *</label>
                <input
                  type="text"
                  required
                  value={questionForm.option_b}
                  onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Option C *</label>
                <input
                  type="text"
                  required
                  value={questionForm.option_c}
                  onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Option D *</label>
                <input
                  type="text"
                  required
                  value={questionForm.option_d}
                  onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correct Answer Option *
                </label>
                <select
                  value={questionForm.correct_option}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, correct_option: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-bold"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marks</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={questionForm.marks}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, marks: Number(e.target.value) })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Explanation / Steps (Shown after submission)
              </label>
              <textarea
                rows="2"
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, explanation: e.target.value })
                }
                placeholder="Formulas, logic, or hints..."
                className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setQuestionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingQuestion}>
                Save Question
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Leaderboard / Assessment Stats Modal */}
      {statsModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setStatsModalOpen(false)}
          title="Test Performance & Results Leaderboard"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4 text-xs">
            {loadingStats || !currentTestStats ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading stats...</p>
              </div>
            ) : (
              <>
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 block font-medium">Total Attempts</span>
                    <span className="text-lg font-bold text-slate-900">
                      {currentTestStats.total_attempts}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                    <span className="text-blue-600 block font-medium">Average Score</span>
                    <span className="text-lg font-bold text-blue-900">
                      {currentTestStats.average_score} / {currentTestStats.test.total_marks}
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                    <span className="text-emerald-600 block font-medium">Pass Rate</span>
                    <span className="text-lg font-bold text-emerald-900">
                      {currentTestStats.pass_rate}% ({currentTestStats.pass_count} students)
                    </span>
                  </div>
                </div>

                {/* Candidate Leaderboard Table */}
                {currentTestStats.leaderboard.length === 0 ? (
                  <p className="text-center text-slate-400 py-6">No attempts recorded yet</p>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] text-slate-600 font-semibold uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Student</th>
                          <th className="py-2.5 px-3">Branch</th>
                          <th className="py-2.5 px-3">Score</th>
                          <th className="py-2.5 px-3">Result</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentTestStats.leaderboard.map((att, index) => {
                          const isPass =
                            Number(att.percentage) >=
                            Number(currentTestStats.test.pass_percentage);
                          return (
                            <tr key={att.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                #{index + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">
                                  {att.first_name} {att.last_name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {att.register_number}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">
                                {att.department}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                {att.score} ({att.percentage}%)
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge variant={isPass ? 'success' : 'danger'}>
                                  {isPass ? 'Pass' : 'Fail'}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">
                                {new Date(att.submitted_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
