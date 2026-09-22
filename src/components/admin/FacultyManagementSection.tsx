import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Plus,
  Search,
  Mail,
  Phone,
  BookOpen,
  Building,
  Edit2,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../../types';
import { AddAdminFacultyModal } from './AddAdminFacultyModal';

export const FacultyManagementSection: React.FC = () => {
  const { users, courses, currentUser, deleteStaff } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'faculty'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);

  // All administrative & faculty staff (role === 'admin')
  const staffMembers = users.filter((u) => u.role === 'admin');

  const filteredStaff = staffMembers.filter((staff) => {
    const isDeanOrAdmin = (staff.designation || '').toLowerCase().includes('admin') ||
      (staff.designation || '').toLowerCase().includes('dean') ||
      (staff.designation || '').toLowerCase().includes('registrar') ||
      (staff.department || '').toLowerCase().includes('administration');

    if (filterType === 'admin' && !isDeanOrAdmin) return false;
    if (filterType === 'faculty' && isDeanOrAdmin) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        staff.name.toLowerCase().includes(q) ||
        (staff.designation || '').toLowerCase().includes(q) ||
        (staff.department || '').toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        staff.username.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!staffToDelete) return;
    deleteStaff(staffToDelete.id);
    showToast(`Staff member "${staffToDelete.name}" was removed.`);
    setStaffToDelete(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
              Faculty & Academic Administration Roster
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {staffMembers.length} Appointed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage institutional deans, system administrators, department heads, and teaching faculty credentials.
          </p>
        </div>

        <button
          id="btn-add-staff-header"
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin or Faculty</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="input-search-staff"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, department, or email..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Staff ({staffMembers.length})
          </button>
          <button
            onClick={() => setFilterType('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Administrators
          </button>
          <button
            onClick={() => setFilterType('faculty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'faculty'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty & Instructors
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="p-6">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No staff members found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No administrator or faculty matches your current filter query.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => {
              const isCurrentUser = currentUser?.id === staff.id;
              const isDeanOrAdmin = (staff.designation || '').toLowerCase().includes('admin') ||
                (staff.designation || '').toLowerCase().includes('dean') ||
                (staff.department || '').toLowerCase().includes('administration');

              // Find assigned course objects
              const staffCourses = courses.filter((c) =>
                (staff.assignedCourses || []).includes(c.id)
              );

              return (
                <div
                  key={staff.id}
                  id={`staff-card-${staff.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={
                            staff.avatar && !staff.avatar.includes('1534528741775') && !staff.avatar.includes('1573496359142')
                              ? staff.avatar
                              : (staff.name.includes('Sayan')
                                  ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
                                  : (staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`))
                          }
                          alt={staff.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                            {staff.name}
                          </h3>
                          <p className="text-[11px] font-medium text-indigo-700 mt-0.5 truncate">
                            {staff.designation || 'Faculty Member'}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isDeanOrAdmin
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isDeanOrAdmin ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                              <span>{isDeanOrAdmin ? 'Admin' : 'Faculty'}</span>
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{staff.department || 'Academic Affairs'}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Login: <strong className="text-slate-700">{staff.username}</strong></span>
                      </div>

                      {staff.phone && (
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{staff.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Courses */}
                    {staffCourses.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Teaching Load / Courses ({staffCourses.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {staffCourses.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700"
                              title={c.title}
                            >
                              {c.code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Staff Member Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={() => setStaffToDelete(staff)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Staff Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Remove Staff Member Access?
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to revoke credentials and remove <strong>{staffToDelete.name}</strong> ({staffToDelete.designation || 'Staff'}) from the institutional roster?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddAdminFacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingStaff={editingStaff}
        onSuccess={(saved) => {
          showToast(
            editingStaff
              ? `Staff member "${saved.name}" updated successfully.`
              : `Successfully added ${saved.name} as ${saved.designation || 'Faculty / Admin'}!`
          );
        }}
      />
    </div>
  );
};
