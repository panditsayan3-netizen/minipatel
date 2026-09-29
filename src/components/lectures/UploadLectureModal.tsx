import React, { useState, useRef } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { LectureMedia, LectureMediaType } from '../../types';
import { saveMediaBlob, generateVideoThumbnail } from '../../utils/mediaStorage';
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { isUserAdminOrFaculty } from '../../utils/auth';

interface UploadLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
  defaultMediaType?: LectureMediaType;
}

const PRESET_SAMPLES = [
  {
    title: 'Lecture 16: Dynamic Programming - Matrix Chain Multiplication',
    mediaType: 'video' as LectureMediaType,
    courseCode: 'CS-301',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    duration: '47 min',
    fileSize: '178 MB',
    unitOrTopic: 'Unit 4: Dynamic Programming',
    tags: ['Dynamic Programming', 'Memoization', 'Algorithms', 'Matrix Chain'],
    description: 'Detailed explanation of optimal substructure, recursive tree breakdown, and tabular DP bottom-up calculation.',
  },
  {
    title: 'Whiteboard Capture: B-Tree Node Splitting & Rebalancing Proof',
    mediaType: 'photo' as LectureMediaType,
    courseCode: 'CS-304',
    mediaUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    duration: '',
    fileSize: '4.2 MB',
    unitOrTopic: 'Unit 3: File Organization & Indexing',
    tags: ['Whiteboard Notes', 'B-Tree', 'Database', 'Indexing'],
    description: 'Classroom blackboard diagram illustrating overflow node split and pointer adjustments in degree-3 B-trees.',
    whiteboardNotes: true,
  },
  {
    title: 'Whiteboard Summary: Kubernetes Pod Lifecycle & Service Mesh',
    mediaType: 'photo' as LectureMediaType,
    courseCode: 'CS-308',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    duration: '',
    fileSize: '3.9 MB',
    unitOrTopic: 'Unit 4: Cloud Infrastructure',
    tags: ['Whiteboard Notes', 'Kubernetes', 'Cloud', 'Microservices'],
    description: 'Whiteboard sketch of kube-proxy iptables routing and Envoy sidecar container proxying in distributed clusters.',
    whiteboardNotes: true,
  },
];

