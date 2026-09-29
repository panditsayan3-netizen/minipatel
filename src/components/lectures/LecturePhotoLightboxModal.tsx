import React, { useState } from 'react';
import { LectureMedia } from '../../types';
import { useCollege } from '../../context/CollegeContext';
import { useMediaUrl } from '../../utils/mediaStorage';
import { isUserAdminOrFaculty } from '../../utils/auth';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Calendar,
  User,
  BookOpen,
  Tag,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Info,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface LecturePhotoLightboxModalProps {
  lecture: LectureMedia | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const LecturePhotoLightboxModal: React.FC<LecturePhotoLightboxModalProps> = ({
  lecture,
  onClose,
  onDeleted,
}) => {
  const { courses, currentUser, deleteLectureMedia } = useCollege();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const resolvedMediaUrl = useMediaUrl(lecture?.mediaUrl);

  if (!lecture) return null;

  const isFacultyOrAdmin = isUserAdminOrFaculty(currentUser);

  const course = courses.find((c) => c.id === lecture.courseId);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDelete = () => {
    if (!lecture || !isFacultyOrAdmin) return;
    deleteLectureMedia(lecture.id);
    setShowDeleteConfirm(false);
    onClose();
    if (onDeleted) onDeleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-slate-800 text-white z-20">
        <div className="flex items-center space-x-3 truncate">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white font-mono uppercase tracking-wider">
            {lecture.whiteboardNotes ? 'WHITEBOARD' : 'LECTURE PHOTO'}
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            {course?.code}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white truncate font-['Space_Grotesk']">
            {lecture.title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              highContrast
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle High Contrast for Whiteboard Clarity"
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>

          {isFacultyOrAdmin && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-rose-300 hover:text-white hover:bg-rose-600/40 transition-colors cursor-pointer"
              title="Delete Photo Notes"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <a
            href={resolvedMediaUrl || lecture.mediaUrl}
            download={`${lecture.title.replace(/\s+/g, '_')}.jpg`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-sm ml-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Image</span>
          </a>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              showDetails ? 'text-indigo-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Notes & Details"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Banner */}
      {showDeleteConfirm && (
        <div className="bg-rose-950/95 border-b border-rose-800 px-5 py-3 flex items-center justify-between text-white animate-in slide-in-from-top duration-200 z-30">
          <div className="flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-100">Permanently delete these lecture notes?</p>
              <p className="text-xs text-rose-300">
                This will remove &ldquo;{lecture.title}&rdquo; from the course repository.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas View */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4">
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={resolvedMediaUrl || lecture.mediaUrl}
            alt={lecture.title}
            referrerPolicy="no-referrer"
            className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-all ${
              highContrast
                ? 'contrast-150 brightness-110 saturate-50 filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.05)]'
                : ''
            }`}
          />
        </div>

        {/* Floating Details Drawer */}
        {showDetails && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-slate-300">Class Lecture Context</span>
              <span className="text-[11px] font-mono text-slate-400">{lecture.date}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {lecture.description || 'Class whiteboard photograph captured during the lecture session.'}
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 font-medium">
              <div className="flex items-center justify-between">
                <span>Course:</span>
                <span className="font-semibold text-slate-200">{course?.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Instructor / Author:</span>
                <span className="font-semibold text-slate-200">{lecture.uploaderName || course?.instructor}</span>
              </div>
              {lecture.unitOrTopic && (
                <div className="flex items-center justify-between">
                  <span>Syllabus Unit:</span>
                  <span className="font-semibold text-slate-200">{lecture.unitOrTopic}</span>
                </div>
              )}
            </div>

            {lecture.tags && lecture.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-800">
                {lecture.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
