import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardBody, Logo } from '../../components/ui';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, User } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide admin credentials.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@placementportal.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 shadow-inner">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-white tracking-tight">Placement Admin Portal</span>
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Administrator Security Gateway
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Authorized personnel only. Drives, tests, and analytics management.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="bg-slate-800/90 border-slate-700 shadow-2xl backdrop-blur-sm">
          <CardBody className="p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-200 text-sm rounded-lg flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@placementportal.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-2.5 text-sm font-semibold mt-2 bg-primary hover:bg-primary-600 shadow-md"
              >
                Access Admin Portal <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Quick Demo Autofill */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Demo Access
              </p>
              <button
                type="button"
                onClick={handleQuickFill}
                className="w-full px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-700 rounded-md border border-slate-600 text-center transition-colors flex items-center justify-center gap-1.5"
              >
                🔑 Autofill Admin Credentials (Admin@123)
              </button>
            </div>

            {/* Link back to Student login */}
            <div className="pt-2 text-center text-xs text-slate-400">
              Are you a student?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Student Login
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
