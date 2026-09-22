import React, { useState, useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  X,
  ShieldCheck,
  GraduationCap,
  Mail,
  User as UserIcon,
  Lock,
  Phone,
  Building,
  BookOpen,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types';

interface AddAdminFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (staff: User) => void;
  editingStaff?: User | null;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Communication',
  'Mechanical & Mechatronics',
  'Mathematics & Computing',
  'Physics & Quantum Science',
  'Academic Administration',
];

const COMMON_DESIGNATIONS = {
  faculty: [
    'Professor & Department Chair',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Adjunct Faculty',
    'Research Fellow & Instructor',
  ],
  admin: [
    'Academic Dean',
    'Registrar & Operations Head',
    'System Administrator',
    'Academic Affairs Director',
    'Examinations Controller',
    'Campus Administrator',
  ],
};

const AVATAR_PRESETS = [
  { id: 'm1', label: 'Male 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'm2', label: 'Male 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'm3', label: 'Male 3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { id: 'f1', label: 'Female 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'f2', label: 'Female 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
];

export const AddAdminFacultyModal: React.FC<AddAdminFacultyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingStaff,
}) => {
  const { courses, addAdminOrFaculty, updateStaff } = useCollege();

  const [staffCategory, setStaffCategory] = useState<'faculty' | 'admin'>('faculty');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('faculty123');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingStaff) {
      setName(editingStaff.name);
      const isDeanOrAdmin = (editingStaff.designation || '').toLowerCase().includes('admin') ||
        (editingStaff.department || '').toLowerCase().includes('administration');
      setStaffCategory(isDeanOrAdmin ? 'admin' : 'faculty');
      setDesignation(editingStaff.designation || 'Faculty Member');
      setDepartment(editingStaff.department || 'Computer Science & Engineering');
      setEmail(editingStaff.email);
      setUsername(editingStaff.username);
      setPassword(editingStaff.password || 'admin123');
      setPhone(editingStaff.phone || '+1 (555) 000-0000');
      setAssignedCourses(editingStaff.assignedCourses || []);
      setSelectedAvatar(editingStaff.avatar || AVATAR_PRESETS[0].url);
    } else {
      resetForm();
    }
    setError(null);
  }, [editingStaff, isOpen]);

  const resetForm = () => {
    setName('');
    setStaffCategory('faculty');
    setDesignation(COMMON_DESIGNATIONS.faculty[0]);
    setDepartment('Computer Science & Engineering');
    setEmail('');
    setUsername('');
    setPassword('faculty123');
    setPhone('+1 (555) 234-5678');
    setAssignedCourses(courses.slice(0, 2).map((c) => c.id));
    setSelectedAvatar(AVATAR_PRESETS[0].url);
    setError(null);
  };

  // Auto-generate username and email from name if empty
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingStaff) {
      const clean = val
        .toLowerCase()
        .replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s*/, '')
        .trim()
        .replace(/\s+/g, '.');
      if (clean) {
        setUsername(clean);
        setEmail(`${clean}@college.edu`);
      }
    }
  };

  const handleCategorySwitch = (cat: 'faculty' | 'admin') => {
    setStaffCategory(cat);
    setDesignation(COMMON_DESIGNATIONS[cat][0]);
    if (cat === 'admin') {
      setDepartment('Academic Administration');
      setPassword('admin123');
    } else {
      setDepartment('Computer Science & Engineering');
      setPassword('faculty123');
    }
  };

  const toggleCourse = (courseId: string) => {
    setAssignedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid official email address.');
      return;
    }
    if (!username.trim()) {
      setError('Please enter a login username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStaff) {
        updateStaff(editingStaff.id, {
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          email: email.trim(),
          designation: designation.trim(),
          department,
          phone: phone.trim(),
          assignedCourses,
          avatar: selectedAvatar,
        });
        onSuccess?.({
          ...editingStaff,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          email: email.trim(),
          designation: designation.trim(),
          department,
          phone: phone.trim(),
          assignedCourses,
          avatar: selectedAvatar,
        });
      } else {
        const newStaff = addAdminOrFaculty({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          email: email.trim(),
          designation: designation.trim(),
          department,
          phone: phone.trim(),
          assignedCourses,
          avatar: selectedAvatar,
        });
        onSuccess?.(newStaff);
      }
      onClose();
    } catch {
      setError('Failed to save staff member. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="modal-add-staff"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/30 flex items-center justify-center text-white">
              {staffCategory === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg font-['Space_Grotesk'] leading-tight">
                {editingStaff ? 'Edit Staff Member' : 'Add New Admin or Faculty'}
              </h3>
              <p className="text-xs text-indigo-200">
                Grant institutional portal credentials, designation, and course privileges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Role / Category Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Account Designation Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-category-faculty"
                onClick={() => handleCategorySwitch('faculty')}
                className={`p-3 rounded-xl border flex items-center space-x-3 text-left transition-all ${
                  staffCategory === 'faculty'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    staffCategory === 'faculty'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Faculty Member</span>
                  <span className="text-[11px] text-slate-500 block">
                    Professor, Lecturer & Course Instructor
                  </span>
                </div>
              </button>

              <button
                type="button"
                id="btn-category-admin"
                onClick={() => handleCategorySwitch('admin')}
                className={`p-3 rounded-xl border flex items-center space-x-3 text-left transition-all ${
                  staffCategory === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    staffCategory === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Administrator</span>
                  <span className="text-[11px] text-slate-500 block">
                    Dean, Registrar & Systems Admin
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name & Honorific <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  id="input-staff-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={staffCategory === 'admin' ? 'Dr. Sarah Mitchell' : 'Prof. Rajesh Verma'}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designation / Academic Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-staff-designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor"
                list="designation-suggestions"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
              <datalist id="designation-suggestions">
                {COMMON_DESIGNATIONS[staffCategory].map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Department & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  id="select-staff-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Institutional Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  id="input-staff-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty.name@college.edu"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Login Credentials: Username & Password */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Portal Sign-In Credentials</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Grants full access to the {staffCategory === 'admin' ? 'Admin Portal' : 'Faculty & Admin Console'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Login Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="input-staff-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Access Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-staff-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 border border-slate-200 rounded-lg text-sm font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                id="input-staff-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Assigned Courses / Teaching Load */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Assigned Courses / Teaching Portfolio ({assignedCourses.length} selected)</span>
              <span className="text-[11px] text-slate-400 font-normal">Optional</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
              {courses.map((course) => {
                const isSelected = assignedCourses.includes(course.id);
                return (
                  <button
                    type="button"
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-left border text-xs transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-medium'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-mono font-bold text-indigo-700 mr-1.5">{course.code}</span>
                      <span className="truncate">{course.title}</span>
                    </div>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Preset Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Profile Avatar
            </label>
            <div className="flex items-center space-x-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedAvatar(preset.url)}
                  className={`relative rounded-full p-0.5 transition-all ${
                    selectedAvatar === preset.url
                      ? 'ring-2 ring-indigo-600 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={preset.label}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  {selectedAvatar === preset.url && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-600 rounded-full border border-white flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-submit-staff"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{editingStaff ? 'Update Staff Member' : `Create ${staffCategory === 'admin' ? 'Administrator' : 'Faculty'} Account`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
