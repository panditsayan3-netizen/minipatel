import React, { useState, useRef, useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  Camera,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Trash2,
  Globe,
  Check,
  Shield,
  Briefcase,
  Layers,
} from 'lucide-react';
import { User } from '../../types';

interface UserProfileProps {
  onNavigate?: (tab: string) => void;
}

const PRESET_AVATARS = [
  {
    id: 'male-1',
    label: 'Male Professional 1',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-2',
    label: 'Male Professional 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-3',
    label: 'Male Professional 3',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-4',
    label: 'Male Professional 4',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-1',
    label: 'Female Professional 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-2',
    label: 'Female Professional 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-3',
    label: 'Female Professional 3',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-4',
    label: 'Female Professional 4',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
];

export const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
  const { currentUser, updateUserProfile, courses } = useCollege();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';

  // Form states initialized from currentUser
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    username: currentUser.username || '',
    email: currentUser.email || '',
    altEmail: currentUser.altEmail || '',
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    emergencyContact: currentUser.emergencyContact || '',
    emergencyPhone: currentUser.emergencyPhone || '',
    bio: currentUser.bio || '',
    designation: currentUser.designation || '',
    department: currentUser.department || '',
    semester: currentUser.semester || '',
    rollNo: currentUser.rollNo || '',
    officeLocation: currentUser.officeLocation || '',
    officeHours: currentUser.officeHours || '',
    linkedin: currentUser.linkedin || '',
    github: currentUser.github || '',
    avatar: currentUser.avatar || '',
    password: currentUser.password || '',
  });

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'contact' | 'security' | 'academic'>('profile');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when currentUser changes (e.g. user switcher)
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        altEmail: currentUser.altEmail || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
        emergencyPhone: currentUser.emergencyPhone || '',
        bio: currentUser.bio || '',
        designation: currentUser.designation || '',
        department: currentUser.department || '',
        semester: currentUser.semester || '',
        rollNo: currentUser.rollNo || '',
        officeLocation: currentUser.officeLocation || '',
        officeHours: currentUser.officeHours || '',
        linkedin: currentUser.linkedin || '',
        github: currentUser.github || '',
        avatar: currentUser.avatar || '',
        password: currentUser.password || '',
      });
    }
  }, [currentUser]);

  // Check if form has unsaved modifications
  const isDirty =
    formData.name !== (currentUser.name || '') ||
    formData.email !== (currentUser.email || '') ||
    formData.altEmail !== (currentUser.altEmail || '') ||
    formData.phone !== (currentUser.phone || '') ||
    formData.address !== (currentUser.address || '') ||
    formData.emergencyContact !== (currentUser.emergencyContact || '') ||
    formData.emergencyPhone !== (currentUser.emergencyPhone || '') ||
    formData.bio !== (currentUser.bio || '') ||
    formData.designation !== (currentUser.designation || '') ||
    formData.officeLocation !== (currentUser.officeLocation || '') ||
    formData.officeHours !== (currentUser.officeHours || '') ||
    formData.avatar !== (currentUser.avatar || '') ||
    formData.password !== (currentUser.password || '') ||
    formData.linkedin !== (currentUser.linkedin || '') ||
    formData.github !== (currentUser.github || '');

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, WEBP).' });
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image size exceeds 4MB limit. Please choose a smaller file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
        setPhotoModalOpen(false);
        setStatusMessage({ type: 'success', text: 'New photo selected! Click "Save Changes" to apply.' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate random Dicebear avatar
  const handleGenerateRandomAvatar = () => {
    const seed = `${formData.name || 'user'}-${Math.random().toString(36).substring(2, 7)}`;
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
    setFormData((prev) => ({ ...prev, avatar: newAvatar }));
    setPhotoModalOpen(false);
    setStatusMessage({ type: 'success', text: 'Generated new avatar! Click "Save Changes" to apply.' });
  };

  // Handle custom URL submit
  const handleApplyCustomUrl = () => {
    if (!customImageUrl.trim() || !customImageUrl.startsWith('http')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid HTTP/HTTPS image URL.' });
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: customImageUrl.trim() }));
    setCustomImageUrl('');
    setPhotoModalOpen(false);
    setStatusMessage({ type: 'success', text: 'Photo URL applied! Click "Save Changes" to apply.' });
  };

  // Reset form
  const handleReset = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        altEmail: currentUser.altEmail || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
        emergencyPhone: currentUser.emergencyPhone || '',
        bio: currentUser.bio || '',
        designation: currentUser.designation || '',
        department: currentUser.department || '',
        semester: currentUser.semester || '',
        rollNo: currentUser.rollNo || '',
        officeLocation: currentUser.officeLocation || '',
        officeHours: currentUser.officeHours || '',
        linkedin: currentUser.linkedin || '',
        github: currentUser.github || '',
        avatar: currentUser.avatar || '',
        password: currentUser.password || '',
      });
      setStatusMessage({ type: 'success', text: 'Changes reverted to current profile state.' });
    }
  };

  // Save changes
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name cannot be blank.' });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please provide a valid primary email address.' });
      return;
    }

    setIsSaving(true);
    try {
      updateUserProfile(currentUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        altEmail: formData.altEmail.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        bio: formData.bio.trim(),
        designation: formData.designation.trim(),
        officeLocation: formData.officeLocation.trim(),
        officeHours: formData.officeHours.trim(),
        avatar: formData.avatar,
        password: formData.password.trim(),
        linkedin: formData.linkedin.trim(),
        github: formData.github.trim(),
      });

      setStatusMessage({
        type: 'success',
        text: 'Profile and contact information successfully updated!',
      });
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Associated courses
  const userCourseIds = isStudent
    ? currentUser.enrolledCourseIds || []
    : currentUser.assignedCourses || [];
  const associatedCourses = courses.filter((c) => userCourseIds.includes(c.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          )}
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
            My Account & Profile
          </span>
        </div>

        {/* Live Save / Discard buttons in header */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Discard Changes</span>
            </button>
          )}
          <button
            type="button"
            id="btn-save-profile-header"
            onClick={() => handleSave()}
            disabled={isSaving}
            className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              isDirty
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-500/25 ring-2 ring-indigo-500/20 cursor-pointer'
                : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in slide-in-from-top duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-xs font-medium">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Showcase Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md overflow-hidden">
        {/* Decorative background ambient circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo with Edit Overlay */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl bg-slate-800">
              <img
                src={
                  formData.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'user')}`
                }
                alt={formData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'user')}`;
                }}
              />
            </div>
            {/* Quick Edit Photo Button */}
            <button
              type="button"
              id="btn-trigger-change-photo"
              onClick={() => setPhotoModalOpen(true)}
              className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1 cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="w-6 h-6 text-white" />
              <span className="text-[11px] font-bold tracking-wide">Change Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="md:hidden absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-lg border-2 border-slate-900"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Bio & Identity Badges */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isStudent
                    ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                }`}
              >
                {isStudent ? (
                  <GraduationCap className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{isStudent ? 'Enrolled Student' : 'Institutional Staff'}</span>
              </span>

              {isStudent && currentUser.rollNo && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-200 border border-white/10">
                  {currentUser.rollNo}
                </span>
              )}

              {!isStudent && formData.designation && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  {formData.designation}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white">
              {formData.name || 'User Profile'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {formData.bio || (isStudent
                ? 'Undergraduate scholar at Mini Patel Institute studying technology and engineering foundations.'
                : 'Academic faculty and administrative member overseeing course curriculum and campus operations.')}
            </p>

            {/* Quick Meta Stats / Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-indigo-400" />
                <span>{formData.department || 'Academic Department'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-200">{formData.email}</span>
              </div>
              {formData.phone && (
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>{formData.phone}</span>
                </div>
              )}
              {isStudent && currentUser.cgpa && (
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <Award className="w-4 h-4" />
                  <span>{currentUser.cgpa.toFixed(2)} CGPA</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger for Photo Modal */}
          <div className="hidden md:flex flex-col items-end justify-center self-center shrink-0">
            <button
              type="button"
              id="btn-edit-photo-hero"
              onClick={() => setPhotoModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Update Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          type="button"
          id="tab-profile-general"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>General Profile</span>
        </button>

        <button
          type="button"
          id="tab-profile-contact"
          onClick={() => setActiveSubTab('contact')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'contact'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Contact & Address</span>
        </button>

        <button
          type="button"
          id="tab-profile-academic"
          onClick={() => setActiveSubTab('academic')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'academic'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {isStudent ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
          <span>{isStudent ? 'Academic Standing' : 'Institutional Role'}</span>
        </button>

        <button
          type="button"
          id="tab-profile-security"
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'security'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Main Tab Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Editors */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {/* SUB-TAB 1: General Profile */}
            {activeSubTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Personal Information
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Basic identification details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mr. Sayan Pandit"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Portal Username (Permanent)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={formData.username}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Locked
                      </span>
                    </div>
                  </div>
                </div>

                {!isStudent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Official Designation / Title
                    </label>
                    <input
                      type="text"
                      id="input-profile-designation"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Dean of Academic Affairs & Administrator"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Department
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      disabled
                      value={formData.department}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bio / Personal Statement
                  </label>
                  <textarea
                    rows={3}
                    id="input-profile-bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={
                      isStudent
                        ? 'Briefly state your academic focus, major interests, research hobbies, or career goals...'
                        : 'Summarize your faculty responsibilities, teaching philosophy, or administrative duties...'
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white placeholder:text-slate-400"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Displays on public course rosters and campus directory.
                  </span>
                </div>

                {/* Social links */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Professional Profiles & Portfolio
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        LinkedIn URL
                      </label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="url"
                          id="input-profile-linkedin"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        GitHub / Portfolio URL
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="url"
                          id="input-profile-github"
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          placeholder="https://github.com/username"
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: Contact & Address Details */}
            {activeSubTab === 'contact' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Contact Information & Directory Channels
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Institutional & emergency contacts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Primary Institutional Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        id="input-profile-email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="student.name@college.edu"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Alternate / Personal Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        id="input-profile-alt-email"
                        value={formData.altEmail}
                        onChange={(e) => setFormData({ ...formData, altEmail: e.target.value })}
                        placeholder="personal.email@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        id="input-profile-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 234-8891"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Campus / Residential Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        id="input-profile-address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g. Hall 4, Room 212 or City Residence"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Faculty / Staff specific contact: Office Location & Hours */}
                {!isStudent && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Faculty Office Availability</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Office Location
                        </label>
                        <input
                          type="text"
                          id="input-profile-office-loc"
                          value={formData.officeLocation}
                          onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                          placeholder="e.g. Tech Block C, Suite 305"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Office / Student Consultation Hours
                        </label>
                        <input
                          type="text"
                          id="input-profile-office-hrs"
                          value={formData.officeHours}
                          onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                          placeholder="e.g. Tue / Thu 2:00 PM - 4:00 PM"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                      Emergency Notification Contact
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Emergency Contact Name / Relationship
                      </label>
                      <input
                        type="text"
                        id="input-profile-emergency-name"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="e.g. Mrs. Sharma (Mother)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Emergency Phone Number
                      </label>
                      <input
                        type="tel"
                        id="input-profile-emergency-phone"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        placeholder="+1 (555) 999-1234"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: Academic / Role Details */}
            {activeSubTab === 'academic' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    {isStudent ? (
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                    )}
                    <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      {isStudent ? 'Academic Enrolment Standing' : 'Staff Department Privileges'}
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Institutional records</span>
                </div>

                {isStudent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Student ID</span>
                        <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
                          {currentUser.rollNo || 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Term</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {currentUser.semester || 'Semester 5'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumulative GPA</span>
                        <span className="text-sm font-bold text-emerald-600 mt-1 block">
                          {currentUser.cgpa ? currentUser.cgpa.toFixed(2) : '3.84'} / 4.0
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Enrolled Courses</span>
                        <span className="text-sm font-bold text-indigo-600 mt-1 block">
                          {associatedCourses.length} Registered
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Currently Registered Courses
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {associatedCourses.map((c) => (
                          <div key={c.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                                {c.code}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{c.title}</p>
                                <p className="text-[11px] text-slate-400">{c.instructor} &bull; {c.credits} Credits</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">{c.schedule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Role Hierarchy</span>
                        <span className="text-sm font-bold text-indigo-900 mt-1 block capitalize">
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Affiliation</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {formData.department}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Teaching Portfolio</span>
                        <span className="text-sm font-bold text-amber-700 mt-1 block">
                          {associatedCourses.length} Assigned
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Assigned Teaching / Administrative Portfolio
                      </span>
                      {associatedCourses.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          No specific teaching courses assigned to this administrative profile.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                          {associatedCourses.map((c) => (
                            <div key={c.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                                  {c.code}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{c.title}</p>
                                  <p className="text-[11px] text-slate-400">{c.department}</p>
                                </div>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-500">{c.room}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: Security & Password */}
            {activeSubTab === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Authentication & Portal Security
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Update login password</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Portal Sign-In Password
                    </label>
                    <div className="relative max-w-md">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="input-profile-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Use this password alongside your username ({formData.username}) to log in.
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Password Strength & Security</span>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          formData.password.length > 8
                            ? 'w-full bg-emerald-500'
                            : formData.password.length > 5
                            ? 'w-2/3 bg-amber-500'
                            : 'w-1/3 bg-rose-500'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Minimum 6 characters recommended. Include numbers and symbols for institutional security.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save bar */}
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-xs text-slate-500">
                {isDirty ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                    Unsaved changes pending
                  </span>
                ) : (
                  <span className="text-slate-400">All profile information is currently saved</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {isDirty && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Discard
                  </button>
                )}
                <button
                  type="submit"
                  id="btn-save-profile-bottom"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Live Profile ID Card & Summary */}
        <div className="space-y-6">
          {/* Institutional Badge Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Digital Campus ID Card
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="mt-4 text-center space-y-3">
              <div className="relative inline-block">
                <img
                  src={
                    formData.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'user')}`
                  }
                  alt={formData.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover ring-2 ring-indigo-500/20 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full text-white shadow-xs">
                  <Check className="w-2.5 h-2.5" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {formData.name || 'Anonymous User'}
                </h3>
                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                  {isStudent ? (currentUser.rollNo || 'Student') : (formData.designation || 'Staff')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formData.department || 'Mini Patel Institute'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Institutional ID:</span>
                  <span className="font-mono font-bold text-slate-700">{currentUser.id}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Username:</span>
                  <span className="font-mono font-bold text-slate-700">{formData.username}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Primary Email:</span>
                  <span className="text-slate-700 truncate max-w-[140px]">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Contact:</span>
                    <span className="text-slate-700">{formData.phone}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPhotoModalOpen(true)}
                className="w-full mt-2 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Profile Photo</span>
              </button>
            </div>
          </div>

          {/* Quick Help & Guidelines */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Campus Profile Tips</span>
            </span>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Keep your primary email up to date for course announcements and submission grades.</li>
              <li>Upload a clear portrait to help professors and colleagues identify you on campus.</li>
              <li>Emergency contact information is confidential and used exclusively in critical situations.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL: Change Profile Photo */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base font-['Space_Grotesk']">
                  Update Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Option 1: Direct File Upload */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Option 1: Upload from Computer / Device
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  id="btn-profile-file-picker"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <Upload className="w-7 h-7 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-indigo-950">Click to Browse Photo</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, WEBP up to 4MB</p>
                </button>
              </div>

              {/* Option 2: Choose from Curated Professional Portraits */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Option 2: Select Curated Portrait Preset
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, avatar: preset.url }));
                        setPhotoModalOpen(false);
                        setStatusMessage({ type: 'success', text: 'Selected preset avatar!' });
                      }}
                      className={`relative rounded-xl overflow-hidden p-0.5 transition-all border ${
                        formData.avatar === preset.url
                          ? 'ring-2 ring-indigo-600 border-transparent shadow-md scale-105'
                          : 'border-slate-200 hover:border-indigo-300 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-14 object-cover rounded-lg"
                      />
                      {formData.avatar === preset.url && (
                        <span className="absolute bottom-1 right-1 p-0.5 bg-indigo-600 rounded-full text-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: AI / Illustrated Avatar Generator */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Illustrated Vector Avatar</span>
                  <span className="text-[11px] text-slate-500">Generate a unique procedural avatar</span>
                </div>
                <button
                  type="button"
                  id="btn-generate-dicebear"
                  onClick={handleGenerateRandomAvatar}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate New</span>
                </button>
              </div>

              {/* Option 4: Image Web URL */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Option 4: Provide Web Image URL
                </span>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    id="input-photo-custom-url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
