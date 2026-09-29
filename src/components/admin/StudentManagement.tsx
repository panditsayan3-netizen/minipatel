import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit2,
  BookOpen,
  Mail,
  Phone,
  GraduationCap,
  Key,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { User } from '../../types';

export const StudentManagement: React.FC = () => {
  const { users, courses, addStudent, updateStudent, deleteStudent } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    rollNo: '',
    department: 'Computer Science & Engineering',
    semester: 'Semester 1',
    phone: '',
    enrolledCourseIds: [] as string[],
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const students = users.filter((u) => u.role === 'student');

  // Filtered students
  const filteredStudents = students.filter((s) => {
    if (departmentFilter !== 'all' && s.department !== departmentFilter) {
      return false;
    }
    if (
      searchQuery &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(s.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      username: '',
      password: 'student123',
      email: '',
      rollNo: `CS2026-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Computer Science & Engineering',
      semester: 'Semester 5',
      phone: '+1 (555) 000-0000',
      enrolledCourseIds: courses.slice(0, 3).map((c) => c.id),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: User) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      username: student.username,
      password: student.password || 'student123',
      email: student.email,
      rollNo: student.rollNo || '',
      department: student.department || 'Computer Science & Engineering',
      semester: student.semester || 'Semester 5',
      phone: student.phone || '',
      enrolledCourseIds: student.enrolledCourseIds || [],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleCourseEnrollment = (courseId: string) => {
    setFormData((prev) => {
      const exists = prev.enrolledCourseIds.includes(courseId);
      return {
        ...prev,
        enrolledCourseIds: exists
          ? prev.enrolledCourseIds.filter((id) => id !== courseId)
          : [...prev.enrolledCourseIds, courseId],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Student full name is required.');
      return;
    }
    if (!formData.username.trim()) {
      setFormError('Login username is required.');
      return;
    }

    // Check for username duplication
    const usernameTaken = users.some(
      (u) =>
        u.username.toLowerCase() === formData.username.trim().toLowerCase() &&
        u.id !== editingStudent?.id
    );
    if (usernameTaken) {
      setFormError('This username is already registered. Please choose another.');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: formData.name,
        username: formData.username.toLowerCase(),
        password: formData.password,
        email: formData.email,
        rollNo: formData.rollNo,
        department: formData.department,
        semester: formData.semester,
        phone: formData.phone,
        enrolledCourseIds: formData.enrolledCourseIds,
      });
      setSuccessToast(`Student ${formData.name} successfully updated.`);
    } else {
      addStudent({
        name: formData.name,
        username: formData.username.toLowerCase(),
        password: formData.password || 'student123',
        email: formData.email || `${formData.username}@college.edu`,
        rollNo: formData.rollNo,
        department: formData.department,
        semester: formData.semester,
        phone: formData.phone,
        enrolledCourseIds: formData.enrolledCourseIds,
      });
      setSuccessToast(`Student account created! Username: "${formData.username.toLowerCase()}" with password "${formData.password}".`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleDelete = (student: User) => {
    setStudentToDelete(student);
  };

  const confirmDeleteAction = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setSuccessToast(`Student "${studentToDelete.name}" (${studentToDelete.rollNo || studentToDelete.username}) has been permanently removed.`);
    setStudentToDelete(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const uniqueDepartments = Array.from(new Set(students.map((s) => s.department || 'General')));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Student Directory & Creation
          </h1>
          <p className="text-sm text-slate-500">
            Register new students, issue login credentials, assign semesters, and manage course enrollments
          </p>
        </div>

        <button
          id="btn-open-create-student"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-student"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, email, or username..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">Department:</span>
          <select
            id="select-filter-dept"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="all">All Departments ({students.length})</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll No & Semester</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Login Username</th>
                <th className="py-3 px-4">Enrolled Courses</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No students match the criteria. Click &quot;Create New Student&quot; to enroll someone!
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const enrolledCount = (student.enrolledCourseIds || []).length;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{student.name}</p>
                            <p className="text-[11px] text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {student.rollNo || 'N/A'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">{student.semester}</p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {student.department}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {student.username}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{enrolledCount} Courses</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            id={`btn-edit-student-${student.id}`}
                            onClick={() => openEditModal(student)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Student Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-student-${student.id}`}
                            onClick={() => handleDelete(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                  {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Roll No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jordan Miller"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll Number / Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. CS2026-104"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Student Portal Login Credentials</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Username (for login) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="e.g. jordan.miller"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. student123"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Department & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`Semester ${s}`}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Enrollment Selection Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Enrolled Courses ({formData.enrolledCourseIds.length} Selected)
                </label>
                <div className="max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50 space-y-1.5">
                  {courses.map((course) => {
                    const checked = formData.enrolledCourseIds.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors ${
                          checked ? 'bg-indigo-50 border border-indigo-200 font-semibold text-indigo-900' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCourseEnrollment(course.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{course.code}: {course.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{course.credits} Cr</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-student"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {editingStudent ? 'Save Changes' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Delete Student Account
                </h3>
                <p className="text-xs text-slate-500">Permanent action</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete student <span className="font-bold text-slate-900">&quot;{studentToDelete.name}&quot;</span> (Roll No: <span className="font-mono font-semibold">{studentToDelete.rollNo || 'N/A'}</span>)? All associated attendance records and submissions will also be cleaned up.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-student"
                type="button"
                onClick={confirmDeleteAction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Yes, Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
