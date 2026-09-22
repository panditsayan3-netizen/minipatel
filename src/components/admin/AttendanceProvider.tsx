import React, { useState, useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  ClipboardList,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Save,
  CheckCheck,
  RotateCcw,
  Users,
  AlertCircle,
} from 'lucide-react';
import { AttendanceStatus } from '../../types';

interface StudentAttendanceRow {
  studentId: string;
  name: string;
  rollNo: string;
  avatar?: string;
  status: AttendanceStatus;
  remarks: string;
}

export const AttendanceProvider: React.FC = () => {
  const { courses, users, attendance, markAttendance } = useCollege();

  // Selected Course
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  // Selected Date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [studentRows, setStudentRows] = useState<StudentAttendanceRow[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const students = users.filter((u) => u.role === 'student');

  // Load enrolled students and existing records whenever course or date changes
  useEffect(() => {
    if (!selectedCourseId) return;

    // Students enrolled in this course
    const enrolled = students.filter((s) =>
      (s.enrolledCourseIds || []).includes(selectedCourseId)
    );

    // Check if attendance already recorded for this course & date
    let hasExistingRecord = false;
    const rows: StudentAttendanceRow[] = enrolled.map((st) => {
      const existing = attendance.find(
        (a) => a.studentId === st.id && a.courseId === selectedCourseId && a.date === selectedDate
      );
      if (existing) {
        hasExistingRecord = true;
      }

      return {
        studentId: st.id,
        name: st.name,
        rollNo: st.rollNo || 'N/A',
        avatar: st.avatar,
        status: existing ? existing.status : 'present',
        remarks: existing?.remarks || '',
      };
    });

    setStudentRows(rows);
    setSaveSuccess(false);
    setIsSaved(hasExistingRecord);
  }, [selectedCourseId, selectedDate, courses, users, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
    );
    setIsSaved(false);
    setSaveSuccess(false);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudentRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, remarks } : row))
    );
    setIsSaved(false);
    setSaveSuccess(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudentRows((prev) => prev.map((row) => ({ ...row, status })));
    setIsSaved(false);
    setSaveSuccess(false);
  };

  const handleSaveAttendance = () => {
    if (!selectedCourseId || !selectedDate || studentRows.length === 0) return;

    const payload = studentRows.map((row) => ({
      studentId: row.studentId,
      courseId: selectedCourseId,
      date: selectedDate,
      status: row.status,
      remarks: row.remarks ? row.remarks : undefined,
    }));

    markAttendance(payload);
    setIsSaved(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Counts for active batch
  const presentCount = studentRows.filter((r) => r.status === 'present').length;
  const lateCount = studentRows.filter((r) => r.status === 'late').length;
  const absentCount = studentRows.filter((r) => r.status === 'absent').length;

  // Past dates with recorded attendance for this course
  const recordedDatesForCourse: string[] = Array.from(
    new Set<string>(attendance.filter((a) => a.courseId === selectedCourseId).map((a) => a.date))
  ).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Attendance Provider & Registry
          </h1>
          <p className="text-sm text-slate-500">
            Conduct roll-call, mark student attendance records, and sync directly with student portals
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Attendance saved and updated for all students!</span>
          </div>
        )}
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Course Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Course Offering *</span>
          </label>
          <select
            id="select-attendance-provider-course"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title} ({c.department})
              </option>
            ))}
          </select>
        </div>

        {/* Date Select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Session Date *</span>
          </label>
          <input
            id="input-attendance-provider-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Course Meta Info */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex flex-col justify-center">
          <p className="font-bold text-slate-800 truncate">
            {selectedCourse?.instructor || 'Instructor'}
          </p>
          <p className="text-slate-500 truncate mt-0.5">
            {selectedCourse?.room || 'Room'} &bull; {selectedCourse?.schedule || 'Schedule'}
          </p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            {studentRows.length} Enrolled Student{studentRows.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Batch Stats & Bulk Actions Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Real-time Counts */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{lateCount} Late</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{absentCount} Absent</span>
          </div>
        </div>

        {/* Bulk Action Buttons & Save */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-mark-all-present"
            type="button"
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Mark All Present
          </button>
          <button
            id="btn-mark-all-absent"
            type="button"
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Mark All Absent
          </button>
          <button
            id="btn-save-attendance-records"
            type="button"
            onClick={handleSaveAttendance}
            disabled={studentRows.length === 0}
            className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
              isSaved || saveSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40 shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSaved || saveSuccess ? (
              <>
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Attendance Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Roster Roll-Call Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {studentRows.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No students enrolled in this course.</p>
            <p className="text-xs text-slate-400 mt-1">
              Go to &quot;Students Directory&quot; to enroll students in this course.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student & ID</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Instructor Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/50 transition-colors">
                    {/* Student info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={row.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`}
                          alt={row.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{row.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">{row.rollNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Toggle Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                            row.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                            row.status === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                            row.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>

                    {/* Remarks field */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                        placeholder="e.g. Participated actively, excused note..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom submit button */}
        {studentRows.length > 0 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Changes will immediately update each student&apos;s personal attendance dashboard.
            </span>
            <button
              id="btn-bottom-save-attendance-records"
              type="button"
              onClick={handleSaveAttendance}
              className={`inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer ${
                isSaved || saveSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40 shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSaved || saveSuccess ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Attendance Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Submit & Save Attendance</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Past Recorded Sessions for this course */}
      {recordedDatesForCourse.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Previously Recorded Sessions for {selectedCourse?.code}
          </h3>
          <div className="flex flex-wrap gap-2">
            {recordedDatesForCourse.map((date) => {
              const count = attendance.filter(
                (a) => a.courseId === selectedCourseId && a.date === date
              ).length;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedDate === date
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {date} ({count} logs)
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
