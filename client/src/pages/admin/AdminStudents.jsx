import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Building2,
  FileText,
  ExternalLink,
  Award,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML'];

export default function AdminStudents() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Selected student modal
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [page, department]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents({
        department: department || undefined,
        search: search.trim() || undefined,
        page,
        limit: 12,
      });

      if (res.success && res.data) {
        setStudents(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  const openStudentDetail = async (id) => {
    setSelectedStudentId(id);
    setDetailLoading(true);
    try {
      const res = await adminService.getStudentById(id);
      if (res.success) {
        setStudentDetail(res.data);
      }
    } catch (err) {
      toast.error('Failed to load student details.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Student Placement Directory
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Monitor student profiles, CGPA, arrears, application tracks, and recruitment offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-3">
            Total Enrolled: <strong className="ml-1 text-secondary-900">{total}</strong>
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, roll no, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <Button type="submit" variant="outline" size="sm" className="text-xs py-1.5">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Dept & Batch</th>
                <th className="py-3 px-4">Academic CGPA</th>
                <th className="py-3 px-4">Arrears</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Offers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan="7" className="py-3 px-4">
                      <Skeleton className="w-full h-8" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-muted">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img
                            src={s.photo_url}
                            alt={s.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                            {s.full_name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-secondary-900">{s.full_name}</div>
                          <div className="text-[11px] text-muted font-mono">{s.register_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="outline" size="sm">
                        {s.department}
                      </Badge>
                      <span className="text-[11px] text-muted ml-1.5">Batch {s.batch || s.graduation_year}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-secondary-900">
                        {s.cgpa ? parseFloat(s.cgpa).toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {s.standing_arrears > 0 ? (
                        <Badge variant="danger" size="sm">
                          {s.standing_arrears} Standing
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          0 Arrears
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-secondary-700 font-medium">{s.applications_count} applied</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {s.offers_count > 0 ? (
                        <Badge variant="success" size="sm" className="font-bold">
                          {s.offers_count} Selected
                        </Badge>
                      ) : (
                        <span className="text-muted text-[11px]">In Progress</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openStudentDetail(s.id)}
                        className="text-xs h-7 px-2 text-primary hover:bg-primary-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Dossier
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">
            Page <span className="font-semibold text-secondary-900">{page}</span> of{' '}
            <span className="font-semibold text-secondary-900">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Student Dossier Modal */}
      <Modal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => {
          setSelectedStudentId(null);
          setStudentDetail(null);
        }}
        title={studentDetail?.full_name ? `${studentDetail.full_name} (${studentDetail.register_number})` : 'Student Dossier'}
        size="lg"
      >
        {detailLoading || !studentDetail ? (
          <div className="p-8 space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-24" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Academic & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-secondary-50 rounded-xl border border-border text-xs">
              <div className="space-y-1.5">
                <p className="flex items-center gap-2 text-secondary-700">
                  <Mail className="w-3.5 h-3.5 text-muted" />
                  <span>{studentDetail.email}</span>
                </p>
                <p className="flex items-center gap-2 text-secondary-700">
                  <Phone className="w-3.5 h-3.5 text-muted" />
                  <span>{studentDetail.phone || 'Phone not provided'}</span>
                </p>
                <p className="flex items-center gap-2 text-secondary-700">
                  <GraduationCap className="w-3.5 h-3.5 text-muted" />
                  <span>{studentDetail.department} • Batch {studentDetail.batch}</span>
                </p>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-border sm:pl-4">
                <p className="text-secondary-700">
                  <strong>CGPA:</strong> {studentDetail.cgpa ? parseFloat(studentDetail.cgpa).toFixed(2) : 'N/A'}
                </p>
                <p className="text-secondary-700">
                  <strong>Arrears:</strong> Standing: {studentDetail.standing_arrears || 0} | History: {studentDetail.history_arrears || 0}
                </p>
                <p className="text-secondary-700">
                  <strong>10th / 12th:</strong> {studentDetail.tenth_percentage || 'N/A'}% / {studentDetail.twelfth_percentage || 'N/A'}%
                </p>
              </div>
            </div>

            {/* Resume & Links */}
            <div className="flex items-center gap-2 flex-wrap">
              {studentDetail.resume_url && (
                <a
                  href={studentDetail.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline text-xs h-8 px-3 inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" /> View Resume
                </a>
              )}
              {studentDetail.linkedin_url && (
                <a
                  href={studentDetail.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost text-xs h-8 px-2 inline-flex items-center gap-1 text-secondary-700"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
                </a>
              )}
              {studentDetail.github_url && (
                <a
                  href={studentDetail.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost text-xs h-8 px-2 inline-flex items-center gap-1 text-secondary-700"
                >
                  <Globe className="w-3.5 h-3.5 text-secondary-800" /> GitHub
                </a>
              )}
            </div>

            {/* Applications Record */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Placement Applications ({studentDetail.applications?.length || 0})
              </h4>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                {studentDetail.applications?.length === 0 ? (
                  <p className="p-4 text-xs text-muted text-center">No drive applications yet.</p>
                ) : (
                  studentDetail.applications?.map((app) => (
                    <div key={app.id} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-secondary-900">{app.company_name}</span>
                        <span className="text-muted ml-2">({app.job_title} - {app.package_lpa} LPA)</span>
                      </div>
                      <Badge variant={app.status === 'Selected' ? 'success' : 'secondary'} size="sm">
                        {app.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Test Attempts Record */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Aptitude Test Attempts ({studentDetail.test_attempts?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                {studentDetail.test_attempts?.length === 0 ? (
                  <p className="p-4 text-xs text-muted text-center">No test attempts recorded.</p>
                ) : (
                  studentDetail.test_attempts?.map((t) => (
                    <div key={t.id} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-secondary-900">{t.test_title}</span>
                        <span className="text-muted ml-2">({t.test_category})</span>
                      </div>
                      <span className="font-mono font-bold text-primary">
                        Score: {t.score} / {t.total_marks || 100}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStudentId(null);
                  setStudentDetail(null);
                }}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
