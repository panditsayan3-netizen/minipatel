import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  FolderPlus,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit2,
  Users,
  Clock,
  MapPin,
  X,
  Check,
  GraduationCap,
  ListOrdered,
} from 'lucide-react';
import { Course } from '../../types';

export const CourseManagement: React.FC = () => {
  const { courses, users, addCourse, updateCourse, deleteCourse } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingRosterCourse, setViewingRosterCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    department: 'Computer Science',
    instructor: '',
    credits: 3,
    schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
    room: 'Hall 201',
    semester: 'Semester 5',
    description: '',
    syllabus: ['Introduction and Fundamentals', 'Core Theoretical Models', 'Practical Applications and Benchmarks'],
  });

  const [newTopicInput, setNewTopicInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const students = users.filter((u) => u.role === 'student');

  const filteredCourses = courses.filter((c) => {
    if (departmentFilter !== 'all' && c.department !== departmentFilter) return false;
    if (
      searchQuery &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      code: `CS-${Math.floor(300 + Math.random() * 90)}`,
      title: '',
      department: 'Computer Science',
      instructor: 'Prof. ',
      credits: 4,
      schedule: 'Tue, Thu 02:00 PM - 03:30 PM',
      room: 'Hall 401 (Computing Hub)',
      semester: 'Semester 5',
      description: '',
      syllabus: ['Architecture Foundations & Key Principles', 'Advanced Implementation Techniques', 'Design Patterns & Real-World Case Studies'],
    });
    setNewTopicInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      department: course.department,
      instructor: course.instructor,
      credits: course.credits,
      schedule: course.schedule,
      room: course.room,
      semester: course.semester,
      description: course.description,
      syllabus: course.syllabus || [],
    });
    setNewTopicInput('');
    setIsModalOpen(true);
  };

  const handleAddTopic = () => {
    if (newTopicInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        syllabus: [...prev.syllabus, newTopicInput.trim()],
      }));
      setNewTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
      setToast(`Course ${formData.code} updated successfully.`);
    } else {
      addCourse(formData);
      setToast(`New course ${formData.code}: "${formData.title}" created successfully.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
  };

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id);
    setToast(`Course ${courseToDelete.code} removed.`);
    setCourseToDelete(null);
    setTimeout(() => setToast(null), 3000);
  };

  const departments = Array.from(new Set(courses.map((c) => c.department)));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Courses & Curriculum Management
          </h1>
          <p className="text-sm text-slate-500">
            Create academic courses, assign faculties, schedule venues, and supervise syllabus modules
          </p>
        </div>

        <button
          id="btn-open-create-course"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by code, title, or professor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="all">All Departments ({courses.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No courses match the criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Create New Course&quot; to define a new curriculum.</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const enrolledStudents = students.filter((s) =>
              (s.enrolledCourseIds || []).includes(course.id)
            );

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {course.description || 'Comprehensive undergraduate academic coursework module.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.room}</span>
                    </div>
                  </div>

                  {/* Enrolled Students Quick Banner */}
                  <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Enrolled Students:</span>
                    <button
                      onClick={() => setViewingRosterCourse(course)}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{enrolledStudents.length} Students</span>
                    </button>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {course.syllabus.length} Topics
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn-edit-course-${course.id}`}
                      onClick={() => openEditModal(course)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-course-${course.id}`}
                      onClick={() => handleDelete(course)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Course Roster View Modal */}
      {viewingRosterCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
                  {viewingRosterCourse.code} Student Roster
                </h3>
                <p className="text-xs text-slate-500">{viewingRosterCourse.title}</p>
              </div>
              <button
                onClick={() => setViewingRosterCourse(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {students.filter((s) => (s.enrolledCourseIds || []).includes(viewingRosterCourse.id)).length === 0 ? (
                <p className="py-4 text-center text-slate-400">No students enrolled yet.</p>
              ) : (
                students
                  .filter((s) => (s.enrolledCourseIds || []).includes(viewingRosterCourse.id))
                  .map((student) => (
                    <div key={student.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[11px] text-slate-400">{student.rollNo} &bull; {student.department}</p>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-mono font-medium">
                        {student.username}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingRosterCourse(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                  {editingCourse ? 'Edit Course Offering' : 'Create New Course Offering'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Code & Credits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CS-301"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Credits (Units) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Operating Systems & Kernel Design"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Instructor & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Professor / Instructor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="e.g. Prof. Alan Turing"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                  </select>
                </div>
              </div>

              {/* Schedule & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Weekly Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="e.g. Mon, Wed 09:30 AM - 11:00 AM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lecture Venue / Room
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Hall 302 (Turing Wing)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Synopsis & Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide an overview of educational outcomes and prereqs..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Syllabus Topics Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Syllabus Units / Modules
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    placeholder="Add curriculum module topic..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {formData.syllabus.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200 text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-course"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {editingCourse ? 'Save Changes' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Course Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Delete Course
                </h3>
                <p className="text-xs text-slate-500">Permanent action</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{courseToDelete.code}: {courseToDelete.title}&quot;</span>? This will unenroll all students and remove associated coursework and attendance records.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-course"
                type="button"
                onClick={confirmDeleteCourse}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Yes, Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
