import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  CalendarCheck,
  BookOpen,
  Award,
  Bell,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Upload,
  User as UserIcon,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    courses,
    getStudentAttendanceStats,
    notifications,
    assignments,
    submissions,
    getStudentAssignmentSummary,
    submitAssignment,
  } = useCollege();

  if (!currentUser) return null;

  const stats = getStudentAttendanceStats(currentUser.id);
  const enrolledCourses = courses.filter((c) =>
    (currentUser.enrolledCourseIds || []).includes(c.id)
  );

  const asgSummary = getStudentAssignmentSummary(currentUser.id);

  // Filter student's assignments with status
  const studentAssignments = assignments
    .filter((a) => (currentUser.enrolledCourseIds || []).includes(a.courseId))
    .map((asg) => {
      const course = courses.find((c) => c.id === asg.courseId);
      const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === currentUser.id);
      const dueDateObj = new Date(asg.dueDate + 'T23:59:59');
      const now = new Date();
      const diffDays = Math.ceil((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...asg,
        course,
        sub,
        diffDays,
        isOverdue: dueDateObj < now && !sub,
      };
    });

  // Relevant notifications
  const studentNotifs = notifications.filter(
    (n) => n.targetRole === 'all' || n.targetRole === 'student'
  );
  const unreadNotifs = studentNotifs.filter((n) => !n.readBy.includes(currentUser.id));

  // Determine attendance health badge
  const isHealthy = stats.overallPercentage >= 75;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-500/30 text-xs font-semibold text-blue-200">
              <span>{currentUser.semester || 'Semester 5'}</span>
              <span>&bull;</span>
              <span>{currentUser.department || 'Computer Science'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Space_Grotesk']">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-sm text-blue-100/80 max-w-xl">
              Student ID: <span className="font-mono font-semibold text-white">{currentUser.rollNo}</span> &bull; {currentUser.email}
            </p>
            <div className="pt-1">
              <button
                type="button"
                id="btn-student-edit-profile"
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors shadow-2xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Edit Profile & Contact Details</span>
              </button>
            </div>
          </div>

          {/* Quick Attendance Pill */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg">
              {stats.overallPercentage}%
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Attendance Status</p>
              <p className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                {isHealthy ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>In Good Standing</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <span>Attendance Shortage</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div
          id="card-stat-attendance"
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
            <div className={`p-2 rounded-lg ${isHealthy ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {stats.overallPercentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {stats.totalAttended}/{stats.totalClasses} classes
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline flex items-center gap-1">
            <span>View detailed log</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Enrolled Courses */}
        <div
          id="card-stat-courses"
          onClick={() => onNavigate('courses')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {enrolledCourses.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {enrolledCourses.reduce((acc, c) => acc + c.credits, 0)} Total Credits
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline flex items-center gap-1">
            <span>View syllabus & modules</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Coursework & Assignments */}
        <div
          id="card-stat-assignments"
          onClick={() => onNavigate('assignments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {asgSummary.pending}
            </span>
            <span className="text-xs text-amber-700 font-bold">
              {asgSummary.pending > 0 ? `${asgSummary.pending} Pending` : 'All Completed'}
            </span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
            <span>{asgSummary.graded} evaluated &bull; Submit deliverables</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Campus Notices */}
        <div
          id="card-stat-notifs"
          onClick={() => onNavigate('notifications')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Announcements</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
              {studentNotifs.length}
            </span>
            {unreadNotifs.length > 0 ? (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                {unreadNotifs.length} New
              </span>
            ) : (
              <span className="text-xs text-slate-400">All caught up</span>
            )}
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium group-hover:underline flex items-center gap-1">
            <span>Open notice board</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Subject-Wise Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Attendance Status & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Attendance Breakdown Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Course Attendance Performance
                </h2>
                <p className="text-xs text-slate-500">
                  Minimum mandatory requirement is 75% per course
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {stats.subjects.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No enrolled courses with attendance yet.</p>
              ) : (
                stats.subjects.map((sub) => {
                  const subHealthy = sub.percentage >= 75;
                  return (
                    <div key={sub.course.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white border border-slate-200 text-slate-700">
                            {sub.course.code}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 truncate max-w-xs">
                            {sub.course.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-slate-500">
                            {sub.attendedClasses} / {sub.totalClasses} Sessions
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full ${
                              subHealthy
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sub.percentage}%
                          </span>
                        </div>
                      </div>
                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            subHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Coursework & Assignment Deadlines */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                    Upcoming Deliverables & Deadlines
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active problem sets, lab reports, and programming projects
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>All Assignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {studentAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No assignments assigned yet.</p>
              ) : (
                studentAssignments.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('assignments')}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white border border-slate-200 text-indigo-700">
                          {item.course?.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                      <div className="text-right text-[11px]">
                        <span className="text-slate-400 block">Due: {item.dueDate}</span>
                        <span className="font-semibold text-slate-700">{item.maxMarks} Marks</span>
                      </div>

                      {item.sub ? (
                        item.sub.status === 'graded' ? (
                          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {item.sub.grade}/{item.maxMarks}
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Submitted</span>
                          </span>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            submitAssignment(
                              item.id,
                              currentUser.id,
                              'Deliverable submitted from dashboard quick action.'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Enrolled Courses & Lecture Venues
                </h2>
              </div>
              <span className="text-xs text-slate-400">Semester 5 (Active)</span>
            </div>

            <div className="divide-y divide-slate-100">
              {enrolledCourses.map((c) => (
                <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{c.title}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {c.schedule}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.room}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-600 font-medium block">{c.instructor}</span>
                    <span className="text-slate-400">{c.credits} Credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Announcements & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Notice Board */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Notice Board</span>
              </h2>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                See All
              </button>
            </div>

            <div className="space-y-3.5">
              {studentNotifs.slice(0, 4).map((notif) => {
                const isUnread = !notif.readBy.includes(currentUser.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => onNavigate('notifications')}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {notif.category}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Unread" />
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">{notif.createdAt}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Support / Contact Card */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 text-sm">Academic Helpdesk</p>
            <p>For discrepancies in attendance records or enrollment issues, contact your department coordinator:</p>
            <div className="pt-2 border-t border-slate-200">
              <p className="font-medium text-slate-700">Dean of Student Affairs</p>
              <p className="text-slate-500">academics@apex.college.edu &bull; Room 101 Administration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
