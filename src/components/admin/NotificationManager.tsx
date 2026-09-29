import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Bell,
  Megaphone,
  Plus,
  Trash2,
  Pin,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Info,
  Check,
  X,
  Users,
} from 'lucide-react';
import { NotificationCategory, Notification } from '../../types';

export const NotificationManager: React.FC = () => {
  const { notifications, addNotification, deleteNotification, currentUser } = useCollege();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [notifToDelete, setNotifToDelete] = useState<Notification | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'academic' as NotificationCategory,
    targetRole: 'all' as 'all' | 'student' | 'admin',
    author: currentUser?.name ? `Office of ${currentUser.name}` : 'Academic Administration',
    isPinned: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    addNotification({
      title: formData.title.trim(),
      message: formData.message.trim(),
      category: formData.category,
      targetRole: formData.targetRole,
      author: formData.author.trim() || 'Administration',
      isPinned: formData.isPinned,
    });

    setIsModalOpen(false);
    setToast(`Circular "${formData.title}" successfully broadcast to ${formData.targetRole.toUpperCase()}!`);
    setTimeout(() => setToast(null), 4000);

    // Reset
    setFormData({
      title: '',
      message: '',
      category: 'academic',
      targetRole: 'all',
      author: currentUser?.name ? `Office of ${currentUser.name}` : 'Academic Administration',
      isPinned: false,
    });
  };

  const handleDelete = (notif: Notification) => {
    setNotifToDelete(notif);
  };

  const confirmDeleteNotif = () => {
    if (!notifToDelete) return;
    deleteNotification(notifToDelete.id);
    setToast('Notice removed.');
    setNotifToDelete(null);
    setTimeout(() => setToast(null), 3000);
  };

  const getCategoryBadge = (cat: NotificationCategory) => {
    switch (cat) {
      case 'exam':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Examinations</span>
          </span>
        );
      case 'academic':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            <span>Academic</span>
          </span>
        );
      case 'event':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Campus Event</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Urgent Notice</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Info className="w-3 h-3 text-slate-500" />
            <span>General Notice</span>
          </span>
        );
    }
  };

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
            Announcements & Circulars Broadcast
          </h1>
          <p className="text-sm text-slate-500">
            Publish official notices to student dashboards, department boards, and faculty consoles
          </p>
        </div>

        <button
          id="btn-open-broadcast-modal"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast New Notice</span>
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active circulars.</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Broadcast New Notice&quot; to issue an official announcement.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    {getCategoryBadge(notif.category)}
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      Target: {notif.targetRole}
                    </span>
                    {notif.isPinned && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <Pin className="w-3 h-3 fill-amber-600" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">{notif.createdAt}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  {notif.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                  {notif.message}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span>Issued By: <strong className="text-slate-700">{notif.author}</strong></span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{notif.readBy.length} Reads</span>
                  </span>
                </div>

                <button
                  id={`btn-delete-notif-${notif.id}`}
                  onClick={() => handleDelete(notif)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                  title="Delete Circular"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                  Broadcast Campus Notice
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
              {/* Category & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as NotificationCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="academic">Academic Circular</option>
                    <option value="exam">Examination Schedule / Rules</option>
                    <option value="event">Campus Event / Symposium</option>
                    <option value="urgent">Urgent Warning / Deadline</option>
                    <option value="general">General Administrative Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Recipient Audience *
                  </label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as 'all' | 'student' | 'admin' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="all">Entire University (All Students & Admins)</option>
                    <option value="student">Students Only</option>
                    <option value="admin">Faculty & Administration Only</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Circular Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. End-Term Project Submissions & Seating Arrangements"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Message & Directives *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide comprehensive details, deadlines, contacts, and guidelines..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Author & Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Office of the Registrar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Pin to top of notice board</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-broadcast-notif"
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
