import React, { useState } from 'react';
import { useCollege } from '../context/CollegeContext';
import {
  GraduationCap,
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Bell,
  Users,
  FolderPlus,
  ClipboardList,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, switchUser, users, notifications, assignments, submissions, resetDemoData } = useCollege();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';

  const studentPendingCount = isStudent
    ? assignments.filter((a) => {
        const isEnrolled = (currentUser.enrolledCourseIds || []).includes(a.courseId);
        if (!isEnrolled || a.status === 'closed') return false;
        const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === currentUser.id);
        return !sub;
      }).length
    : 0;

  const adminPendingGradingCount = !isStudent
    ? submissions.filter((s) => s.status === 'submitted').length
    : 0;

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText, badge: studentPendingCount },
    { id: 'notifications', label: 'Announcements', icon: Bell },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'courses', label: 'Courses Management', icon: FolderPlus },
    { id: 'assignments', label: 'Assignments Hub', icon: FileText, badge: adminPendingGradingCount },
    { id: 'attendance_provider', label: 'Attendance Provider', icon: ClipboardList },
    { id: 'notifications', label: 'Broadcast Notices', icon: Bell },
  ];

  const navItems = isStudent ? studentNav : adminNav;

  // Unread notification count for current user
  const unreadCount = notifications.filter(
    (n) =>
      (n.targetRole === 'all' || n.targetRole === currentUser.role) &&
      !n.readBy.includes(currentUser.id)
  ).length;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight font-['Space_Grotesk']">
                Apex Institute
              </span>
              <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
                {isStudent ? 'Student Portal' : 'Admin Operations'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full leading-none">
                      {unreadCount}
                    </span>
                  )}
                  {item.id === 'assignments' && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Badge / Switcher */}
            <div className="relative">
              <button
                id="btn-demo-switch-user"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                title="Switch between student and admin demo profiles"
              >
                {isStudent ? (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span className="capitalize">{currentUser.role} Mode</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
                    Switch Active Account
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        id={`switch-user-${u.id}`}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                          setActiveTab('dashboard');
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-blue-50/70 text-blue-700 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{u.role} {u.rollNo ? `(${u.rollNo})` : ''}</p>
                        </div>
                        {u.id === currentUser.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100 px-3">
                    <button
                      onClick={() => {
                        resetDemoData();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-2 py-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Sample Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                id="btn-navbar-notif"
                onClick={() => handleNavClick('notifications')}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            </div>

            {/* User Profile avatar & logout */}
            <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.rollNo || currentUser.department}</p>
              </div>
              <button
                id="btn-navbar-logout"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Sign out of portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
                {item.id === 'assignments' && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Logged in as {currentUser.username}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
