import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardBody, Logo } from '../../components/ui';
import { Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function StudentLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/student/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await loginStudent(identifier, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Invalid email/register number or password.');
    }
  };

  const handleQuickFill = (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-primary-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-secondary-900">
          Student Portal Login
        </h2>
        <p className="mt-1 text-sm text-secondary-600">
          Prepare for placement drives, take tests, and track applications.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-border/80">
          <CardBody className="p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1.5">
                  Email or Register Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 953621104001 or name@student.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-secondary-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-lg text-sm text-secondary-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-2.5 text-sm font-semibold mt-2"
              >
                Sign In to Portal <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="pt-4 border-t border-border space-y-2.5">
              <p className="text-xs font-semibold text-muted text-center uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Fast Demo Logins
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('953621104001', 'Student@123')}
                  className="px-2.5 py-2 text-xs font-medium text-secondary-700 bg-secondary-50 hover:bg-secondary-100 rounded-md border border-border text-center transition-colors truncate"
                >
                  👤 Arun (CSE)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('priya.sharma@student.edu', 'Student@123')}
                  className="px-2.5 py-2 text-xs font-medium text-secondary-700 bg-secondary-50 hover:bg-secondary-100 rounded-md border border-border text-center transition-colors truncate"
                >
                  👤 Priya (IT)
                </button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-secondary-600">
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Register here
                </Link>
              </div>
              <Link to="/admin/login" className="flex items-center gap-1 font-medium text-muted hover:text-secondary-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
