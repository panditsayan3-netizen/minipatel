import React, { useState, useEffect } from 'react';
import { CollegeProvider, useCollege } from './context/CollegeContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/auth/LoginPage';

// Student views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentCourses } from './components/student/StudentCourses';
import { StudentNotifications } from './components/student/StudentNotifications';
import { StudentAssignments } from './components/student/StudentAssignments';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { CourseManagement } from './components/admin/CourseManagement';
import { AttendanceProvider } from './components/admin/AttendanceProvider';
import { NotificationManager } from './components/admin/NotificationManager';
import { AdminAssignments } from './components/admin/AdminAssignments';
import { UserProfile } from './components/profile/UserProfile';

const AppContent: React.FC = () => {
  const { currentUser } = useCollege();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Reset tab to dashboard when switching between student and admin roles
  useEffect(() => {
    setActiveTab('dashboard');
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const isStudent = currentUser.role === 'student';

  const renderContent = () => {
    if (activeTab === 'profile') {
      return <UserProfile onNavigate={setActiveTab} />;
    }

    if (isStudent) {
      switch (activeTab) {
        case 'attendance':
          return <StudentAttendance />;
        case 'courses':
          return <StudentCourses />;
        case 'assignments':
          return <StudentAssignments />;
        case 'notifications':
          return <StudentNotifications />;
        case 'dashboard':
        default:
          return <StudentDashboard onNavigate={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case 'students':
          return <StudentManagement />;
        case 'courses':
          return <CourseManagement />;
        case 'assignments':
          return <AdminAssignments />;
        case 'attendance_provider':
          return <AttendanceProvider />;
        case 'notifications':
          return <NotificationManager />;
        case 'dashboard':
        default:
          return <AdminDashboard onNavigate={setActiveTab} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderContent()}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 font-['Space_Grotesk']">
              Mini Patel Institute
            </span>
            <span>&bull;</span>
            <span>Accredited Academic Portal</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Session: Fall 2026</span>
            <span>&bull;</span>
            <span>Privacy & Integrity Policy</span>
            <span>&bull;</span>
            <span className="capitalize font-medium text-slate-600">Mode: {currentUser.role}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CollegeProvider>
      <AppContent />
    </CollegeProvider>
  );
}
