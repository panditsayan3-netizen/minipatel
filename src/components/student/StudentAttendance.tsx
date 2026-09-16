import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { AttendanceStatus } from '../../types';

export const StudentAttendance: React.FC = () => {
  const { currentUser, courses, attendance, getStudentAttendanceStats } = useCollege();
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  if (!currentUser) return null;

  const stats = getStudentAttendanceStats(currentUser.id);

  // All attendance records for this student
  const studentRecords = attendance
    .filter((a) => a.studentId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered records
  const filteredRecords = studentRecords.filter((rec) => {
    if (selectedCourseFilter !== 'all' && rec.courseId !== selectedCourseFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  // Calculate safety margin for 75% requirement
  // 75% threshold: (attended + needed) / (total + needed) >= 0.75
  // attended + needed >= 0.75 * total + 0.75 * needed
  // 0.25 * needed >= 0.75 * total - attended
  // needed >= (0.75 * total - attended) / 0.25 = 3 * total - 4 * attended
  const neededClassesToReach75 = Math.max(
    0,
    Math.ceil(3 * stats.totalClasses - 4 * stats.totalAttended)
  );

  // If already above 75%, how many can they afford to miss?
  // attended / (total + miss) >= 0.75
  // attended >= 0.75 * total + 0.75 * miss
  // miss <= (attended - 0.75 * total) / 0.75 = (attended / 0.75) - total
  const classesCanAffordToMiss = stats.overallPercentage >= 75
    ? Math.max(0, Math.floor((stats.totalAttended / 0.75) - stats.totalClasses))
    : 0;

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present</span>
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Late</span>
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Absent</span>
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Excused</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Attendance Record
          </h1>
          <p className="text-sm text-slate-500">
            Semester 5 &bull; Minimum 75% attendance mandatory for exam eligibility
          </p>
        </div>
      </div>

      {/* Summary KPI Cards & Safe Margin Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Percentage Gauge */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Cumulative Percentage
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {stats.overallPercentage}%
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                stats.overallPercentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {stats.overallPercentage >= 75 ? 'Eligible' : 'At Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {stats.totalAttended} attended out of {stats.totalClasses} total lectures
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={stats.overallPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}
                strokeDasharray={`${stats.overallPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <CalendarCheck className="w-6 h-6 text-slate-400 absolute" />
          </div>
        </div>

        {/* Detailed counts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Attendance Distribution
          </span>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <p className="text-lg font-bold text-emerald-800 font-['Space_Grotesk']">{stats.totalAttended - stats.totalLate}</p>
              <p className="text-[11px] text-emerald-600 font-medium">Present</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
              <p className="text-lg font-bold text-amber-800 font-['Space_Grotesk']">{stats.totalLate}</p>
              <p className="text-[11px] text-amber-600 font-medium">Late</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
              <p className="text-lg font-bold text-rose-800 font-['Space_Grotesk']">{stats.totalAbsent}</p>
              <p className="text-[11px] text-rose-600 font-medium">Absent</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Late arrivals count towards attendance with faculty remark
          </p>
        </div>

        {/* Calculator / Safety Margin Card */}
        <div className={`p-6 rounded-xl border shadow-xs flex flex-col justify-between ${
          stats.overallPercentage >= 75
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            : 'bg-rose-50/60 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center space-x-2">
            {stats.overallPercentage >= 75 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              {stats.overallPercentage >= 75 ? 'Safe Attendance Buffer' : 'Shortage Warning'}
            </span>
          </div>

          <div className="my-2">
            {stats.overallPercentage >= 75 ? (
              <>
                <p className="text-sm font-semibold">
                  You can safely miss <span className="text-base font-bold text-emerald-700 font-mono">{classesCanAffordToMiss}</span> more class{classesCanAffordToMiss === 1 ? '' : 'es'} without dropping below 75%.
                </p>
                <p className="text-xs text-emerald-700/80 mt-1">
                  Keep maintaining consistent attendance for distinction honors.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">
                  You must attend the next <span className="text-base font-bold text-rose-700 font-mono">{neededClassesToReach75}</span> consecutive classes to recover to 75%.
                </p>
                <p className="text-xs text-rose-700/80 mt-1">
                  Submit medical or official absence certificates to the HOD office.
                </p>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
            University Regulation Clause 4.2 &bull; Exam Clearance
          </div>
        </div>
      </div>

      {/* Subject-by-Subject Breakdown Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] mb-4">
          Course-Wise Attendance Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.subjects.map((sub) => {
            const isGood = sub.percentage >= 75;
            return (
              <div
                key={sub.course.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {sub.course.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {sub.course.title}
                    </h3>
                    <p className="text-xs text-slate-500">{sub.course.instructor}</p>
                  </div>
                  <span
                    className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                      isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Sessions Attended</span>
                    <span className="font-semibold text-slate-700">
                      {sub.attendedClasses} / {sub.totalClasses}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <span>{sub.course.schedule}</span>
                  <button
                    onClick={() => setSelectedCourseFilter(sub.course.id)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Filter logs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filterable Detailed Attendance Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Session Attendance Logs
            </h2>
            <p className="text-xs text-slate-500">
              Showing official faculty submissions recorded in system
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter */}
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="select-attendance-course-filter"
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="all">All Courses</option>
                {courses
                  .filter((c) => (currentUser.enrolledCourseIds || []).includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="select-attendance-status-filter"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present Only</option>
                <option value="late">Late Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>

            {(selectedCourseFilter !== 'all' || selectedStatusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCourseFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="text-xs text-blue-600 hover:underline px-1 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Faculty Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No attendance records match your active filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const course = courses.find((c) => c.id === rec.courseId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                            {course?.code || 'N/A'}
                          </span>
                          <span className="font-semibold text-slate-800">{course?.title || 'Unknown Course'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {course?.instructor || 'Faculty'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(rec.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic">
                        {rec.remarks || '&mdash;'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
