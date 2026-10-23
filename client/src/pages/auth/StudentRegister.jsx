import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardBody, Logo } from '../../components/ui';
import { User, Mail, Phone, Lock, BookOpen, GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react';

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science and Engineering (CSE)' },
  { code: 'IT', name: 'Information Technology (IT)' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science (AIDS)' },
  { code: 'ECE', name: 'Electronics & Communication Engineering (ECE)' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering (EEE)' },
  { code: 'MECH', name: 'Mechanical Engineering (MECH)' },
  { code: 'CIVIL', name: 'Civil Engineering (CIVIL)' },
];

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    full_name: '',
    register_number: '',
    email: '',
    phone: '',
    department: 'CSE',
    course: 'B.Tech',
    batch: '2021-2025',
    graduation_year: '2025',
    password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await registerStudent({
      full_name: formData.full_name.trim(),
      register_number: formData.register_number.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      course: formData.course,
      batch: formData.batch,
      graduation_year: parseInt(formData.graduation_year, 10),
      password: formData.password,
    });

    setLoading(false);

    if (res.success) {
      navigate('/student/dashboard', { replace: true });
    } else {
      setError(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-primary-50/20 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="flex justify-center mb-3">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-secondary-900">
          Create Student Account
        </h2>
        <p className="mt-1 text-sm text-secondary-600">
          Register with your institutional details to access placement drives and mock tests.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card className="shadow-lg border-border/80">
          <CardBody className="p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Full Name & Register Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="e.g. Arun Kumar"
                      className="w-full pl-10 pr-3.5 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Register Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="register_number"
                      required
                      value={formData.register_number}
                      onChange={handleChange}
                      placeholder="e.g. 953621104001"
                      className="w-full pl-10 pr-3.5 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Institutional Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. arun.kumar@student.edu"
                      className="w-full pl-10 pr-3.5 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-3.5 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Department & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Department *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Graduation Year & Batch
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full py-2 px-2.5 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="B.E">B.E</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MCA">MCA</option>
                    </select>
                    <select
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleChange}
                      className="w-full py-2 px-2.5 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4: Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-secondary-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirm_password"
                      required
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-2.5 text-sm font-semibold mt-4"
              >
                Complete Registration <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-3 border-t border-border text-center text-xs text-secondary-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in here
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
