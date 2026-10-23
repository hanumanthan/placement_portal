import { useState, useEffect } from 'react';
import { challengeService } from '../../services/challengeService';
import { Card, CardBody, Button, Badge, Skeleton } from '../../components/ui';
import {
  Flame,
  Trophy,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Medal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentChallenges() {
  const [loading, setLoading] = useState(true);
  const [challengeData, setChallengeData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [challengeRes, leaderboardRes] = await Promise.all([
        challengeService.getTodayChallenge(),
        challengeService.getLeaderboard(),
      ]);

      if (challengeRes.success) {
        setChallengeData(challengeRes.data.challenge);
        setStreakData(challengeRes.data.streak);
        if (challengeRes.data.challenge?.is_attempted) {
          setResult({
            is_correct: challengeRes.data.challenge.attempt?.is_correct,
            selected_option: challengeRes.data.challenge.attempt?.selected_option,
            points_awarded: challengeRes.data.challenge.attempt?.points_awarded,
            correct_option: challengeRes.data.challenge.question?.correct_option,
            explanation: challengeRes.data.challenge.question?.explanation,
          });
          setSelectedOption(challengeRes.data.challenge.attempt?.selected_option || '');
        }
      }

      if (leaderboardRes.success) {
        setLeaderboard(leaderboardRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load daily challenge data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error('Please select an option before submitting.');
      return;
    }

    if (!challengeData) return;

    setSubmitting(true);
    try {
      const res = await challengeService.submitChallenge(challengeData.id, selectedOption);
      if (res.success) {
        setResult(res.data);
        if (res.data.is_correct) {
          toast.success(`🎉 Excellent! You earned ${res.data.points_awarded} points!`);
        } else {
          toast('Keep practicing! Review the solution below.', { icon: '💡' });
        }
        // Refresh leaderboard & streak
        const [challengeRes, leaderboardRes] = await Promise.all([
          challengeService.getTodayChallenge(),
          challengeService.getLeaderboard(),
        ]);
        if (challengeRes.success) {
          setStreakData(challengeRes.data.streak);
        }
        if (leaderboardRes.success) {
          setLeaderboard(leaderboardRes.data || []);
        }
      } else {
        toast.error(res.message || 'Submission failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const q = challengeData?.question;
  const isAttempted = !!result || challengeData?.is_attempted;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Hero Streak & Points Banner ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Flame className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Daily Algorithmic Practice
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Keep Your Placement Streak Burning 🔥
            </h1>
            <p className="text-primary-100 text-sm max-w-xl">
              Solve 1 targeted aptitude or coding concept challenge each day. Consistency builds placement excellence.
            </p>
          </div>

          {/* Quick Streak Stats Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3 border border-white/15 min-w-[130px]">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400">
                  {streakData?.current_streak || 0}
                </div>
                <div className="text-xs text-primary-200 font-medium">Day Streak</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3 border border-white/15 min-w-[130px]">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">
                  {streakData?.total_points || 0}
                </div>
                <div className="text-xs text-primary-200 font-medium">Total Points</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3 border border-white/15 min-w-[130px]">
              <div className="p-2.5 rounded-lg bg-indigo-400/20 text-indigo-300">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-300">
                  {streakData?.challenges_completed || 0}
                </div>
                <div className="text-xs text-primary-200 font-medium">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Today's Challenge Interactive Card ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-3 bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-50 text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-secondary-900">
                    {challengeData?.title || "Today's Challenge"}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-secondary-500 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-muted" />
                    <span>Active for Today</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">+{challengeData?.points || 15} Points</span>
                  </div>
                </div>
              </div>

              {isAttempted ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  result?.is_correct ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                }`}>
                  {result?.is_correct ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Solved Correctly (+{result.points_awarded} pts)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Attempted (0 pts)
                    </>
                  )}
                </span>
              ) : (
                <Badge variant="warning">Not Attempted</Badge>
              )}
            </div>

            <CardBody className="p-6 space-y-6">
              {q ? (
                <>
                  {/* Question Prompt */}
                  <div className="bg-secondary-50 rounded-xl p-5 border border-border/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary-500 block mb-2">
                      Challenge Problem:
                    </span>
                    <p className="text-base text-secondary-900 font-medium whitespace-pre-line leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary-500 block">
                      Choose Your Answer:
                    </span>

                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = q[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;

                      const isSelected = selectedOption === optKey;
                      const isCorrectAnswer = result && result.correct_option === optKey;
                      const isStudentWrong = result && !result.is_correct && isSelected;

                      let buttonStyles = 'border-border hover:border-primary/50 hover:bg-primary-50/30 text-secondary-800';

                      if (isSelected && !result) {
                        buttonStyles = 'border-primary ring-2 ring-primary/20 bg-primary-50/50 text-primary-900 font-semibold';
                      }

                      if (result) {
                        if (isCorrectAnswer) {
                          buttonStyles = 'border-success-500 bg-success-50/80 text-success-900 font-semibold ring-2 ring-success-500/30';
                        } else if (isStudentWrong) {
                          buttonStyles = 'border-danger-500 bg-danger-50/80 text-danger-900 font-semibold ring-2 ring-danger-500/30';
                        } else {
                          buttonStyles = 'border-border/60 bg-secondary-50/50 text-secondary-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optKey}
                          type="button"
                          disabled={isAttempted}
                          onClick={() => setSelectedOption(optKey)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer disabled:cursor-default ${buttonStyles}`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                                isCorrectAnswer
                                  ? 'bg-success text-white'
                                  : isStudentWrong
                                  ? 'bg-danger text-white'
                                  : isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-secondary-100 text-secondary-700'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="text-sm font-medium">{optText}</span>
                          </div>

                          {result && isCorrectAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                          )}
                          {result && isStudentWrong && (
                            <XCircle className="w-5 h-5 text-danger shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submission Action */}
                  {!isAttempted ? (
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="lg"
                        loading={submitting}
                        onClick={handleSubmit}
                        className="px-8 shadow-md"
                      >
                        Submit Daily Challenge
                      </Button>
                    </div>
                  ) : null}

                  {/* Explanation Section */}
                  {result && (result.explanation || q.explanation) && (
                    <div className="rounded-xl border border-primary/20 bg-primary-50/30 p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <HelpCircle className="w-4 h-4" />
                        <span>Comprehensive Explanation:</span>
                      </div>
                      <p className="text-sm text-secondary-800 leading-relaxed whitespace-pre-line">
                        {result.explanation || q.explanation}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-secondary-500">
                  <p>No active challenge available today. Please check back tomorrow!</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ─── Leaderboard Sidebar ───────────────────────────────────── */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 text-base">Top 10 Hall of Fame</h3>
                  <p className="text-xs text-secondary-500">Campus placement streak leaders</p>
                </div>
              </div>
              <Badge variant="primary">Campus</Badge>
            </div>

            <CardBody className="p-3">
              <div className="space-y-1.5">
                {leaderboard.length === 0 ? (
                  <div className="p-6 text-center text-sm text-secondary-500">
                    No leaderboard rankings yet.
                  </div>
                ) : (
                  leaderboard.map((student, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          isTop1
                            ? 'bg-amber-50/60 border border-amber-200/80'
                            : 'hover:bg-secondary-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank indicator */}
                          <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                            {isTop1 ? (
                              <span className="text-lg">🥇</span>
                            ) : isTop2 ? (
                              <span className="text-lg">🥈</span>
                            ) : isTop3 ? (
                              <span className="text-lg">🥉</span>
                            ) : (
                              <span className="text-secondary-400">#{idx + 1}</span>
                            )}
                          </div>

                          {/* Student Details */}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-secondary-900 truncate">
                              {student.full_name}
                            </div>
                            <div className="text-xs text-secondary-500 flex items-center gap-1.5">
                              <span>{student.department}</span>
                              <span>•</span>
                              <span className="flex items-center text-amber-600 font-medium">
                                <Flame className="w-3 h-3 mr-0.5 inline" />
                                {student.current_streak}d
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Points Badge */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-primary">
                            {student.total_points}
                          </div>
                          <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                            PTS
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
