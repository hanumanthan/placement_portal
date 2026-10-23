import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Modal,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import {
  FileCheck2,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Ban,
  Sparkles,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  'All',
  'Interested',
  'Applied',
  'Shortlisted',
  'Test Completed',
  'Interview',
  'Selected',
  'Rejected',
  'Withdrawn',
];

const PIPELINE_STEPS = [
  'Interested',
  'Applied',
  'Shortlisted',
  'Test Completed',
  'Interview',
  'Selected',
];

export default function StudentApplications() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getMyApplications(activeTab);
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      toast.error('Failed to load application history.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!selectedApp) return;
    try {
      setWithdrawing(true);
      const res = await applicationService.withdrawApplication(selectedApp.id);
      if (res.success) {
        toast.success('Application withdrawn successfully');
        setWithdrawModalOpen(false);
        fetchApplications();
      }
    } catch (err) {
      toast.error('Failed to withdraw application.');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStepStatus = (currentStatus, stepName) => {
    if (currentStatus === 'Rejected') {
      return stepName === 'Applied' ? 'completed' : 'rejected';
    }
    if (currentStatus === 'Withdrawn') {
      return 'withdrawn';
    }

    const currentIndex = PIPELINE_STEPS.indexOf(currentStatus);
    const stepIndex = PIPELINE_STEPS.indexOf(stepName);

    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary-900 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-primary" /> My Placement Applications
          </h1>
          <p className="text-xs text-muted mt-1">
            Track your recruitment progress, interview schedules, shortlist notices, and offer releases.
          </p>
        </div>
      </div>

      {/* ─── Status Filter Tabs ────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Applications List ─────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const isTerminal = app.status === 'Selected' || app.status === 'Rejected' || app.status === 'Withdrawn';
            return (
              <Card
                key={app.id}
                className={`border-border hover:shadow-card-hover transition-all duration-200 ${
                  app.status === 'Selected' ? 'border-success-300 bg-success-50/10' : ''
                }`}
              >
                <CardBody className="p-6 space-y-6">
                  {/* Top: Company Header & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-secondary-100 text-secondary-900 font-bold text-lg flex items-center justify-center border border-border shrink-0">
                        {app.company_name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-secondary-900">{app.company_name}</h2>
                          <Badge status={app.status} />
                        </div>
                        <p className="text-xs font-semibold text-secondary-700">{app.job_title}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                          <span>💰 ₹{app.package_lpa} LPA</span>
                          <span>📍 {app.location}</span>
                          <span>📅 Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link to={`/student/companies/${app.drive_id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Drive Details <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>

                      {!isTerminal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setWithdrawModalOpen(true);
                          }}
                          className="text-danger hover:bg-danger-50 text-xs"
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" /> Withdraw
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* ─── Visual Pipeline Status Stepper ─────────── */}
                  <div className="pt-3 border-t border-border/80">
                    <p className="text-[11px] font-bold text-secondary-700 uppercase tracking-wider mb-3">
                      Application Stage Pipeline
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {PIPELINE_STEPS.map((step, idx) => {
                        const statusType = getStepStatus(app.status, step);
                        let style = 'bg-secondary-50 border-border text-muted';

                        if (statusType === 'completed') {
                          style =
                            step === 'Selected'
                              ? 'bg-success-100 border-success-300 text-success-900 font-bold'
                              : 'bg-primary-50 border-primary-200 text-primary-900 font-semibold';
                        }

                        return (
                          <div
                            key={step}
                            className={`p-2.5 rounded-xl border text-center text-xs flex flex-col items-center justify-center gap-1 transition-all ${style}`}
                          >
                            <span className="text-[10px] font-mono text-muted">Step {idx + 1}</span>
                            <span className="text-xs truncate max-w-full">{step}</span>
                            {statusType === 'completed' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin Notes/Feedback */}
                  {app.notes && (
                    <div className="p-3 bg-secondary-50 rounded-xl border border-border text-xs space-y-1">
                      <span className="font-bold text-secondary-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" /> Placement Cell Notice
                      </span>
                      <p className="text-secondary-700 leading-relaxed">{app.notes}</p>
                    </div>
                  )}

                  {/* Offer Celebration Banner */}
                  {app.status === 'Selected' && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-success-500 to-emerald-600 text-white flex items-center justify-between gap-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-300 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold">Congratulations on your Offer! 🎉</h4>
                          <p className="text-xs text-emerald-100">
                            You have secured a placement offer at {app.company_name} for ₹{app.package_lpa} LPA.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Applications Found"
          description={
            activeTab === 'All'
              ? 'You have not submitted applications for any campus drives yet.'
              : `No applications with status "${activeTab}".`
          }
          actionText="Explore Placement Drives"
          onAction={() => (window.location.href = '/student/companies')}
        />
      )}

      {/* ─── Withdraw Confirmation Modal ───────────────────────── */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Confirm Application Withdrawal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-secondary-700 leading-relaxed">
            Are you sure you want to withdraw your application for{' '}
            <strong>{selectedApp?.company_name}</strong> ({selectedApp?.job_title})?
          </p>
          <p className="text-[11px] text-danger-700 bg-danger-50 p-2.5 rounded-lg border border-danger-200">
            ⚠️ Withdrawing removes you from active candidate screening for this placement drive.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={withdrawing} onClick={handleWithdrawConfirm}>
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