export const UploadLectureModal: React.FC<UploadLectureModalProps> = ({
  isOpen,
  onClose,
  defaultCourseId,
  defaultMediaType = 'video',
}) => {
  const { courses, currentUser, addLectureMedia } = useCollege();

  const isAdminOrFaculty = isUserAdminOrFaculty(currentUser);

  const [mediaType, setMediaType] = useState<LectureMediaType>(defaultMediaType);
  const [courseId, setCourseId] = useState<string>(
    defaultCourseId || (courses.length > 0 ? courses[0].id : '')
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitOrTopic, setUnitOrTopic] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [whiteboardNotes, setWhiteboardNotes] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [facultyUploader, setFacultyUploader] = useState(
    isAdminOrFaculty ? currentUser?.name || 'Prof. Rajesh Verma' : 'Prof. Rajesh Verma'
  );

  // Upload method: 'file' | 'url'
  const [uploadSource, setUploadSource] = useState<'file' | 'url'>('file');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  if (!isAdminOrFaculty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
              Access Restricted
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Authorized Faculty & Administrators Only
            </p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Only campus faculty members and university administrators are permitted to upload recorded classroom videos, whiteboard notes, and lecture media.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = async (file: File) => {
    setErrorMessage('');
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMessage('Please select a valid image (PNG, JPG, WebP) or video (MP4, WebM, MOV) file.');
      return;
    }

    // Auto-align media type if user uploaded image while video was selected
    if (isImage) {
      setMediaType('photo');
    } else if (isVideo) {
      setMediaType('video');
    }

    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);

    setIsProcessingFile(true);

    try {
      const fileId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const storageKey = await saveMediaBlob(fileId, file);
      setMediaUrl(storageKey);

      if (isVideo) {
        const thumb = await generateVideoThumbnail(file);
        if (thumb) {
          setPreviewUrl(thumb);
        } else {
          setPreviewUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80');
        }
      } else {
        const objUrl = URL.createObjectURL(file);
        setPreviewUrl(objUrl);
      }

      if (!title) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setTitle(cleanName);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage('Could not process media file. Please try another file or enter an external URL.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleApplyPreset = (preset: (typeof PRESET_SAMPLES)[0]) => {
    const matchedCourse = courses.find((c) => c.code === preset.courseCode) || courses[0];
    setMediaType(preset.mediaType);
    if (matchedCourse) setCourseId(matchedCourse.id);
    setTitle(preset.title);
    setDescription(preset.description);
    setUnitOrTopic(preset.unitOrTopic);
    setDuration(preset.duration);
    setFileSize(preset.fileSize);
    setMediaUrl(preset.mediaUrl);
    setPreviewUrl(preset.thumbnailUrl || preset.mediaUrl);
    setTags(preset.tags);
    setWhiteboardNotes(preset.whiteboardNotes || false);
    setUploadSource('url');
    setFileName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAdminOrFaculty) {
      setErrorMessage('Access Denied: Only administrators and faculty can upload videos or class materials.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter a lecture title.');
      return;
    }

    if (!courseId) {
      setErrorMessage('Please select a course offering.');
      return;
    }

    if (!mediaUrl.trim()) {
      setErrorMessage('Please upload a file or enter a valid media URL.');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === courseId);

    addLectureMedia({
      courseId,
      title: title.trim(),
      description: description.trim() || undefined,
      mediaType,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: previewUrl || (mediaType === 'photo' ? mediaUrl.trim() : undefined),
      uploadedBy: currentUser?.id || 'usr-faculty-1',
      uploaderName: facultyUploader.trim() || currentUser?.name || 'Prof. Rajesh Verma',
      date,
      duration: mediaType === 'video' ? duration.trim() || '45 min' : undefined,
      fileSize: fileSize || (mediaType === 'video' ? '120 MB' : '3.5 MB'),
      tags: tags.length > 0 ? tags : [mediaType === 'video' ? 'Lecture Video' : 'Whiteboard Notes'],
      unitOrTopic: unitOrTopic.trim() || (selectedCourse ? selectedCourse.syllabus[0] : undefined),
      whiteboardNotes: mediaType === 'photo' ? whiteboardNotes : false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] leading-tight">
                Upload Class Lecture Media
              </h2>
              <p className="text-xs text-blue-100">
                Share video recordings, whiteboard captures, and class lecture photos with students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-medium shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Quick Demo Presets:</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {PRESET_SAMPLES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                {preset.mediaType === 'video' ? '🎬' : '📸'} {preset.courseCode} {preset.mediaType === 'video' ? 'Video' : 'Whiteboard'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Media Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Material Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  if (!whiteboardNotes) setWhiteboardNotes(false);
                }}
                className={`flex items-center space-x-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    mediaType === 'video' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Class Lecture Video</p>
                  <p className="text-xs text-slate-500">Recorded sessions, lab demos & tutorials</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType('photo');
                  setWhiteboardNotes(true);
                }}
                className={`flex items-center space-x-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  mediaType === 'photo'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    mediaType === 'photo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Whiteboard / Photo</p>
                  <p className="text-xs text-slate-500">Whiteboard captures, handwritten notes & slides</p>
                </div>
              </button>
            </div>
          </div>

          {/* Upload Method: File Drag & Drop vs Web URL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upload Source *
              </label>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadSource('file')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    uploadSource === 'file'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Upload File from Device
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSource('url')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    uploadSource === 'url'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Enter Web / Video URL
                </button>
              </div>
            </div>

            {uploadSource === 'file' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  mediaUrl
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isProcessingFile ? (
                  <div className="py-4 flex flex-col items-center">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs font-bold text-slate-700">Encoding and reading file...</p>
                  </div>
                ) : mediaUrl ? (
                  <div className="flex items-center justify-center space-x-3 text-emerald-800">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-sm">
                        {fileName || 'File Attached Successfully'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {fileSize || 'Ready for upload'} &bull; Click to choose another file
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag and drop your {mediaType === 'video' ? 'lecture video' : 'whiteboard photo'} here
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        or <span className="text-indigo-600 font-bold underline">browse from your computer</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports {mediaType === 'video' ? 'MP4, WebM, MOV' : 'JPG, PNG, WebP'} (up to 50MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder={
                      mediaType === 'video'
                        ? 'e.g., https://.../lecture.mp4 or YouTube video link'
                        : 'e.g., https://.../whiteboard-notes.jpg'
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Paste any direct media link, cloud storage public link, or video stream URL.
                </p>
              </div>
            )}
          </div>

          {/* Course, Faculty & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Course Offering *</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden cursor-pointer"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code}: {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Faculty Instructor *</span>
              </label>
              <input
                type="text"
                value={facultyUploader}
                onChange={(e) => setFacultyUploader(e.target.value)}
                placeholder="e.g. Prof. Rajesh Verma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Class Session Date *</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Title & Unit / Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lecture / Topic Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lecture 14: AVL Tree Balancing Rotations"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Syllabus Unit / Chapter
              </label>
              <input
                type="text"
                value={unitOrTopic}
                onChange={(e) => setUnitOrTopic(e.target.value)}
                placeholder="e.g. Unit 3: Graph Theory"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Video Duration / Whiteboard Notes Pill */}
          {mediaType === 'video' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Duration</span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 52 min or 1 hr 15 min"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated File Size
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="e.g. 185 MB"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="check-whiteboard"
                checked={whiteboardNotes}
                onChange={(e) => setWhiteboardNotes(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="check-whiteboard" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Tag as Classroom Whiteboard / Blackboard Capture (Optimized for text inspection & contrast)
              </label>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Key Takeaways
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what was taught, key formulas derived, homework hints, or lab instructions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tags & Keywords
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type a tag and press Add (e.g. Exam Prep, Lab Demo)..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Lecture Material</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
