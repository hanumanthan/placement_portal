import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { testService } from '../../services/testService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function StudentTestTaker() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(location.state?.test || null);
  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [loading, setLoading] = useState(!test);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State maps
  // answers: { [questionId]: 'A' | 'B' | 'C' | 'D' }
  // flagged: Set<questionId>
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(`test_answers_${attemptId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [flagged, setFlagged] = useState(() => {
    try {
      const saved = localStorage.getItem(`test_flagged_${attemptId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`test_answers_${attemptId}`, JSON.stringify(answers));
    } catch (e) {
      console.error(e);
    }
  }, [answers, attemptId]);

  useEffect(() => {
    try {
      localStorage.setItem(`test_flagged_${attemptId}`, JSON.stringify(Array.from(flagged)));
    } catch (e) {
      console.error(e);
    }
  }, [flagged, attemptId]);

  // Load test if not in router state
  useEffect(() => {
    if (!test) {
      loadTestSession();
    } else if (timeLeftSeconds === null) {
      initializeTimer(attempt, test);
    }
  }, [attemptId]);

  const loadTestSession = async () => {
    try {
      setLoading(true);
      // We can get attempt or start
      const myAttemptsRes = await testService.getMyAttempts();
      const currentAttempt = myAttemptsRes.data?.find((a) => String(a.id) === String(attemptId));
      if (!currentAttempt) {
        toast.error('Test session not found');
        navigate('/student/tests');
        return;
      }

      const testRes = await testService.getTestById(currentAttempt.test_id);
      if (testRes.success) {
        setTest(testRes.data);
        setAttempt(currentAttempt);
        initializeTimer(currentAttempt, testRes.data);
      }
    } catch (err) {
      toast.error('Failed to load assessment');
      navigate('/student/tests');
    } finally {
      setLoading(false);
    }
  };

  const initializeTimer = (att, tst) => {
    const durationSec = (tst.duration_minutes || 30) * 60;
    const startTime = new Date(att?.started_at || Date.now()).getTime();
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, durationSec - elapsedSec);
    setTimeLeftSeconds(remaining);
  };

  // Timer Tick
  useEffect(() => {
    if (timeLeftSeconds === null || timeLeftSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeftSeconds]);

  const handleSelectOption = (optionKey) => {
    const qId = test.questions[currentIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const handleClearResponse = () => {
    const qId = test.questions[currentIndex].id;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    const qId = test.questions[currentIndex].id;
    setFlagged((prev) => {
      const copy = new Set(prev);
      if (copy.has(qId)) {
        copy.delete(qId);
      } else {
        copy.add(qId);
      }
      return copy;
    });
  };

  const handleAutoSubmit = () => {
    toast.error('Time is up! Submitting assessment automatically...');
    handleSubmitFinal();
  };

  const handleSubmitFinal = async () => {
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id: Number(question_id),
        selected_option,
      }));

      const res = await testService.submitTest(attemptId, formattedAnswers);
      if (res.success) {
        localStorage.removeItem(`test_answers_${attemptId}`);
        localStorage.removeItem(`test_flagged_${attemptId}`);
        toast.success('Assessment submitted successfully!');
        navigate(`/student/tests/results/${attemptId}`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting test');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  if (loading || !test || !test.questions) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Preparing test environment...</p>
      </div>
    );
  }

  const currentQ = test.questions[currentIndex];
  const questionsCount = test.questions.length;
  const currentSelected = answers[currentQ?.id];
  const isCurrentFlagged = flagged.has(currentQ?.id);

  // Status counts
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;
  const unansweredCount = questionsCount - answeredCount;

  // Format Timer
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds !== null && timeLeftSeconds < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between select-none">
      {/* Test Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {test.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{test.category}</span>
              <span>&bull;</span>
              <span>Total Questions: {questionsCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold transition-all ${
                isLowTime
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse shadow-sm shadow-rose-100'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-primary" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowSubmitModal(true)}
              className="font-semibold shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Submit Assessment
            </Button>
          </div>
        </div>
      </header>

      {/* Main Test Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Question Box */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[520px]">
          <div>
            {/* Question Top Meta */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                  Question {currentIndex + 1} of {questionsCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  (+{currentQ.marks || 1} mark)
                </span>
              </div>

              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                  isCurrentFlagged
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-purple-600' : ''}`} />
                {isCurrentFlagged ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Prompt */}
            <div className="text-slate-900 font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line mb-6">
              {currentQ.question_text}
            </div>

            {/* 4 MCQ Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((optKey) => {
                const optText = currentQ[`option_${optKey.toLowerCase()}`];
                if (!optText) return null;
                const isSelected = currentSelected === optKey;

                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectOption(optKey)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-slate-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {optKey}
                    </div>
                    <span className="text-sm font-medium flex-1">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Question Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {currentSelected && (
              <button
                onClick={handleClearResponse}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                Clear Response
              </button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (currentIndex < questionsCount - 1) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className="text-xs font-semibold shadow-sm"
            >
              {currentIndex === questionsCount - 1 ? 'Review & Submit' : 'Next Question'}
              {currentIndex < questionsCount - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Right Sidebar: Palette & Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Question Palette</h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 flex-shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 flex-shrink-0" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-purple-500 flex-shrink-0" />
                <span>Review ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border-2 border-primary bg-white flex-shrink-0" />
                <span>Current Question</span>
              </div>
            </div>

            {/* Question Quick Jump Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto p-1">
              {test.questions.map((q, idx) => {
                const isAns = !!answers[q.id];
                const isFlag = flagged.has(q.id);
                const isCur = idx === currentIndex;

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isAns && isFlag) {
                  btnClass = 'bg-purple-600 text-white';
                } else if (isAns) {
                  btnClass = 'bg-emerald-500 text-white';
                } else if (isFlag) {
                  btnClass = 'bg-purple-500 text-white';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all relative ${btnClass} ${
                      isCur ? 'ring-2 ring-primary ring-offset-2 scale-105 z-10' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              Your answers are automatically saved locally. Do not close or switch tabs during the test.
            </p>
          </div>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Assessment?"
        >
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 text-xs">
              Are you sure you want to end and submit your assessment? Once submitted, your score will be computed immediately.
            </p>

            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Answered</span>
                <span className="text-base font-bold text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Unanswered</span>
                <span className="text-base font-bold text-slate-700">{unansweredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Marked</span>
                <span className="text-base font-bold text-purple-600">{flaggedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>You still have {unansweredCount} unanswered questions!</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Back to Test
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitFinal}
                loading={submitting}
              >
                Yes, Submit Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
