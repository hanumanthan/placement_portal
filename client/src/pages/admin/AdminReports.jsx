import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Card, CardBody, Button, Badge, Skeleton } from '../../components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  Building2,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports();
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      toast.error('Failed to load placement reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reports?.department_summary) return;

    const headers = ['Department Code', 'Department Name', 'Total Students', 'Placed Students', 'Placement %', 'Avg Package (LPA)', 'Highest Package (LPA)'];
    const rows = reports.department_summary.map((d) => [
      d.department,
      `"${d.department_name || d.department}"`,
      d.total_students,
      d.placed_students,
      `${d.placement_percentage}%`,
      d.avg_package || 0,
      d.highest_package || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `placement_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Placement report CSV downloaded!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Placement Performance & Reports
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Department-wise conversion analytics, CTC tiers distribution, and recruiter insights.
          </p>
        </div>

        <Button variant="primary" onClick={handleExportCSV} disabled={loading || !reports}>
          <Download className="w-4 h-4 mr-1.5" /> Export Report (CSV)
        </Button>
      </div>

      {loading || !reports ? (
        <div className="space-y-6">
          <Skeleton className="w-full h-72 rounded-xl" />
          <Skeleton className="w-full h-80 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Tiers Bar Chart */}
            <Card>
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-secondary-900">Salary Package Tiers (CTC)</h3>
                    <p className="text-xs text-muted">Distribution of verified placement job offers</p>
                  </div>
                  <Badge variant="outline" size="sm">Live Tiers</Badge>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.package_tiers} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Bar dataKey="offers_count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Offers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Department Conversion Bar Chart */}
            <Card>
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-secondary-900">Placement % by Department</h3>
                    <p className="text-xs text-muted">Placed students vs eligible batch strength</p>
                  </div>
                  <Badge variant="success" size="sm">Conversion Rate</Badge>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.department_summary} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val) => [`${val}%`, 'Placement Rate']}
                      />
                      <Bar dataKey="placement_percentage" fill="#10B981" radius={[6, 6, 0, 0]} name="Placement %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Department Breakdown Table */}
          <Card>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-secondary-900">Branch-wise Placement Statistics</h3>
                <p className="text-xs text-muted">Audited branch statistics for NAAC / NIRF accreditation reporting</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Total Students</th>
                    <th className="py-3 px-4">Students Placed</th>
                    <th className="py-3 px-4">Placement Rate</th>
                    <th className="py-3 px-4">Avg Package</th>
                    <th className="py-3 px-4">Highest Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reports.department_summary.map((dept) => (
                    <tr key={dept.department} className="hover:bg-secondary-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-secondary-900">
                        {dept.department}
                        {dept.department_name && (
                          <span className="text-[11px] text-muted font-normal block">{dept.department_name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-secondary-700">{dept.total_students}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">{dept.placed_students}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-secondary-900">{dept.placement_percentage}%</span>
                          <div className="w-16 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${dept.placement_percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-secondary-800">
                        {dept.avg_package ? `${dept.avg_package} LPA` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {dept.highest_package ? `${dept.highest_package} LPA` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Recruiting Partners Table */}
          <Card>
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-sm text-secondary-900">Top Campus Recruiters</h3>
              <p className="text-xs text-muted">Companies with highest recruitment volume in current season</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Total Hires</th>
                    <th className="py-3 px-4">Max Offered CTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reports.top_recruiters.map((c, idx) => (
                    <tr key={idx} className="hover:bg-secondary-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-secondary-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        {c.company_name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" size="sm">{c.industry || 'IT / Tech'}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{c.selections} Selected</td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">{c.max_lpa} LPA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
