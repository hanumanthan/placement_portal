import { useState, useEffect } from 'react';
import { codingService } from '../../services/codingService';
import { Card, CardBody, Button, Badge, Skeleton, Tabs } from '../../components/ui';
import {
  Code2,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  Terminal,
  FileCode2,
  Sparkles,
  Layers,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export default function StudentCodingPractice() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');

  // Active coding question (IDE View)
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);

  // IDE Editor State
  const [language, setLanguage] = useState('c'); // 'c' or 'java'
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState('results'); // 'testcases', 'custom', 'results'
  const [leftTab, setLeftTab] = useState('description'); // 'description', 'submissions'
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    loadCategories();
    loadQuestions();
  }, [difficulty, category]);

  const loadCategories = async () => {
    try {
      const res = await codingService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await codingService.getQuestions({
        difficulty: difficulty || undefined,
        category: category || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setQuestions(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load coding questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadQuestions();
  };

  // Open a question in IDE mode
  const openProblem = async (qId) => {
    setQuestionLoading(true);
    try {
      const res = await codingService.getQuestionById(qId);
      if (res.success && res.data) {
        const q = res.data;
        setActiveQuestion(q);
        setLanguage('c');
        setCode(q.starter_c || '');
        setCustomInput(q.sample_input || '');
        setExecutionResult(null);
        setActiveConsoleTab('testcases');
        setLeftTab('description');
        loadProblemSubmissions(qId);
      }
    } catch (err) {
      toast.error('Failed to load problem statement.');
    } finally {
      setQuestionLoading(false);
    }
  };

  const loadProblemSubmissions = async (qId) => {
    setSubmissionsLoading(true);
    try {
      const res = await codingService.getSubmissions(qId);
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    if (newLang === language) return;
    setLanguage(newLang);
    if (newLang === 'c') {
      setCode(activeQuestion?.starter_c || '');
    } else if (newLang === 'java') {
      setCode(activeQuestion?.starter_java || '');
    }
    toast(`Switched to ${newLang.toUpperCase()} Compiler`, { icon: '💻' });
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template? Your unsaved changes will be lost.')) {
      if (language === 'c') {
        setCode(activeQuestion?.starter_c || '');
      } else {
        setCode(activeQuestion?.starter_java || '');
      }
      toast.success('Code reset to starter template.');
    }
  };

  // Tab key indenter support for Code Editor
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Run Code with Custom / Sample Input
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before running.');
      return;
    }

    setExecuting(true);
    setActiveConsoleTab('results');
    try {
      const inputToUse = activeConsoleTab === 'custom' ? customInput : activeQuestion?.sample_input || customInput;
      const res = await codingService.runCode({
        language,
        source_code: code,
        input: inputToUse,
      });

      if (res.success && res.data) {
        setExecutionResult({
          type: 'run',
          data: res.data,
          inputUsed: inputToUse,
        });
        if (res.data.status === 'Compile Error') {
          toast.error('Compilation Error!');
        } else if (res.data.status === 'Success') {
          toast.success('Code executed successfully!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution error');
    } finally {
      setExecuting(false);
    }
  };

  // Submit Code for Full Evaluation
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting.');
      return;
    }

    setExecuting(true);
    setActiveConsoleTab('results');
    try {
      const res = await codingService.submitCode(activeQuestion.id, {
        language,
        source_code: code,
      });

      if (res.success && res.data) {
        setExecutionResult({
          type: 'submit',
          data: res.data,
        });

        if (res.data.status === 'Accepted') {
          toast.success('🎉 Accepted! All test cases passed!');
          setActiveQuestion((prev) => ({ ...prev, is_solved: true }));
        } else if (res.data.status === 'Compile Error') {
          toast.error('Compilation Error');
        } else {
          toast.error(`${res.data.status}: ${res.data.passedCount}/${res.data.totalCount} passed`);
        }
        loadProblemSubmissions(activeQuestion.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation error');
    } finally {
      setExecuting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CATALOG VIEW
  // ───────────────────────────────────────────────────────────────────────────
  if (!activeQuestion) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-secondary-900 via-primary-950 to-secondary-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-primary-900/60">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold backdrop-blur-sm border border-primary-500/30">
                <Code2 className="w-3.5 h-3.5 text-primary-400" />
                Live C & Java Compiler Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Campus Coding Arena
              </h1>
              <p className="text-secondary-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Practice campus technical interview algorithmic challenges. Compile and evaluate your code in real-time using native <strong>C</strong> and <strong>Java</strong> execution environments.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/15 flex items-center gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-white">{total}</p>
                <p className="text-[11px] uppercase tracking-wider text-secondary-300">Challenges</p>
              </div>
              <div className="h-8 w-[1px] bg-white/20" />
              <div>
                <p className="text-2xl font-black text-emerald-400">
                  {questions.filter((q) => q.is_solved).length}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-secondary-300">Solved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <Card>
          <CardBody className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search coding problem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Topics</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Coding Questions List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Problem Title</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td colSpan="6" className="py-3.5 px-4">
                        <Skeleton className="w-full h-8" />
                      </td>
                    </tr>
                  ))
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-muted">
                      No coding problems found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-secondary-50/60 transition-colors cursor-pointer group"
                      onClick={() => openProblem(q.id)}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {q.is_solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-secondary-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-secondary-900 group-hover:text-primary transition-colors">
                        {q.title}
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
                      <td className="py-3.5 px-4 font-bold text-primary whitespace-nowrap">
                        +{q.points} pts
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant={q.is_solved ? 'outline' : 'primary'}
                          size="sm"
                          className="text-xs h-7 px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProblem(q.id);
                          }}
                        >
                          {q.is_solved ? 'Practice Again' : 'Solve'}
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INTERACTIVE IDE & COMPILER VIEW
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8 -mt-2">
      {/* Top Navbar Header */}
      <div className="flex items-center justify-between gap-4 p-3.5 bg-surface border border-border rounded-xl shadow-sm flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveQuestion(null)}
            className="text-xs h-8 px-2.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Problems
          </Button>

          <h2 className="font-bold text-base text-secondary-900 flex items-center gap-2">
            {activeQuestion.title}
          </h2>

          <Badge variant={DIFFICULTY_COLORS[activeQuestion.difficulty?.toLowerCase()] || 'secondary'} size="sm">
            {activeQuestion.difficulty?.toUpperCase()}
          </Badge>

          <span className="text-xs text-muted font-medium">+{activeQuestion.points} Points</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher - C and Java Only */}
          <div className="flex items-center rounded-lg border border-border bg-secondary-100 p-0.5">
            <button
              type="button"
              onClick={() => handleLanguageChange('c')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                language === 'c'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('java')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                language === 'java'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Java
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetCode}
            className="text-xs h-8 px-2 text-secondary-600"
            title="Reset to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={executing}
            onClick={handleRunCode}
            className="text-xs h-8 px-3 font-semibold"
          >
            <Play className="w-3 h-3 mr-1 text-emerald-600 fill-current" />
            {executing ? 'Compiling...' : 'Run Code'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={executing}
            onClick={handleSubmitCode}
            className="text-xs h-8 px-4 font-semibold"
          >
            <Send className="w-3 h-3 mr-1" />
            {executing ? 'Evaluating...' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Main Split Grid (Problem Details on Left, IDE & Console on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ─── LEFT PANE (Problem statement & Submissions) ─── */}
        <div className="lg:col-span-5 h-[calc(100vh-180px)] min-h-[550px] bg-surface rounded-xl border border-border flex flex-col overflow-hidden shadow-sm">
          {/* Tab buttons */}
          <div className="flex border-b border-border bg-secondary-50/70 px-3 pt-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLeftTab('description')}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                leftTab === 'description'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary-500 hover:text-secondary-800'
              }`}
            >
              Problem Statement
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('submissions')}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                leftTab === 'submissions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary-500 hover:text-secondary-800'
              }`}
            >
              My Submissions ({submissions.length})
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 text-xs text-secondary-800 space-y-5 leading-relaxed">
            {leftTab === 'description' ? (
              <>
                {/* Description */}
                <div className="space-y-2">
                  <p className="whitespace-pre-line text-sm text-secondary-900 font-normal leading-relaxed">
                    {activeQuestion.description}
                  </p>
                </div>

                {/* Input Format */}
                {activeQuestion.input_format && (
                  <div className="space-y-1 bg-secondary-50 p-3 rounded-lg border border-border">
                    <p className="font-bold text-secondary-900 uppercase tracking-wider text-[11px]">
                      Input Format
                    </p>
                    <p className="whitespace-pre-line text-secondary-700">{activeQuestion.input_format}</p>
                  </div>
                )}

                {/* Output Format */}
                {activeQuestion.output_format && (
                  <div className="space-y-1 bg-secondary-50 p-3 rounded-lg border border-border">
                    <p className="font-bold text-secondary-900 uppercase tracking-wider text-[11px]">
                      Output Format
                    </p>
                    <p className="whitespace-pre-line text-secondary-700">{activeQuestion.output_format}</p>
                  </div>
                )}

                {/* Constraints */}
                {activeQuestion.constraints && (
                  <div className="space-y-1">
                    <p className="font-bold text-secondary-900 uppercase tracking-wider text-[11px]">
                      Constraints
                    </p>
                    <pre className="bg-secondary-50 p-2.5 rounded-lg border border-border text-[11px] font-mono text-secondary-700 whitespace-pre-line">
                      {activeQuestion.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Input / Output */}
                {activeQuestion.sample_input && (
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-secondary-900 uppercase tracking-wider text-[11px] mb-1">
                        Sample Input
                      </p>
                      <pre className="bg-secondary-900 text-secondary-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                        {activeQuestion.sample_input}
                      </pre>
                    </div>

                    <div>
                      <p className="font-bold text-secondary-900 uppercase tracking-wider text-[11px] mb-1">
                        Sample Output
                      </p>
                      <pre className="bg-secondary-900 text-emerald-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                        {activeQuestion.sample_output}
                      </pre>
                    </div>

                    {activeQuestion.explanation && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                        <p className="font-bold mb-0.5">Explanation</p>
                        <p className="whitespace-pre-line">{activeQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Submissions History */
              <div className="space-y-3">
                {submissionsLoading ? (
                  <p className="text-center text-muted py-6">Loading submissions...</p>
                ) : submissions.length === 0 ? (
                  <p className="text-center text-muted py-8">
                    No submissions yet. Write code and hit "Submit" to test your solution!
                  </p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-lg border border-border bg-secondary-50/60 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              sub.status === 'Accepted'
                                ? 'success'
                                : sub.status === 'Compile Error'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {sub.status}
                          </Badge>
                          <span className="font-bold text-secondary-900 uppercase text-[11px]">
                            {sub.language}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted">
                          Test cases: {sub.passed_test_cases} / {sub.total_test_cases} • {sub.execution_time_ms}ms
                        </p>
                      </div>
                      <span className="text-[10px] text-muted">
                        {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANE (Code Editor & Output Console) ─── */}
        <div className="lg:col-span-7 h-[calc(100vh-180px)] min-h-[550px] flex flex-col gap-3">
          {/* Code Editor Box */}
          <div className="flex-1 bg-[#0F172A] rounded-xl border border-secondary-800 shadow-md flex flex-col overflow-hidden">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-secondary-800 bg-[#0B1120] text-xs text-secondary-400">
              <span className="font-mono text-secondary-300 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-primary-400" />
                {language === 'c' ? 'main.c' : 'Solution.java'}
              </span>
              <span className="text-[11px] text-secondary-500 font-mono">
                Tab: 4 spaces
              </span>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 relative flex">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                className="w-full h-full p-4 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 select-text overflow-y-auto"
                placeholder={
                  language === 'c'
                    ? '#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}'
                    : 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Code here\n    }\n}'
                }
              />
            </div>
          </div>

          {/* Console / Output Panel */}
          <div className="h-56 bg-surface rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
            {/* Console Tab Header */}
            <div className="flex items-center justify-between px-3 pt-2 border-b border-border bg-secondary-50/80">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveConsoleTab('results')}
                  className={`pb-1.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'results'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary-500 hover:text-secondary-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Execution Result
                </button>

                <button
                  type="button"
                  onClick={() => setActiveConsoleTab('custom')}
                  className={`pb-1.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeConsoleTab === 'custom'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary-500 hover:text-secondary-800'
                  }`}
                >
                  Custom Input
                </button>
              </div>

              {executionResult?.data?.executionTime && (
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {executionResult.data.executionTime}ms
                </span>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 p-3 overflow-y-auto text-xs font-mono">
              {activeConsoleTab === 'custom' ? (
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom stdin test input..."
                  className="w-full h-full p-2 bg-secondary-50 border border-border rounded-lg text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : executing ? (
                <div className="flex items-center justify-center h-full gap-2 text-secondary-600">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Compiling & executing in sandbox...</span>
                </div>
              ) : !executionResult ? (
                <div className="flex items-center justify-center h-full text-muted">
                  <span>Click "Run Code" to test or "Submit" to evaluate all test cases.</span>
                </div>
              ) : executionResult.type === 'run' ? (
                /* Run Code Single Output */
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        executionResult.data.status === 'Success'
                          ? 'success'
                          : executionResult.data.status === 'Compile Error'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {executionResult.data.status}
                    </Badge>
                  </div>

                  {executionResult.data.error && (
                    <div className="p-2.5 rounded bg-red-950/80 text-red-300 border border-red-800 whitespace-pre-wrap">
                      <p className="font-bold text-red-200 mb-1">Compiler / Diagnostic Output:</p>
                      {executionResult.data.error}
                    </div>
                  )}

                  {executionResult.data.output && (
                    <div className="p-2.5 rounded bg-[#0F172A] text-emerald-400 whitespace-pre-wrap">
                      <p className="text-secondary-400 text-[10px] uppercase font-bold mb-1">Standard Output:</p>
                      {executionResult.data.output}
                    </div>
                  )}
                </div>
              ) : (
                /* Full Test Cases Submit Results */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          executionResult.data.status === 'Accepted'
                            ? 'success'
                            : executionResult.data.status === 'Compile Error'
                            ? 'danger'
                            : 'warning'
                        }
                        size="md"
                      >
                        {executionResult.data.status}
                      </Badge>

                      <span className="font-bold text-secondary-900">
                        {executionResult.data.passedCount} / {executionResult.data.totalCount} Test Cases Passed
                      </span>
                    </div>
                  </div>

                  {executionResult.data.errorMessage && (
                    <div className="p-2.5 rounded bg-red-950/80 text-red-300 border border-red-800 whitespace-pre-wrap">
                      <p className="font-bold text-red-200 mb-1">Diagnostic Error:</p>
                      {executionResult.data.errorMessage}
                    </div>
                  )}

                  {/* Test Cases breakdown */}
                  {executionResult.data.testResults && (
                    <div className="space-y-1.5">
                      {executionResult.data.testResults.map((tr) => (
                        <div
                          key={tr.testCaseIndex}
                          className={`p-2 rounded border flex items-center justify-between text-[11px] ${
                            tr.passed
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-bold">
                            {tr.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            Test Case #{tr.testCaseIndex} {tr.isHidden ? '(Hidden)' : ''}
                          </span>

                          <span>{tr.passed ? 'PASSED' : 'WRONG ANSWER'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
