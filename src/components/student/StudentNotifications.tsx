import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Bell,
  Search,
  CheckCircle2,
  Pin,
  AlertTriangle,
  Calendar,
  GraduationCap,
  Sparkles,
  Info,
  Clock,
  User,
} from 'lucide-react';
import { NotificationCategory, Notification } from '../../types';

export const StudentNotifications: React.FC = () => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useCollege();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  if (!currentUser) return null;

  // Filter for student visibility
  const relevantNotifs = notifications.filter(
    (n) => n.targetRole === 'all' || n.targetRole === 'student'
  );

  const filteredNotifs = relevantNotifs
    .filter((n) => {
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (
        searchQuery &&
        !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.author.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned first, then by date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const unreadCount = relevantNotifs.filter((n) => !n.readBy.includes(currentUser.id)).length;

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
      case 'general':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Info className="w-3 h-3 text-slate-500" />
            <span>General</span>
          </span>
        );
    }
  };

  const handleCardClick = (notif: Notification) => {
    markNotificationAsRead(notif.id);
    setSelectedNotif(notif);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Campus Announcements & Circulars
          </h1>
          <p className="text-sm text-slate-500">
            Official academic notifications, schedules, events, and administrative circulars
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mark All As Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {['all', 'academic', 'exam', 'event', 'urgent'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No circulars found</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for university bulletins.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const isUnread = !notif.readBy.includes(currentUser.id);
            return (
              <div
                key={notif.id}
                onClick={() => handleCardClick(notif)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-blue-50/40 border-blue-200 shadow-xs hover:border-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                } relative`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    {getCategoryBadge(notif.category)}
                    {notif.isPinned && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                    )}
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {notif.createdAt}
                  </span>
                </div>

                <h3 className={`text-base font-bold font-['Space_Grotesk'] ${isUnread ? 'text-blue-950' : 'text-slate-900'}`}>
                  {notif.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issued by: <strong className="text-slate-700">{notif.author}</strong></span>
                  </div>
                  <span className="text-blue-600 font-semibold hover:underline">
                    Read Full Bulletin &rarr;
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Modal for Circular */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getCategoryBadge(selectedNotif.category)}
                {selectedNotif.isPinned && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-amber-600" />
                    Pinned
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                {selectedNotif.title}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                <span>Published: {selectedNotif.createdAt}</span>
                <span>&bull;</span>
                <span>By: {selectedNotif.author}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedNotif.message}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
