import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import driveService from '../../services/driveService';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Skeleton,
} from '../../components/ui';
import {
  Building2,
  ExternalLink,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  MessageSquareText,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      const res = await driveService.getDriveById(id);
      if (res.success) {
        setDrive(res.data);
      }
    } catch (err) {
      toast.error('Failed to load drive details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyInterest = async () => {
    if (!drive) return;

    if (drive.eligibility_check && !drive.eligibility_check.is_eligible) {
      toast.error('You do not meet the minimum eligibility requirements for this drive.');
      return;
    }

    try {
      setApplying(true);
      const res = await driveService.applyForDrive(drive.id, { status: 'Interested' });
      if (res.success) {
        setDrive(res.data);
        toast.success('Successfully registered your interest in this campus placement drive!');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Could not register interest.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full lg:col-span-2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-secondary-600">Placement drive not found.</p>
        <Link to="/student/companies">
          <Button variant="outline">Back to Drives</Button>
        </Link>
      </div>
    );
  }

  const { eligibility_check, rounds, company_history } = drive;
  const isApplied = !!drive.student_application_status;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link to="/student/companies" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-secondary-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Drives
        </Link>
      </div>

      {/* ─── Company & Drive Hero Banner ───────────────────────── */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-surface via-primary-50/20 to-surface border-primary/20 shadow-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-900 font-bold text-2xl flex items-center justify-center border border-border shrink-0 shadow-sm">
              {drive.company_name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-secondary-900">{drive.company_name}</h1>
                <Badge status="published">{drive.employment_type}</Badge>
                {isApplied && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
                    Status: {drive.student_application_status}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-secondary-700">{drive.job_title}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                <span>🏢 {drive.industry}</span>
                <span>📍 {drive.location}</span>
                {drive.company_website && (
                  <a
                    href={drive.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    Official Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs: Interested & External Application */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-64 shrink-0">
            <Button
              variant="primary"
              loading={applying}
              disabled={isApplied || (eligibility_check && !eligibility_check.is_eligible)}
              onClick={handleApplyInterest}
              className="w-full text-xs font-semibold py-2.5 shadow-sm"
            >
              {isApplied ? `Application Submitted (${drive.student_application_status})` : "I'm Interested (Save to Portal)"}
            </Button>

            {drive.official_apply_link && (
              <a
                href={drive.official_apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full text-xs font-semibold py-2 flex items-center justify-center gap-1.5">
                  Apply on Company Portal <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* ─── 2-Column Details: Job Specs vs Eligibility Checklist ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Job Details & Selection Rounds */}
        <div className="lg:col-span-7 space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Job Description & Compensation
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-secondary-50/70 rounded-xl text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-semibold">Compensation</span>
                  <span className="text-sm font-bold text-primary">₹{drive.package_lpa} LPA</span>
                </div>
                {drive.stipend_monthly > 0 && (
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-semibold">Monthly Stipend</span>
                    <span className="text-xs font-bold text-secondary-900">₹{drive.stipend_monthly} / mo</span>
                  </div>
                )}
                <div>
                  <span className="text-muted block text-[10px] uppercase font-semibold">Drive Date</span>
                  <span className="text-xs font-bold text-secondary-900">{new Date(drive.drive_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-semibold">Application Deadline</span>
                  <span className="text-xs font-bold text-warning-800">{new Date(drive.application_deadline).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-secondary-900 uppercase tracking-wider mb-1.5">Role Description</h3>
                <p className="text-xs text-secondary-700 leading-relaxed whitespace-pre-line">
                  {drive.job_description}
                </p>
              </div>

              {drive.instructions && (
                <div className="p-3.5 rounded-xl bg-primary-50/50 border border-primary-100 text-xs text-primary-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-primary" /> Special Instructions
                  </span>
                  <p className="text-[11px] text-primary-800">{drive.instructions}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Selection Process Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Selection Process Timeline
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              {rounds && rounds.length > 0 ? (
                <div className="space-y-4">
                  {rounds.map((r, idx) => (
                    <div key={r.id || idx} className="flex items-start gap-3.5 relative">
                      {idx !== rounds.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary-200 z-10">
                        {r.round_number || idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-secondary-900">{r.round_name}</h4>
                        <p className="text-xs text-secondary-600">{r.description || 'Evaluation round.'}</p>
                        {r.round_date && (
                          <p className="text-[10px] text-muted">Scheduled: {new Date(r.round_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Standard aptitude, coding, and technical rounds.</p>
              )}
            </CardBody>
          </Card>

          {/* Previous Placement History */}
          {company_history && company_history.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Previous Recruitment Statistics
                </h2>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary-50 text-secondary-700 uppercase font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5">Year</th>
                        <th className="px-4 py-2.5">Appeared</th>
                        <th className="px-4 py-2.5">Offers</th>
                        <th className="px-4 py-2.5">Highest CTC</th>
                        <th className="px-4 py-2.5">Average CTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-secondary-700">
                      {company_history.map((h) => (
                        <tr key={h.id}>
                          <td className="px-4 py-2.5 font-bold text-secondary-900">{h.year}</td>
                          <td className="px-4 py-2.5">{h.total_appeared}</td>
                          <td className="px-4 py-2.5 font-bold text-success-700">{h.total_selected}</td>
                          <td className="px-4 py-2.5">₹{h.highest_package} LPA</td>
                          <td className="px-4 py-2.5">₹{h.average_package} LPA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right 5 Cols: Multi-Factor Eligibility Checklist & Questions Link */}
        <div className="lg:col-span-5 space-y-6">
          {/* Eligibility Checklist Card */}
          <Card className={`border-2 ${eligibility_check?.is_eligible ? 'border-success-200' : 'border-danger-200'}`}>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Eligibility Status
                </h2>
                {eligibility_check?.is_eligible ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-100 text-success-800">
                    PASS: Fully Eligible
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger-100 text-danger-800">
                    FAIL: Ineligible
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted mt-0.5">
                Evaluation based on your live academic profile records.
              </p>
            </CardHeader>
            <CardBody className="p-5 space-y-3">
              {eligibility_check?.criteria?.map((crit, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                    crit.pass ? 'bg-success-50/40 border-success-200' : 'bg-danger-50/40 border-danger-200'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {crit.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger" />
                    )}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between font-bold text-secondary-900">
                      <span>{crit.label}</span>
                      <span className="text-[11px] font-mono text-secondary-600">{crit.student_val}</span>
                    </div>
                    <p className={`text-[11px] ${crit.pass ? 'text-success-800' : 'text-danger-800 font-medium'}`}>
                      {crit.reason}
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Skills Match Overview */}
          {eligibility_check?.skills_match && (
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Required Skills Match ({eligibility_check.skills_match.percentage}%)
                </h2>
              </CardHeader>
              <CardBody className="p-5 space-y-3">
                {eligibility_check.skills_match.matched.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-success-800 uppercase tracking-wider block mb-1">
                      Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {eligibility_check.skills_match.matched.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-success-100 text-success-900 border border-success-200">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {eligibility_check.skills_match.missing.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-warning-800 uppercase tracking-wider block mb-1">
                      Recommended to Learn
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {eligibility_check.skills_match.missing.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-warning-50 text-warning-900 border border-warning-200">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Quick Resource & Questions Hub */}
          <Card className="bg-secondary-50/70 border-border">
            <CardBody className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-secondary-900 uppercase tracking-wider">
                Prepare for {drive.company_name}
              </h3>
              <div className="space-y-2">
                <Link
                  to="/student/questions"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border hover:border-primary transition-colors text-xs font-semibold text-secondary-800"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Practice Previous Questions
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
                </Link>

                <Link
                  to="/student/experiences"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border hover:border-primary transition-colors text-xs font-semibold text-secondary-800"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-primary" /> Read Senior Interview Experiences
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
