import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Bell,
  UserPlus,
  FolderPlus,
  ClipboardList,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Building2,
  Calendar,
  FileText,
  Clock,
  Award,
  ShieldCheck,
  GraduationCap,
  Plus,
  ShieldPlus,
  User as UserIcon,
} from 'lucide-react';
import { FacultyManagementSection } from './FacultyManagementSection';
import { AddAdminFacultyModal } from './AddAdminFacultyModal';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { users, courses, attendance, notifications, assignments, submissions, currentUser } = useCollege();
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  const students = users.filter((u) => u.role === 'student');
  const staffMembers = users.filter((u) => u.role === 'admin');
  const totalStudents = students.length;
  const totalStaff = staffMembers.length;
  const totalCourses = courses.length;

  // Submissions requiring evaluation
  const pendingGradingCount = submissions.filter((s) => s.status === 'submitted').length;
  const totalGradedCount = submissions.filter((s) => s.status === 'graded').length;

  // Calculate overall institution attendance rate
  const totalAttended = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const totalRecords = attendance.length;
  const avgAttendance = totalRecords > 0 ? Math.round((totalAttended / totalRecords) * 100) : 100;

  // Department counts
  const deptCounts: { [key: string]: number } = {};
  students.forEach((s) => {
    const dept = s.department || 'General Science';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-500/30 text-xs font-semibold text-indigo-200">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Academic Affairs & Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Space_Grotesk']">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Real-time oversight of student enrollments, course deliverables, faculty grading queues, and campus announcements.
            </p>
            <div className="pt-1">
              <button
                type="button"
                id="btn-admin-edit-profile"
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors shadow-2xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Profile & Contact Details</span>
              </button>
            </div>
          </div>

          {/* Quick Action Pill */}
          <div className="flex flex-wrap gap-2">
            <button
              id="btn-quick-add-staff"
              onClick={() => setIsAddStaffModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <ShieldPlus className="w-4 h-4" />
              <span>+ Add Admin / Faculty</span>
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Assignments Hub {pendingGradingCount > 0 && `(${pendingGradingCount})`}</span>
            </button>
            <button
              onClick={() => onNavigate('attendance_provider')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div
          id="admin-stat-students"
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {totalStudents}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
            <span>Student directory</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Faculty & Admin Staff */}
        <div
          id="admin-stat-faculty"
          onClick={() => setIsAddStaffModalOpen(true)}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty & Admins</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {totalStaff}
            </span>
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
              <Plus className="w-3 h-3" />
              <span>Add New</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium group-hover:underline flex items-center gap-1">
            <span>Roster & credentials</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Assignments & Grading Queue */}
        <div
          id="admin-stat-assignments"
          onClick={() => onNavigate('assignments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments Hub</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {assignments.length}
            </span>
            {pendingGradingCount > 0 ? (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {pendingGradingCount} to Grade
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600">
                {totalGradedCount} Evaluated
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
            <span>Review & grade turn-ins</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Institutional Attendance Rate */}
        <div
          id="admin-stat-attendance"
          onClick={() => onNavigate('attendance_provider')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional Attendance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {avgAttendance}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalRecords} records logged
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
            <span>Launch attendance provider</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Circulars & Notices */}
        <div
          id="admin-stat-notifs"
          onClick={() => onNavigate('notifications')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Circulars</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {notifications.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {notifications.filter((n) => n.isPinned).length} Pinned
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
            <span>Broadcast new circular</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Administrative Operations Hub
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            id="btn-hub-add-faculty"
            onClick={() => setIsAddStaffModalOpen(true)}
            className="flex items-center space-x-3 p-3 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-300 hover:text-amber-900 transition-all text-xs font-semibold text-amber-800 text-left cursor-pointer"
          >
            <ShieldPlus className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Add Admin/Faculty</span>
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/70 hover:border-indigo-200 hover:text-indigo-800 transition-all text-xs font-semibold text-slate-700 text-left"
          >
            <UserPlus className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Enroll Student</span>
          </button>
          <button
            onClick={() => onNavigate('courses')}
            className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/70 hover:border-blue-200 hover:text-blue-800 transition-all text-xs font-semibold text-slate-700 text-left"
          >
            <FolderPlus className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Create Course</span>
          </button>
          <button
            onClick={() => onNavigate('assignments')}
            className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-purple-50/70 hover:border-purple-200 hover:text-purple-800 transition-all text-xs font-semibold text-slate-700 text-left"
          >
            <FileText className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Manage Assignments</span>
          </button>
          <button
            onClick={() => onNavigate('attendance_provider')}
            className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 hover:text-emerald-800 transition-all text-xs font-semibold text-slate-700 text-left"
          >
            <ClipboardList className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Take Attendance</span>
          </button>
          <button
            onClick={() => onNavigate('notifications')}
            className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-amber-50/70 hover:border-amber-200 hover:text-amber-800 transition-all text-xs font-semibold text-slate-700 text-left"
          >
            <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      {/* Faculty & Academic Administration Management Roster */}
      <FacultyManagementSection />

      {/* Main Split: Department Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Department Distribution & Courses Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Assignments Quick Overview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Coursework & Assignment Deliverables
                </h2>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Assignments Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 3).map((asg) => {
                const course = courses.find((c) => c.id === asg.courseId);
                const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
                const pendingCount = asgSubmissions.filter((s) => s.status === 'submitted').length;
                return (
                  <div
                    key={asg.id}
                    onClick={() => onNavigate('assignments')}
                    className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white border border-slate-200 text-indigo-700">
                          {course?.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{asg.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Due: {asg.dueDate} &bull; Max: {asg.maxMarks} Marks &bull; {asgSubmissions.length} Submissions Logged
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {pendingCount > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {pendingCount} Awaiting Review
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          All Evaluated
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] mb-3">
              Department Student Enrollments
            </h2>
            <div className="space-y-3">
              {Object.entries(deptCounts).map(([dept, count]) => {
                const pct = Math.round((count / totalStudents) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{dept}</span>
                      <span className="text-slate-500 font-mono">
                        {count} student{count === 1 ? '' : 's'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Courses Quick List */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                Active Curriculum Offerings
              </h2>
              <button
                onClick={() => onNavigate('courses')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Manage All ({courses.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {courses.slice(0, 4).map((c) => {
                // Count enrolled students
                const enrolledCount = students.filter((s) =>
                  (s.enrolledCourseIds || []).includes(c.id)
                ).length;

                return (
                  <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {c.code}
                        </span>
                        <span className="font-semibold text-slate-800">{c.title}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{c.instructor} &bull; {c.room}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{enrolledCount} Students</span>
                      <p className="text-slate-400">{c.credits} Credits</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Attendance History & Broadcasts */}
        <div className="space-y-6">
          {/* Recent Attendance Session Logs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Recent Attendance</span>
              </h2>
              <button
                onClick={() => onNavigate('attendance_provider')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Log Attendance
              </button>
            </div>

            <div className="space-y-3">
              {attendance.slice(0, 5).map((a) => {
                const student = students.find((s) => s.id === a.studentId);
                const course = courses.find((c) => c.id === a.courseId);
                return (
                  <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {student?.name || 'Student'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {course?.code} &bull; {a.date}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                      a.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : a.status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Published Circulars */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Active Broadcasts</span>
              </h2>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Broadcast
              </button>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {n.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin / Faculty Modal */}
      <AddAdminFacultyModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
      />
    </div>
  );
};
