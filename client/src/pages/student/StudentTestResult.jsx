import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Target,
  FileCheck,
} from 'lucide-react';
import { testService } from '../../services/testService';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function StudentTestResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'correct', 'incorrect', 'skipped'
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await testService.getAttemptResult(attemptId);
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      toast.error('Failed to load test scorecard');
      navigate('/student/tests');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (qId) => {
    setExpandedQuestions((prev) => {
      const copy = new Set(prev);
      if (copy.has(qId)) {
        copy.delete(qId);
      } else {
        copy.add(qId);
      }
      return copy;
    });
  };

  const expandAll = () => {
    if (expandedQuestions.size === result.questions.length) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(result.questions.map((q) => q.id)));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Calculating your performance metrics...</p>
      </div>
    );
  }

  if (!result) return null;

  const isPassed = Number(result.percentage) >= Number(result.pass_percentage);
  const totalQ = result.total_questions || result.questions.length;
  const correctQ = result.correct_answers || result.questions.filter((q) => q.is_correct).length;
  const skippedQ =
    result.skipped_answers !== undefined
      ? result.skipped_answers
      : result.questions.filter((q) => !q.selected_option).length;
  const wrongQ = totalQ - correctQ - skippedQ;
  const accuracy = totalQ - skippedQ > 0 ? ((correctQ / (totalQ - skippedQ)) * 100).toFixed(1) : 0;

  const filteredQuestions = (result.questions || []).filter((q) => {
    if (filterTab === 'correct') return q.is_correct;
    if (filterTab === 'incorrect') return q.selected_option && !q.is_correct;
    if (filterTab === 'skipped') return !q.selected_option;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/tests"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mock Tests
        </Link>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate('/student/tests')}
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Explore More Tests
        </Button>
      </div>

      {/* Main Score Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-slate-800 to-slate-900'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5" />
              {isPassed ? 'Assessment Qualified' : 'Needs Practice'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {result.test_title}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Submitted on {new Date(result.submitted_at || result.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <span className="text-xs text-white/70 block uppercase font-medium">Score</span>
              <span className="text-3xl sm:text-4xl font-black">
                {result.score}
                <span className="text-lg font-normal text-white/70">
                  /{result.test_total_marks || totalQ}
                </span>
              </span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-xs text-white/70 block uppercase font-medium">Percentage</span>
              <span className="text-3xl sm:text-4xl font-black">{result.percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Correct Answers</p>
            <p className="text-xl font-bold text-slate-800">{correctQ}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Wrong Answers</p>
            <p className="text-xl font-bold text-slate-800">{wrongQ}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Skipped</p>
            <p className="text-xl font-bold text-slate-800">{skippedQ}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Accuracy Rate</p>
            <p className="text-xl font-bold text-slate-800">{accuracy}%</p>
          </div>
        </div>
      </div>

      {/* Solutions & Analysis Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Question-by-Question Solution Analysis</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review detailed explanations, your choices, and verified answers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All ({totalQ})
            </button>
            <button
              onClick={() => setFilterTab('correct')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterTab === 'correct' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Correct ({correctQ})
            </button>
            <button
              onClick={() => setFilterTab('incorrect')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterTab === 'incorrect' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Wrong ({wrongQ})
            </button>
            <button
              onClick={() => setFilterTab('skipped')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterTab === 'skipped' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Skipped ({skippedQ})
            </button>
          </div>

          <button
            onClick={expandAll}
            className="text-xs font-semibold text-primary hover:underline px-2"
          >
            {expandedQuestions.size === result.questions.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedQuestions.has(q.id);
          const isSkipped = !q.selected_option;
          const isCorrect = q.is_correct;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border transition-all ${
                isCorrect
                  ? 'border-emerald-200/80 shadow-sm'
                  : isSkipped
                  ? 'border-slate-200'
                  : 'border-rose-200/80 shadow-sm'
              }`}
            >
              {/* Question Header Accordion */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-5 cursor-pointer flex items-center justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-700'
                        : isSkipped
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                      {q.question_text}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct (+{q.marks || 1} mark)
                        </span>
                      ) : isSkipped ? (
                        <span className="text-slate-400 font-medium">Skipped / Unanswered</span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect (Selected {q.selected_option})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Solution Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 animate-fade-in">
                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = q[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;

                      const isThisCorrect = q.correct_option?.toUpperCase() === optKey;
                      const isThisSelected = q.selected_option?.toUpperCase() === optKey;

                      let itemStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
                      if (isThisCorrect) {
                        itemStyle = 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold';
                      } else if (isThisSelected && !isThisCorrect) {
                        itemStyle = 'border-rose-400 bg-rose-50/60 text-rose-950 font-semibold';
                      }

                      return (
                        <div
                          key={optKey}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${itemStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center font-bold text-[10px]">
                              {optKey}
                            </span>
                            <span>{optText}</span>
                          </div>

                          {isThisCorrect && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Correct Answer
                            </span>
                          )}
                          {isThisSelected && !isThisCorrect && (
                            <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation */}
                  {q.explanation && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs leading-relaxed space-y-1">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <FileCheck className="w-4 h-4 text-primary" />
                        Explanation / Solution Step:
                      </span>
                      <p className="text-slate-600 whitespace-pre-line">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
