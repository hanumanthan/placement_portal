import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  Users,
  FileCheck2,
  BookOpenCheck,
  HelpCircle,
  MessageSquareText,
  Trophy,
  Languages,
  Video,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Code2,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Companies', path: '/admin/companies', icon: Building2 },
  { name: 'Placement Drives', path: '/admin/drives', icon: CalendarCheck2 },
  { name: 'Manage Students', path: '/admin/students', icon: Users },
  { name: 'Applications', path: '/admin/applications', icon: FileCheck2 },
  { name: 'Aptitude Tests', path: '/admin/tests', icon: BookOpenCheck },
  { name: 'Previous Questions', path: '/admin/questions', icon: HelpCircle },
  { name: 'Interview Experiences', path: '/admin/experiences', icon: MessageSquareText },
  { name: 'Daily Challenges', path: '/admin/challenges', icon: Trophy },
  { name: 'Coding Challenges', path: '/admin/coding', icon: Code2 },
  { name: 'Vocabulary', path: '/admin/vocabulary', icon: Languages },
  { name: 'Videos', path: '/admin/videos', icon: Video },
  { name: 'Resources', path: '/admin/resources', icon: FileText },
  { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/drives?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* ─── Top Admin Navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white">Campus Placement</span>
              <span className="text-[10px] uppercase font-bold text-primary block -mt-1 tracking-wider">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Global Admin Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search companies, students, tests, drives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </form>
        </div>

        {/* Top Right Admin Actions */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative"
            title="Broadcast Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/40">
                PO
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                {user?.name || 'Admin'}
              </span>
            </button>

            {adminMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setAdminMenuOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Placement Officer'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
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
          className={`hidden md:flex flex-col border-r border-slate-800 bg-slate-900/60 transition-all duration-200 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="p-3 flex justify-end border-b border-slate-800/70">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-800 m-2 rounded-xl bg-slate-900 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                👑
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Placement Cell</p>
                <p className="text-[10px] text-slate-400 truncate">Administrator Mode</p>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Slide-Over Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full shadow-2xl p-4 flex flex-col z-50 border-r border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm text-white">Admin Controls</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {ADMIN_NAV_ITEMS.map((item) => {
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
                            : 'text-slate-300 hover:bg-slate-800'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs truncate">
                  <p className="font-bold text-white">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
                <button onClick={logout} className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
