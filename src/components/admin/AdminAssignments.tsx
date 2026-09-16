import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  X,
  Send,
  Save,
  Paperclip,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Assignment, AssignmentSubmission } from '../../types';

export const AdminAssignments: React.FC = () => {
  const {
    courses,
    users,
    assignments,
    submissions,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
  } = useCollege();

  const [activeTab, setActiveTab] = useState<'assignments' | 'grading'>('assignments');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    courseId: courses[0]?.id || '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
    attachmentName: '',
    submissionType: 'both' as 'text' | 'file' | 'both',
    status: 'active' as 'active' | 'closed',
  });

  // Selected assignment for grading drawer/modal
  const [inspectingAssignment, setInspectingAssignment] = useState<Assignment | null>(null);

  // Grade dialog state
  const [gradingSubmission, setGradingSubmission] = useState<{
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    maxMarks: number;
    grade: number;
    feedback: string;
  } | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  // Statistics
  const pendingGradingCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'submitted').length;
  }, [submissions]);

  const gradedCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'graded').length;
  }, [submissions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
    const dueDateStr = inTwoWeeks.toISOString().split('T')[0];

    setFormData({
      courseId: courses[0]?.id || '',
      title: '',
      description: '',
      dueDate: dueDateStr,
      maxMarks: 100,
      attachmentName: '',
      submissionType: 'both',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setFormData({
      courseId: asg.courseId,
      title: asg.title,
      description: asg.description,
      dueDate: asg.dueDate,
      maxMarks: asg.maxMarks,
      attachmentName: asg.attachmentName || '',
      submissionType: asg.submissionType,
      status: asg.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.courseId || !formData.dueDate) {
      alert('Please fill in all mandatory fields (Course, Title, Due Date).');
      return;
    }

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        ...formData,
        attachmentName: formData.attachmentName.trim() || undefined,
      });
      showToast(`Assignment "${formData.title}" updated successfully.`);
    } else {
      addAssignment({
        ...formData,
        attachmentName: formData.attachmentName.trim() || undefined,
      });
      showToast(`New assignment "${formData.title}" created.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteAssignment(id);
    setDeletingId(null);
    showToast('Assignment and associated submissions deleted.');
  };

  const handleOpenGradingDialog = (sub: AssignmentSubmission, asg: Assignment, studentName: string) => {
    setGradingSubmission({
      submissionId: sub.id,
      studentName,
      assignmentTitle: asg.title,
      maxMarks: asg.maxMarks,
      grade: sub.grade !== undefined ? sub.grade : asg.maxMarks,
      feedback: sub.feedback || '',
    });
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    if (gradingSubmission.grade < 0 || gradingSubmission.grade > gradingSubmission.maxMarks) {
      alert(`Grade must be between 0 and ${gradingSubmission.maxMarks}.`);
      return;
    }

    gradeSubmission(
      gradingSubmission.submissionId,
      Number(gradingSubmission.grade),
      gradingSubmission.feedback.trim()
    );

    showToast(`Grade published for ${gradingSubmission.studentName}.`);
    setGradingSubmission(null);
  };

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      if (selectedCourseFilter !== 'all' && asg.courseId !== selectedCourseFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const course = courses.find((c) => c.id === asg.courseId);
        const matchesTitle = asg.title.toLowerCase().includes(q);
        const matchesDesc = asg.description.toLowerCase().includes(q);
        const matchesCourse = course?.code.toLowerCase().includes(q) || course?.title.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCourse) return false;
      }
      return true;
    });
  }, [assignments, selectedCourseFilter, searchQuery, courses]);

  // Submissions queue for grading view
  const submissionsQueue = useMemo(() => {
    return submissions.map((sub) => {
      const asg = assignments.find((a) => a.id === sub.assignmentId);
      const student = students.find((s) => s.id === sub.studentId);
      const course = courses.find((c) => c.id === asg?.courseId);
      return {
        ...sub,
        assignment: asg,
        student,
        course,
      };
    }).filter((item) => {
      if (!item.assignment) return false;
      if (selectedCourseFilter !== 'all' && item.course?.id !== selectedCourseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = item.student?.name.toLowerCase().includes(q) || item.student?.rollNo?.toLowerCase().includes(q);
        const matchAsg = item.assignment.title.toLowerCase().includes(q);
        if (!matchStudent && !matchAsg) return false;
      }
      return true;
    });
  }, [submissions, assignments, students, courses, selectedCourseFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-500/30 text-xs font-semibold text-indigo-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Academic Assessment Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Space_Grotesk']">
              Assignments & Deliverables Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Publish project requirements, specify submission criteria, track student turn-ins across departments, and issue grades with individualized feedback.
            </p>
          </div>

          {/* Quick Create Action */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-admin-create-assignment"
              onClick={handleOpenCreate}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Assignments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Assignments</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {assignments.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {assignments.filter((a) => a.status === 'active').length} Active Deliverables
          </p>
        </div>

        {/* Pending Grading */}
        <div
          onClick={() => setActiveTab('grading')}
          className={`p-5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            pendingGradingCount > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-100/50'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Pending Evaluation</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {pendingGradingCount}
          </div>
          <p className="text-xs text-amber-800 font-medium mt-1">
            {pendingGradingCount > 0 ? 'Submissions awaiting marks' : 'All submissions evaluated'}
          </p>
        </div>

        {/* Evaluated Submissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Evaluated Submissions</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {gradedCount}
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            Marks & feedback dispatched
          </p>
        </div>

        {/* Total Students Submitting */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Participating Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {students.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 3 academic programs</p>
        </div>
      </div>

      {/* Main Filter & Navigation Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 p-1 bg-slate-100 rounded-lg">
          <button
            id="tab-admin-assignments-roster"
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'assignments'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assignments Roster ({assignments.length})
          </button>
          <button
            id="tab-admin-grading-queue"
            onClick={() => setActiveTab('grading')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'grading'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Submissions & Grading</span>
            {pendingGradingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingGradingCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <select
              id="select-admin-course-filter"
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments & Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-admin-assignment-search"
              type="text"
              placeholder={activeTab === 'assignments' ? "Search assignments..." : "Search student submissions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Assignments Roster */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 font-['Space_Grotesk']">
                No assignments found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active or historical assignments match your query. Create one to get started.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Assignment</span>
              </button>
            </div>
          ) : (
            filteredAssignments.map((asg) => {
              const course = courses.find((c) => c.id === asg.courseId);
              // Count enrolled students and submissions
              const enrolledStudents = students.filter((s) =>
                (s.enrolledCourseIds || []).includes(asg.courseId)
              );
              const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
              const submittedCount = asgSubmissions.length;
              const pendingGradeCount = asgSubmissions.filter((s) => s.status === 'submitted').length;
              const completedGradeCount = asgSubmissions.filter((s) => s.status === 'graded').length;

              return (
                <div
                  key={asg.id}
                  id={`admin-asg-card-${asg.id}`}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:border-slate-300 transition-all p-5 sm:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {course?.code || 'Course'}
                        </span>
                        <span className="text-xs font-medium text-slate-500 truncate max-w-xs">
                          {course?.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            asg.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {asg.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Max: {asg.maxMarks} pts
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                        {asg.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {asg.description}
                      </p>

                      {asg.attachmentName && (
                        <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                          <span>Attachment: {asg.attachmentName}</span>
                        </div>
                      )}
                    </div>

                    {/* Right submission stats & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 shrink-0">
                      {/* Submissions counter pill */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right min-w-[180px]">
                        <div className="text-xs font-bold text-slate-700">
                          {submittedCount} / {enrolledStudents.length} Submitted
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-end gap-2">
                          <span className="text-amber-600 font-semibold">{pendingGradeCount} to grade</span>
                          <span>&bull;</span>
                          <span className="text-emerald-600 font-semibold">{completedGradeCount} graded</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          id={`btn-view-submissions-${asg.id}`}
                          onClick={() => setInspectingAssignment(asg)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Inspect Submissions</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(asg)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit assignment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingId(asg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Due: {asg.dueDate} (23:59 PM)</span>
                    <span>Assigned: {asg.assignedDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Grading Queue */}
      {activeTab === 'grading' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 font-['Space_Grotesk']">
              All Student Turn-ins ({submissionsQueue.length})
            </h2>
            <span className="text-xs text-slate-400">
              {pendingGradingCount} awaiting evaluation
            </span>
          </div>

          {submissionsQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No submissions found for the current selection.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissionsQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={
                        item.student?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.student?.name}`
                      }
                      alt={item.student?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{item.student?.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          ({item.student?.rollNo})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {item.course?.code}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-900">
                        {item.assignment?.title}
                      </p>
                      {item.submissionText && (
                        <p className="text-xs text-slate-600 line-clamp-1 italic max-w-xl">
                          "{item.submissionText}"
                        </p>
                      )}
                      {item.attachmentName && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>{item.attachmentName}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">Submitted: {item.submittedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                    {item.status === 'graded' ? (
                      <div className="text-right">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {item.grade} / {item.assignment?.maxMarks}
                          </span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">Evaluated</p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending Review</span>
                      </span>
                    )}

                    <button
                      onClick={() =>
                        handleOpenGradingDialog(item, item.assignment!, item.student?.name || 'Student')
                      }
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      {item.status === 'graded' ? 'Edit Grade' : 'Grade Deliverable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspect Assignment Submissions Modal */}
      {inspectingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Course Submissions Roster
                </span>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {inspectingAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enrolled Students Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Maximum Marks: {inspectingAssignment.maxMarks}</span>
                <span>Due Date: {inspectingAssignment.dueDate}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {students
                  .filter((s) => (s.enrolledCourseIds || []).includes(inspectingAssignment.courseId))
                  .map((student) => {
                    const sub = submissions.find(
                      (s) =>
                        s.assignmentId === inspectingAssignment.id && s.studentId === student.id
                    );

                    return (
                      <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              student.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`
                            }
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-800">{student.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({student.rollNo})
                              </span>
                            </div>
                            {sub ? (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Submitted {sub.submittedAt} &bull;{' '}
                                {sub.attachmentName || 'Text deliverable'}
                              </p>
                            ) : (
                              <p className="text-[11px] text-rose-500 mt-0.5">Not submitted yet</p>
                            )}
                          </div>
                        </div>

                        <div>
                          {sub ? (
                            <div className="flex items-center space-x-3">
                              {sub.status === 'graded' ? (
                                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                                  {sub.grade}/{inspectingAssignment.maxMarks}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                                  Pending Review
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  handleOpenGradingDialog(sub, inspectingAssignment, student.name)
                                }
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                              >
                                {sub.status === 'graded' ? 'Re-grade' : 'Grade'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No turn-in</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInspectingAssignment(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grading Dialog */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Evaluate Deliverable
                </span>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {gradingSubmission.studentName}
                </h3>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-800">Assignment:</span>{' '}
                {gradingSubmission.assignmentTitle}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Awarded Score (Max: {gradingSubmission.maxMarks})
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="input-grade-marks"
                    type="number"
                    min={0}
                    max={gradingSubmission.maxMarks}
                    value={gradingSubmission.grade}
                    onChange={(e) =>
                      setGradingSubmission({
                        ...gradingSubmission,
                        grade: Number(e.target.value),
                      })
                    }
                    className="w-32 text-sm font-mono font-bold p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <span className="text-xs text-slate-500 font-mono">
                    / {gradingSubmission.maxMarks} Points
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Faculty Feedback & Evaluation Notes
                </label>
                <textarea
                  id="textarea-grading-feedback"
                  rows={4}
                  value={gradingSubmission.feedback}
                  onChange={(e) =>
                    setGradingSubmission({
                      ...gradingSubmission,
                      feedback: e.target.value,
                    })
                  }
                  placeholder="Provide constructive assessment on algorithmic efficiency, correctness, code architecture, or areas for improvement..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-grade-submit"
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                {editingAssignment ? 'Edit Assignment Deliverable' : 'Create New Coursework Assignment'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Course *
                </label>
                <select
                  id="select-assignment-course"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.instructor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assignment Title *
                </label>
                <input
                  id="input-assignment-title"
                  type="text"
                  placeholder="e.g. Programming Project 2: B+ Tree Index Engine"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prompt & Deliverable Requirements *
                </label>
                <textarea
                  id="textarea-assignment-description"
                  rows={3}
                  placeholder="Specify problem specifications, guidelines, required files, and rubric breakdown..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Due Date & Max Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <input
                    id="input-assignment-duedate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Marks *
                  </label>
                  <input
                    id="input-assignment-maxmarks"
                    type="number"
                    min={10}
                    max={500}
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Attachment reference name & status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reference File Name (Optional)
                  </label>
                  <input
                    id="input-assignment-attachment"
                    type="text"
                    placeholder="e.g. project2_spec_rubric.pdf"
                    value={formData.attachmentName}
                    onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    id="select-assignment-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'closed' })
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="active">Active (Open for submissions)</option>
                    <option value="closed">Closed (Submissions locked)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-save-assignment"
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingAssignment ? 'Update Assignment' : 'Create Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this assignment? All associated student submissions and evaluations will also be permanently deleted.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-assignment"
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
