import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Upload,
  Search,
  Filter,
  Paperclip,
  Calendar,
  X,
  Send,
  FileCheck,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
} from 'lucide-react';
import { Assignment } from '../../types';

export const StudentAssignments: React.FC = () => {
  const { currentUser, courses, assignments, submissions, submitAssignment, getStudentAssignmentSummary } = useCollege();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [integrityAgreed, setIntegrityAgreed] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [expandedAsgId, setExpandedAsgId] = useState<string | null>(null);

  if (!currentUser) return null;

  const enrolledCourseIds = currentUser.enrolledCourseIds || [];
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const summary = getStudentAssignmentSummary(currentUser.id);

  // Filter assignments belonging to enrolled courses
  const enrolledAssignments = useMemo(() => {
    return assignments.filter((a) => enrolledCourseIds.includes(a.courseId));
  }, [assignments, enrolledCourseIds]);

  // Combine assignments with submission info for this student
  const assignmentItems = useMemo(() => {
    return enrolledAssignments.map((asg) => {
      const course = courses.find((c) => c.id === asg.courseId);
      const sub = submissions.find(
        (s) => s.assignmentId === asg.id && s.studentId === currentUser.id
      );

      let statusType: 'pending' | 'submitted' | 'graded' = 'pending';
      if (sub) {
        statusType = sub.status === 'graded' ? 'graded' : 'submitted';
      }

      // Calculate days remaining
      const dueDateObj = new Date(asg.dueDate + 'T23:59:59');
      const now = new Date();
      const diffMs = dueDateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        ...asg,
        course,
        submission: sub,
        statusType,
        diffDays,
        isOverdue: diffMs < 0 && !sub,
      };
    });
  }, [enrolledAssignments, courses, submissions, currentUser.id]);

  // Filtered by tab, course, and search
  const filteredAssignments = useMemo(() => {
    return assignmentItems.filter((item) => {
      // Tab filter
      if (activeFilter !== 'all' && item.statusType !== activeFilter) {
        return false;
      }
      // Course filter
      if (selectedCourseId !== 'all' && item.courseId !== selectedCourseId) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCode = item.course?.code.toLowerCase().includes(query) || false;
        const matchesCourseTitle = item.course?.title.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc && !matchesCode && !matchesCourseTitle) {
          return false;
        }
      }
      return true;
    });
  }, [assignmentItems, activeFilter, selectedCourseId, searchQuery]);

  // Track assignments clicked or submitted to turn the button green immediately
  const [clickedAssignmentIds, setClickedAssignmentIds] = useState<Set<string>>(new Set());

  const handleOpenSubmitModal = (asg: Assignment) => {
    const existingSub = submissions.find(
      (s) => s.assignmentId === asg.id && s.studentId === currentUser.id
    );
    setSubmittingAssignment(asg);
    setSubmissionText(existingSub?.submissionText || '');
    setAttachedFileName(existingSub?.attachmentName || '');
    setAttachedFile(null);
    setIntegrityAgreed(false);
  };

  const handleSubmissionButtonClick = (item: (typeof filteredAssignments)[0]) => {
    // Immediately mark as clicked so the button turns green
    setClickedAssignmentIds((prev) => new Set(prev).add(item.id));

    if (item.statusType === 'pending') {
      submitAssignment(
        item.id,
        currentUser.id,
        'Deliverable submitted successfully via student portal.',
        item.attachmentName ? `submitted_${item.attachmentName}` : undefined
      );
      setSuccessToast(`Deliverable for "${item.title}" submitted successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } else {
      // If already submitted or graded, open the deliverable details modal
      handleOpenSubmitModal(item);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!submissionText.trim() && !attachedFileName.trim()) {
      alert('Please provide either a written solution note or attach a file.');
      return;
    }

    if (!integrityAgreed) {
      alert('Please confirm the academic honesty certification before submitting.');
      return;
    }

    setClickedAssignmentIds((prev) => new Set(prev).add(submittingAssignment.id));

    submitAssignment(
      submittingAssignment.id,
      currentUser.id,
      submissionText.trim(),
      attachedFileName.trim() || undefined
    );

    setSuccessToast(`Deliverable for "${submittingAssignment.title}" submitted successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
    setSubmittingAssignment(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{successToast}</p>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-300 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-500/30 text-xs font-semibold text-blue-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Academic Deliverables</span>
              <span>&bull;</span>
              <span>Semester 5</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Space_Grotesk']">
              Coursework & Assignments
            </h1>
            <p className="text-sm text-blue-100/80 max-w-2xl">
              Track project milestones, upload problem set solutions, view submission histories, and inspect faculty grading and feedback.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg text-emerald-300">
              {summary.avgGrade > 0 ? `${summary.avgGrade}%` : 'N/A'}
            </div>
            <div>
              <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Average Grade</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {summary.graded} Evaluated &bull; {summary.pending} Pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled Assignments */}
        <div
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-blue-50/70 border-blue-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Assigned</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {summary.totalEnrolledAssignments}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across {enrolledCourses.length} courses</p>
        </div>

        {/* Pending Submissions */}
        <div
          onClick={() => setActiveFilter('pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'pending'
              ? 'bg-amber-50/70 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {summary.pending}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            {summary.pending > 0 ? 'Requires your submission' : 'All caught up!'}
          </p>
        </div>

        {/* Submitted (Under Review) */}
        <div
          onClick={() => setActiveFilter('submitted')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'submitted'
              ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Under Review</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {summary.submitted}
          </div>
          <p className="text-xs text-slate-500 mt-1">Awaiting faculty review</p>
        </div>

        {/* Graded */}
        <div
          onClick={() => setActiveFilter('graded')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'graded'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Graded & Feedback</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            {summary.graded}
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1">Evaluation published</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            id="tab-filter-all"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({summary.totalEnrolledAssignments})
          </button>
          <button
            id="tab-filter-pending"
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'pending'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({summary.pending})
          </button>
          <button
            id="tab-filter-submitted"
            onClick={() => setActiveFilter('submitted')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'submitted'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submitted ({summary.submitted})
          </button>
          <button
            id="tab-filter-graded"
            onClick={() => setActiveFilter('graded')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'graded'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Graded ({summary.graded})
          </button>
        </div>

        {/* Course Filter & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Course Selector */}
          <div className="relative">
            <select
              id="select-course-filter"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Enrolled Courses</option>
              {enrolledCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-assignment-search"
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-['Space_Grotesk']">
              No assignments found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no assignments matching your current filter criteria.
            </p>
            {(activeFilter !== 'all' || selectedCourseId !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedCourseId('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredAssignments.map((item) => {
            const isExpanded = expandedAsgId === item.id;
            const isSubmittedOrClicked =
              item.statusType === 'submitted' ||
              item.statusType === 'graded' ||
              clickedAssignmentIds.has(item.id);

            return (
              <div
                key={item.id}
                id={`card-assignment-${item.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:border-slate-300 transition-all"
              >
                <div className="p-5 sm:p-6">
                  {/* Top Bar: Badges, Course Code, and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.course?.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500 truncate max-w-xs">
                        {item.course?.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Max marks badge */}
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.maxMarks} Marks
                      </span>

                      {/* Status badge */}
                      {!isSubmittedOrClicked && item.statusType === 'pending' && (
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : item.diffDays <= 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {item.isOverdue
                              ? 'Overdue'
                              : item.diffDays === 0
                              ? 'Due Today'
                              : `Due in ${item.diffDays} days`}
                          </span>
                        </span>
                      )}

                      {(isSubmittedOrClicked && item.statusType !== 'graded') && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Submitted</span>
                        </span>
                      )}

                      {item.statusType === 'graded' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Graded: {item.submission?.grade}/{item.maxMarks}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] leading-snug">
                      {item.title}
                    </h3>
                    <p
                      className={`text-xs text-slate-600 mt-2 leading-relaxed ${
                        !isExpanded ? 'line-clamp-2' : ''
                      }`}
                    >
                      {item.description}
                    </p>

                    {item.description.length > 120 && (
                      <button
                        onClick={() => setExpandedAsgId(isExpanded ? null : item.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1.5 flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Show less' : 'Read full prompt'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Resource Attachment */}
                  {item.attachmentName && (
                    <div className="mt-3.5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.attachmentName}</span>
                      <span className="text-slate-400 text-[10px]">(Reference Document)</span>
                    </div>
                  )}

                  {/* Submission Evaluation Panel (If Graded) */}
                  {item.statusType === 'graded' && item.submission && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                            Faculty Evaluation
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">Score:</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold font-mono">
                            {item.submission.grade} / {item.maxMarks} (
                            {Math.round(((item.submission.grade || 0) / item.maxMarks) * 100)}%)
                          </span>
                        </div>
                      </div>

                      {item.submission.feedback && (
                        <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-emerald-100 italic">
                          "{item.submission.feedback}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Evaluated by: {item.submission.gradedBy || item.course?.instructor}</span>
                        <span>{item.submission.gradedAt}</span>
                      </div>
                    </div>
                  )}

                  {/* Student's Submission Details (If submitted but not yet graded) */}
                  {item.statusType === 'submitted' && item.submission && (
                    <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-indigo-900 font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Your Deliverable is Logged</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Submitted: {item.submission.submittedAt}
                        </span>
                      </div>

                      {item.submission.submissionText && (
                        <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100/70 font-mono text-[11px]">
                          {item.submission.submissionText}
                        </p>
                      )}

                      {item.submission.attachmentName && (
                        <div className="flex items-center space-x-2 text-indigo-700 font-medium pt-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Attached: {item.submission.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Footer: Dates and Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due: {item.dueDate}</span>
                      </span>
                      <span>&bull;</span>
                      <span>Assigned: {item.assignedDate}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isSubmittedOrClicked ? (
                        <>
                          <button
                            id={`btn-submit-${item.id}`}
                            onClick={() => handleSubmissionButtonClick(item)}
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>
                              {item.statusType === 'graded'
                                ? 'Graded Deliverable'
                                : 'Submitted'}
                            </span>
                          </button>
                          <button
                            id={`btn-edit-submission-${item.id}`}
                            onClick={() => handleOpenSubmitModal(item)}
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                            title="Upload files, add code repository, or view deliverable details"
                          >
                            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Files & Notes</span>
                          </button>
                        </>
                      ) : (
                        <button
                          id={`btn-submit-${item.id}`}
                          onClick={() => handleSubmissionButtonClick(item)}
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Deliverable</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal Dialog */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Deliverable Submission
                </span>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] truncate max-w-md">
                  {submittingAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                <span>Maximum Marks: <strong>{submittingAssignment.maxMarks}</strong></span>
                <span>Due Date: <strong>{submittingAssignment.dueDate} (23:59)</strong></span>
              </div>

              {/* Solution Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Solution Notes, Code Snippet, or Repo Links
                </label>
                <textarea
                  id="textarea-submission-notes"
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Provide your solution summary, implementation details, algorithm explanations, or git repository link..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>

              {/* File Attachment Drop Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Deliverable File (.zip, .pdf, .sql, .tar.gz)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/50'
                      : attachedFileName
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  {attachedFileName ? (
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{attachedFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedFile(null);
                          setAttachedFileName('');
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-700">
                        Drag and drop file here, or{' '}
                        <label
                          htmlFor="file-upload-input"
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          browse from computer
                        </label>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supported: PDF, ZIP, SQL, Markdown, Archives up to 25MB
                      </p>
                    </div>
                  )}

                  <input
                    id="file-upload-input"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Academic Integrity Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    id="checkbox-integrity-agree"
                    type="checkbox"
                    checked={integrityAgreed}
                    onChange={(e) => setIntegrityAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 leading-tight">
                    I confirm that this submission is entirely my own original academic work conforming to the Mini Patel Institute Honor Code.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-submit-assignment"
                  type="submit"
                  disabled={!integrityAgreed}
                  className={`inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all duration-200 active:scale-95 ${
                    integrityAgreed
                      ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Deliverable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
