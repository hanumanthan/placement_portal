import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  StatCard,
  Skeleton,
  Button,
} from '../../components/ui';
import {
  Users,
  Building2,
  CalendarCheck2,
  FileCheck2,
  Trophy,
  BookOpenCheck,
  HelpCircle,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load admin dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full bg-slate-800" />
          <Skeleton className="h-80 w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  const { stats, placement_funnel, department_stats, company_selections, monthly_trend, recent_applications } = data || {};

  return (
    <div className="space-y-6">
      {/* ─── Hero Overview & Quick Actions ─────────────────────── */}
      <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="w-3.5 h-3.5" /> Placement Season 2024-2025 Live
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Placement Cell Executive Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time analytics on campus drives, student applications, conversion funnels, and corporate statistics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <Link to="/admin/drives">
              <Button variant="primary" size="sm" className="bg-primary hover:bg-primary-600">
                <Plus className="w-3.5 h-3.5 mr-1" /> Publish Drive
              </Button>
            </Link>
            <Link to="/admin/tests">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                <BookOpenCheck className="w-3.5 h-3.5 mr-1" /> Conduct Test
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* ─── 8 Key Performance Indicator Cards ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.total_students || 0}
          icon={Users}
          color="primary"
          trendLabel="Registered Batch"
        />
        <StatCard
          title="Partner Companies"
          value={stats?.total_companies || 0}
          icon={Building2}
          color="primary"
          trendLabel="Tier-1 & Product"
        />
        <StatCard
          title="Active Drives"
          value={stats?.upcoming_drives || 0}
          icon={CalendarCheck2}
          color="warning"
          trendLabel="Open Applications"
        />
        <StatCard
          title="Total Applications"
          value={stats?.total_applications || 0}
          icon={FileCheck2}
          color="primary"
          trendLabel="Received"
        />
        <StatCard
          title="Placed Students"
          value={stats?.selected_students || 0}
          icon={Award}
          color="success"
          trendLabel="Offers Released"
        />
        <StatCard
          title="Tests Conducted"
          value={stats?.total_tests || 0}
          icon={BookOpenCheck}
          color="primary"
          trendLabel="Mock & Screening"
        />
        <StatCard
          title="Question Bank"
          value={stats?.total_questions || 0}
          icon={HelpCircle}
          color="primary"
          trendLabel="Categorized Questions"
        />
        <StatCard
          title="Placement Notes"
          value={stats?.total_resources || 0}
          icon={FileText}
          color="primary"
          trendLabel="PDF Handbooks"
        />
      </div>

      {/* ─── Recharts Section 1: Monthly Applications & Funnel ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Applications Trend (7 Cols) */}
        <Card className="lg:col-span-7 bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Monthly Applications & Offer Conversion
            </h2>
            <p className="text-xs text-slate-400">Total student applications vs final offers released</p>
          </CardHeader>
          <CardBody className="p-4 pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month_label" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                  <Area type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                  <Area type="monotone" dataKey="offers" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorOffers)" name="Offers Accepted" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Placement Funnel (5 Cols) */}
        <Card className="lg:col-span-5 bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" /> Application Conversion Funnel
            </h2>
            <p className="text-xs text-slate-400">Progression from Interested to Selected</p>
          </CardHeader>
          <CardBody className="p-4 pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placement_funnel} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                  <YAxis type="category" dataKey="status" stroke="#94A3B8" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ─── Recharts Section 2: Department Stats & Company Selections ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department-wise Placement Statistics (6 Cols) */}
        <Card className="lg:col-span-6 bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Department-Wise Placement Rate
            </h2>
            <p className="text-xs text-slate-400">Total batch count vs placed candidates per branch</p>
          </CardHeader>
          <CardBody className="p-4 pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={department_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                  <Bar dataKey="total_students" fill="#64748B" radius={[4, 4, 0, 0]} name="Total Registered" />
                  <Bar dataKey="placed_students" fill="#16A34A" radius={[4, 4, 0, 0]} name="Placed Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Company-wise Selections Breakdown (6 Cols) */}
        <Card className="lg:col-span-6 bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Top Recruiting Companies
            </h2>
            <p className="text-xs text-slate-400">Offers secured across tier-1 recruiting partners</p>
          </CardHeader>
          <CardBody className="p-4 pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={company_selections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="company_name" stroke="#94A3B8" fontSize={10} interval={0} tickFormatter={(val) => val.split(' ')[0]} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                  <Bar dataKey="applications_count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Total Applied" />
                  <Bar dataKey="selected_count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Selections" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ─── Recent Applications Live Data Table ──────────────── */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" /> Recent Placement Applications
            </h2>
            <p className="text-xs text-slate-400">Latest candidate submissions across campus drives</p>
          </div>
          <Link to="/admin/applications">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800">
              Manage All Applications →
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-4 py-3">Reg No & Dept</th>
                  <th className="px-4 py-3">Company & Role</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recent_applications && recent_applications.length > 0 ? (
                  recent_applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                          {app.student_name.charAt(0)}
                        </div>
                        {app.student_name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-slate-300">{app.register_number}</span>
                        <span className="text-slate-500 block text-[10px]">{app.department} • CGPA {app.cgpa}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white">{app.company_name}</span>
                        <span className="text-slate-400 block text-[10px] truncate max-w-[200px]">{app.job_title}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-200">
                        ₹{app.package_lpa} LPA
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge status={app.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No applications submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
