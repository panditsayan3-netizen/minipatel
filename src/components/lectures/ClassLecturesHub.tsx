import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { LectureMedia, Course } from '../../types';
import { UploadLectureModal } from './UploadLectureModal';
import { LectureVideoPlayerModal } from './LectureVideoPlayerModal';
import { LecturePhotoLightboxModal } from './LecturePhotoLightboxModal';
import { useMediaUrl } from '../../utils/mediaStorage';
import { isUserAdminOrFaculty } from '../../utils/auth';
import {
  Video,
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Calendar,
  Clock,
  BookOpen,
  User,
  Play,
  Maximize2,
  Trash2,
  Download,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface ClassLecturesHubProps {
  initialCourseId?: string;
}

interface LectureMediaCardProps {
  lecture: LectureMedia;
  course?: Course;
  canDelete: boolean;
  onOpenVideo: (lec: LectureMedia) => void;
  onOpenPhoto: (lec: LectureMedia) => void;
  onRequestDelete: (lec: LectureMedia) => void;
}

const LectureMediaCard: React.FC<LectureMediaCardProps> = ({
  lecture,
  course,
  canDelete,
  onOpenVideo,
  onOpenPhoto,
  onRequestDelete,
}) => {
  const isVideo = lecture.mediaType === 'video';
  const resolvedThumbnail = useMediaUrl(lecture.thumbnailUrl);
  const resolvedMedia = useMediaUrl(lecture.mediaUrl);

  const fallbackThumbnail = isVideo
    ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80';

  const previewSrc = isVideo
    ? resolvedThumbnail || fallbackThumbnail
    : resolvedMedia || fallbackThumbnail;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-200 flex flex-col">
      {/* Media Preview Container */}
      <div
        className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
        onClick={() => {
          if (isVideo) {
            onOpenVideo(lecture);
          } else {
            onOpenPhoto(lecture);
          }
        }}
      >
        <img
          src={previewSrc}
          alt={lecture.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
        />

        {isVideo ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/25 to-transparent flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {lecture.duration && (
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono font-bold flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{lecture.duration}</span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono shadow-xs ${
              isVideo
                ? 'bg-blue-600 text-white'
                : lecture.whiteboardNotes
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isVideo
              ? 'Video Lecture'
              : lecture.whiteboardNotes
              ? 'Whiteboard'
              : 'Class Photo'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-slate-200 backdrop-blur-xs font-mono">
            {course?.code || 'COURSE'}
          </span>
        </div>

        {lecture.fileSize && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 text-slate-300 text-[10px] font-mono">
            {lecture.fileSize}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{lecture.date}</span>
            </span>
            <span className="text-slate-500 font-mono truncate max-w-[140px]">
              {lecture.uploaderName || course?.instructor}
            </span>
          </div>

          <h3
            onClick={() => {
              if (isVideo) onOpenVideo(lecture);
              else onOpenPhoto(lecture);
            }}
            className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer font-['Space_Grotesk']"
          >
            {lecture.title}
          </h3>

          {lecture.unitOrTopic && (
            <p className="text-[11px] font-semibold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded inline-block">
              {lecture.unitOrTopic}
            </p>
          )}

          {lecture.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {lecture.description}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                if (isVideo) onOpenVideo(lecture);
                else onOpenPhoto(lecture);
              }}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isVideo
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              {isVideo ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect Notes</span>
                </>
              )}
            </button>

            {resolvedMedia && (
              <a
                href={resolvedMedia}
                download={`${lecture.title.replace(/\s+/g, '_')}.${isVideo ? 'mp4' : 'jpg'}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Delete Option for Faculty, Admins, or Uploader */}
          {canDelete && (
            <button
              type="button"
              onClick={() => onRequestDelete(lecture)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete this lecture media"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ClassLecturesHub: React.FC<ClassLecturesHubProps> = ({ initialCourseId }) => {
  const { lectures, courses, currentUser, deleteLectureMedia } = useCollege();

  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'photo'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LectureMedia | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<LectureMedia | null>(null);

  // In-app Delete confirmation dialog state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<LectureMedia | null>(null);

  const isAdminOrFaculty = isUserAdminOrFaculty(currentUser);

  // Filtered lectures
  const filteredLectures = useMemo(() => {
    return lectures.filter((item) => {
      // Filter by type
      if (activeTab !== 'all' && item.mediaType !== activeTab) {
        return false;
      }

      // Filter by course
      if (selectedCourseId !== 'all' && item.courseId !== selectedCourseId) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const course = courses.find((c) => c.id === item.courseId);
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query) || false;
        const matchCourse =
          course?.title.toLowerCase().includes(query) ||
          course?.code.toLowerCase().includes(query) ||
          false;
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        const matchTopic = item.unitOrTopic?.toLowerCase().includes(query) || false;
        const matchInstructor =
          item.uploaderName?.toLowerCase().includes(query) ||
          course?.instructor.toLowerCase().includes(query) ||
          false;

        if (
          !matchTitle &&
          !matchDesc &&
          !matchCourse &&
          !matchTags &&
          !matchTopic &&
          !matchInstructor
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [lectures, courses, activeTab, selectedCourseId, searchQuery, sortBy]);

  const counts = useMemo(() => {
    const total = lectures.length;
    const videos = lectures.filter((l) => l.mediaType === 'video').length;
    const photos = lectures.filter((l) => l.mediaType === 'photo').length;
    return { total, videos, photos };
  }, [lectures]);

  const confirmDeleteAction = () => {
    if (!deleteConfirmItem || !isAdminOrFaculty) return;
    deleteLectureMedia(deleteConfirmItem.id);
    setDeleteConfirmItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Academic Media Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] tracking-tight">
              Class Lectures & Whiteboards
            </h1>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Access full recorded classroom lectures, high-resolution whiteboard captures,
              algorithm proofs, and multimedia notes curated by faculty members.
            </p>
          </div>

          {isAdminOrFaculty && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Video / Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Materials</p>
            <p className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">{counts.total}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lecture Videos</p>
            <p className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">{counts.videos}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Whiteboards & Photos</p>
            <p className="text-2xl font-bold text-slate-900 font-['Space_Grotesk']">{counts.photos}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Materials ({counts.total})
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>Videos ({counts.videos})</span>
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Whiteboards ({counts.photos})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, topics, faculty name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Course Filter:
            </span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Courses ({courses.length})</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} &bull; {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Lecture Materials Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCourseId !== 'all' || activeTab !== 'all'
              ? 'Try resetting your search filters or selecting another course.'
              : 'No videos or photos have been uploaded yet. Faculty members can upload video lectures and whiteboard captures.'}
          </p>
          {isAdminOrFaculty ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Class Material</span>
            </button>
          ) : (
            <p className="text-xs text-indigo-700 font-semibold bg-indigo-50/80 py-1.5 px-3.5 rounded-lg inline-block border border-indigo-100">
              Lecture recordings will appear here once published by course faculty.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => {
            const course = courses.find((c) => c.id === lecture.courseId);
            // Strictly only faculty and admins can delete lecture videos and materials
            const canDelete = isAdminOrFaculty;

            return (
              <LectureMediaCard
                key={lecture.id}
                lecture={lecture}
                course={course}
                canDelete={canDelete}
                onOpenVideo={(lec) => setSelectedVideo(lec)}
                onOpenPhoto={(lec) => setSelectedPhoto(lec)}
                onRequestDelete={(lec) => setDeleteConfirmItem(lec)}
              />
            );
          })}
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Avoids window.confirm iframe restriction) */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Delete Lecture Media
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete &ldquo;
              <strong className="text-slate-900">{deleteConfirmItem.title}</strong>
              &rdquo;? This will remove the video recording and all stored course media.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/30 cursor-pointer transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadLectureModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultCourseId={selectedCourseId !== 'all' ? selectedCourseId : undefined}
      />

      <LectureVideoPlayerModal
        lecture={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onDeleted={() => setSelectedVideo(null)}
      />

      <LecturePhotoLightboxModal
        lecture={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onDeleted={() => setSelectedPhoto(null)}
      />
    </div>
  );
};
