import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui';
import {
  LayoutDashboard,
  Building2,
  FileCheck2,
  BookOpenCheck,
  Trophy,
  Languages,
  HelpCircle,
  MessageSquareText,
  Video,
  FileText,
  UserCircle,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Companies', path: '/student/companies', icon: Building2 },
  { name: 'My Applications', path: '/student/applications', icon: FileCheck2 },
  { name: 'Aptitude Tests', path: '/student/tests', icon: BookOpenCheck },
  { name: 'Daily Challenge', path: '/student/challenges', icon: Trophy, badge: 'Streak' },
  { name: 'Coding Arena (C/Java)', path: '/student/coding', icon: Code2, badge: 'Compiler' },
  { name: 'Vocabulary', path: '/student/vocabulary', icon: Languages },
  { name: 'Previous Questions', path: '/student/questions', icon: HelpCircle },
  { name: 'Interview Experiences', path: '/student/experiences', icon: MessageSquareText },
  { name: 'Learning Videos', path: '/student/videos', icon: Video },
  { name: 'Resources', path: '/student/resources', icon: FileText },
  { name: 'My Profile', path: '/student/profile', icon: UserCircle },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/companies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-secondary-900 flex flex-col antialiased">
      {/* ─── Top Navbar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-border h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/student/dashboard" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Global Search Bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search companies, questions, vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </form>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Link
            to="/student/dashboard"
            className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface" />
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-secondary-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center border border-primary-200">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-secondary-800 truncate max-w-[120px]">
                {user?.full_name?.split(' ')[0] || 'Student'}
              </span>
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-surface rounded-xl shadow-lg border border-border py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-border/70">
                  <p className="text-xs font-bold text-secondary-900 truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-muted truncate">{user?.register_number} • {user?.department}</p>
                </div>
                <Link
                  to="/student/profile"
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-muted" /> View Full Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-danger hover:bg-danger-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-danger" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content Container with Sidebar ────────────────── */}
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-surface transition-all duration-200 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse Toggle */}
          <div className="p-3 flex justify-end border-b border-border/50">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-muted hover:text-secondary-800 hover:bg-secondary-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="flex-1 flex items-center justify-between truncate">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-warning-100 text-warning-800 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer User Badge */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-border/70 m-2 rounded-xl bg-secondary-50 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name ? user.full_name.charAt(0) : 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-secondary-900 truncate">{user?.full_name}</p>
                <p className="text-[10px] text-muted truncate">CGPA: {user?.cgpa || '0.00'}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Slide-Over Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-72 max-w-[80vw] bg-surface h-full shadow-2xl p-4 flex flex-col z-50">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-muted hover:text-secondary-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-secondary-700 hover:bg-secondary-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs flex items-center justify-center">
                    {user?.full_name ? user.full_name.charAt(0) : 'S'}
                  </div>
                  <div className="text-xs truncate max-w-[120px]">
                    <p className="font-bold text-secondary-900 truncate">{user?.full_name}</p>
                    <p className="text-[10px] text-muted truncate">{user?.department}</p>
                  </div>
                </div>
                <button onClick={logout} className="p-2 text-danger hover:bg-danger-50 rounded-lg">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation Bar ──────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border px-3 py-1.5 flex items-center justify-around shadow-lg">
        <NavLink
          to="/student/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted hover:text-secondary-900'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/student/companies"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted hover:text-secondary-900'
            }`
          }
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span>Drives</span>
        </NavLink>
        <NavLink
          to="/student/tests"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted hover:text-secondary-900'
            }`
          }
        >
          <BookOpenCheck className="w-5 h-5 mb-0.5" />
          <span>Tests</span>
        </NavLink>
        <NavLink
          to="/student/challenges"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted hover:text-secondary-900'
            }`
          }
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Streak</span>
        </NavLink>
        <NavLink
          to="/student/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-muted hover:text-secondary-900'
            }`
          }
        >
          <UserCircle className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
}
