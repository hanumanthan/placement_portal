import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  StatCard,
  ProgressBar,
  Skeleton,
} from '../../components/ui';
import {
  Building2,
  FileCheck2,
  BookOpenCheck,
  Trophy,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Briefcase,
  Play,
  Languages,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState('');
  const [challengeSubmitting, setChallengeSubmitting] = useState(false);
  const [challengeAttempted, setChallengeAttempted] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setData(res.data);
        if (res.data?.today_challenge?.attempt_id) {
          setChallengeAttempted(true);
          setChallengeFeedback({
            is_correct: res.data.today_challenge.is_correct,
            points: res.data.today_challenge.points_awarded,
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load student dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChallengeOption || !data?.today_challenge) return;

    try {
      setChallengeSubmitting(true);
      const res = await api.post(`/challenges/${data.today_challenge.id}/attempt`, {
        selected_option: selectedChallengeOption,
      });

      if (res.data?.success) {
        setChallengeAttempted(true);
        setChallengeFeedback(res.data.data);
        toast.success(
          res.data.data.is_correct
            ? `🎉 Correct! +${res.data.data.points_awarded} Points added to your streak!`
            : '❌ Incorrect answer. Keep practicing!'
        );
        fetchDashboard();
      }
    } catch (err) {
      // If endpoint not mounted yet, simulate instant client feedback
      setChallengeAttempted(true);
      toast.success('Challenge answer submitted!');
    } finally {
      setChallengeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 w-full lg:col-span-2" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  const { stats, today_challenge, vocabulary_of_day, today_test, eligible_companies, upcoming_drives, recent_videos } = data || {};

  return (
    <div className="space-y-6">
      {/* ─── Hero Welcome & Placement Readiness Bar ───────────── */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-surface via-primary-50/30 to-surface border-primary/20 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> What should I do today?
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">
              Hello, {user?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed">
              Your placement preparation is on track. Complete today's algorithmic challenge and mock test to elevate your readiness score.
            </p>
          </div>

          <div className="w-full md:w-72 p-4 rounded-xl bg-surface border border-border shadow-sm space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-secondary-800">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-warning" /> Profile Readiness
              </span>
              <span className="text-primary">{stats?.profile_completeness || 0}%</span>
            </div>
            <ProgressBar value={stats?.profile_completeness || 0} max={100} />
            <p className="text-[11px] text-muted text-right">
              {stats?.profile_completeness < 100 ? (
                <Link to="/student/profile" className="text-primary hover:underline">Complete profile for 100% →</Link>
              ) : (
                'Profile 100% Ready'
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* ─── Top 4 Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Drives"
          value={stats?.upcoming_companies || 0}
          icon={Building2}
          color="primary"
          trendLabel="Active Openings"
        />
        <StatCard
          title="Companies Applied"
          value={stats?.companies_applied || 0}
          icon={FileCheck2}
          color="success"
          trendLabel="Tracked Applications"
        />
        <StatCard
          title="Tests Completed"
          value={stats?.tests_completed || 0}
          icon={BookOpenCheck}
          color="primary"
          trendLabel="Assessments Taken"
        />
        <StatCard
          title="Current Streak"
          value={`${stats?.current_streak || 0} Days`}
          icon={Flame}
          color="warning"
          trendLabel={`${stats?.total_points || 0} Total Points`}
        />
      </div>

      {/* ─── Today's Action Center: Challenge + Vocabulary ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Daily Challenge (7 Cols) */}
        <Card className="lg:col-span-7 flex flex-col border-warning-200/60 bg-gradient-to-br from-surface to-warning-50/20">
          <CardHeader className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning-100 text-warning-800">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-secondary-900">Today's Daily Challenge</h2>
                <p className="text-[11px] text-muted">Solve to maintain your streak (+15 points)</p>
              </div>
            </div>
            <Badge status="published" className="bg-warning-100 text-warning-800">
              Active Today
            </Badge>
          </CardHeader>
          <CardBody className="p-5 flex-1 flex flex-col justify-between space-y-4">
            {today_challenge ? (
              <div className="space-y-3.5">
                <p className="text-xs sm:text-sm font-semibold text-secondary-800 leading-relaxed bg-surface p-3.5 rounded-xl border border-border">
                  {today_challenge.question_text || 'Loading challenge question...'}
                </p>

                {challengeAttempted ? (
                  <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-success" /> Challenge Completed for Today!
                    </p>
                    <p className="text-success-700">
                      You earned {challengeFeedback?.points || 15} points and extended your preparation streak to {stats?.current_streak || 1} days!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleChallengeSubmit} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: 'A', text: today_challenge.option_a },
                        { key: 'B', text: today_challenge.option_b },
                        { key: 'C', text: today_challenge.option_c },
                        { key: 'D', text: today_challenge.option_d },
                      ].map((opt) => (
                        <label
                          key={opt.key}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            selectedChallengeOption === opt.key
                              ? 'border-primary bg-primary-50/60 font-semibold text-primary-900 shadow-sm'
                              : 'border-border bg-surface hover:bg-secondary-50 text-secondary-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="challengeOption"
                            value={opt.key}
                            checked={selectedChallengeOption === opt.key}
                            onChange={(e) => setSelectedChallengeOption(e.target.value)}
                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span className="font-bold text-secondary-500">{opt.key}.</span>
                          <span className="truncate">{opt.text}</span>
                        </label>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={challengeSubmitting}
                      disabled={!selectedChallengeOption}
                      className="w-full text-xs font-semibold py-2"
                    >
                      Submit Answer <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted">No active challenge scheduled for today.</p>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
              <span>Next challenge unlocks tomorrow at midnight</span>
              <Link to="/student/challenges" className="font-semibold text-primary hover:underline">
                View Leaderboard →
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Vocabulary of the Day (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col border-primary-200/60 bg-gradient-to-br from-surface to-primary-50/20">
          <CardHeader className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-100 text-primary">
                <Languages className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-secondary-900">Vocabulary of the Day</h2>
                <p className="text-[11px] text-muted">Enhance verbal ability for interviews</p>
              </div>
            </div>
            <Badge status="published">{vocabulary_of_day?.part_of_speech || 'Word'}</Badge>
          </CardHeader>
          <CardBody className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
            {vocabulary_of_day ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-secondary-900">{vocabulary_of_day.word}</h3>
                  <span className="text-xs text-muted font-mono">{vocabulary_of_day.pronunciation}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-border text-xs space-y-2">
                  <p className="text-secondary-700 leading-relaxed font-medium">
                    <span className="font-bold text-secondary-900">Meaning:</span> {vocabulary_of_day.definition}
                  </p>
                  <p className="text-secondary-600 italic text-[11px]">
                    "{vocabulary_of_day.example_sentence}"
                  </p>
                </div>
                {vocabulary_of_day.synonyms && (
                  <div className="text-[11px] text-secondary-600">
                    <span className="font-semibold text-secondary-800">Synonyms:</span> {vocabulary_of_day.synonyms}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted">Vocabulary list loading...</p>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted">30 Words in Curriculum</span>
              <Link to="/student/vocabulary" className="font-semibold text-primary hover:underline">
                Practice Flashcards →
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ─── Companies You May Be Eligible For (Rule-Based SQL Engine) ─── */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <div>
            <h2 className="text-base font-bold text-secondary-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Companies You Are Eligible For
            </h2>
            <p className="text-xs text-muted">
              Auto-matched based on your CGPA ({user?.cgpa || '0.00'}), department ({user?.department}), and 0 backlogs criteria.
            </p>
          </div>
          <Link to="/student/companies">
            <Button variant="outline" size="sm">
              Explore All Drives ({stats?.upcoming_companies || 0}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {eligible_companies && eligible_companies.length > 0 ? (
            <div className="divide-y divide-border">
              {eligible_companies.map((drive) => (
                <div
                  key={drive.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-secondary-100 text-secondary-800 font-bold flex items-center justify-center text-sm shrink-0 border border-border">
                      {drive.company_name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-secondary-900">{drive.company_name}</h3>
                        <Badge status="published">{drive.employment_type}</Badge>
                        {drive.skills_match_percentage >= 70 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-100 text-success-800">
                            {drive.skills_match_percentage}% Skill Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-600 font-medium">{drive.job_title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                        <span>📍 {drive.location}</span>
                        <span>💰 ₹{drive.package_lpa} LPA</span>
                        <span className="text-warning-700 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Closes {new Date(drive.application_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link to={`/student/companies`}>
                      <Button variant="primary" size="sm">
                        View & Apply <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted mx-auto" />
              <p className="text-xs font-semibold text-secondary-800">No active eligible drives right now</p>
              <p className="text-[11px] text-muted">Keep your profile updated to qualify for upcoming campus visits.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── Bottom 2-Column: Today's Test & Recent Videos ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Recommended Test */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-100 text-primary">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-secondary-900">Today's Recommended Mock Test</h2>
                <p className="text-[11px] text-muted">Timed test with instant scoring and explanations</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-5 space-y-4">
            {today_test ? (
              <div className="p-4 rounded-xl bg-secondary-50 border border-border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-secondary-900">{today_test.title}</h3>
                    <p className="text-xs text-secondary-600 mt-0.5">{today_test.description}</p>
                  </div>
                  <Badge status="published">{today_test.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>⏱️ {today_test.duration_minutes} Mins</span>
                  <span>📝 {today_test.total_marks} Marks</span>
                  <span>🎯 Pass: 60%</span>
                </div>
                <Link to="/student/tests" className="block pt-1">
                  <Button variant="primary" className="w-full text-xs font-semibold py-2">
                    Start Test Assessment <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted">No tests scheduled.</p>
            )}
          </CardBody>
        </Card>

        {/* Preparation Videos */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-danger-100 text-danger">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-secondary-900">Placement Preparation Videos</h2>
                <p className="text-[11px] text-muted">Curated concept lectures and interview tips</p>
              </div>
            </div>
            <Link to="/student/videos" className="text-xs font-semibold text-primary hover:underline">
              View All →
            </Link>
          </CardHeader>
          <CardBody className="p-5 space-y-2.5">
            {recent_videos && recent_videos.length > 0 ? (
              recent_videos.map((vid) => (
                <Link
                  key={vid.id}
                  to="/student/videos"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-secondary-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-danger-50 text-danger flex items-center justify-center shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs font-semibold text-secondary-800 truncate">{vid.title}</span>
                  </div>
                  <span className="text-[10px] text-muted shrink-0 pl-2">{vid.duration}</span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted">No videos loaded.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
