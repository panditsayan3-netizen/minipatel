import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LectureMedia } from '../../types';
import { useCollege } from '../../context/CollegeContext';
import { useMediaUrl } from '../../utils/mediaStorage';
import { isUserAdminOrFaculty } from '../../utils/auth';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Calendar,
  User,
  BookOpen,
  Tag,
  Clock,
  Sparkles,
  Trash2,
  RotateCcw,
  RotateCw,
  Sliders,
  ExternalLink,
  AlertCircle,
  Check,
} from 'lucide-react';

interface LectureVideoPlayerModalProps {
  lecture: LectureMedia | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const LectureVideoPlayerModal: React.FC<LectureVideoPlayerModalProps> = ({
  lecture,
  onClose,
  onDeleted,
}) => {
  const { courses, currentUser, deleteLectureMedia } = useCollege();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useNativeControls, setUseNativeControls] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Resolve media URL (handles idb: IndexedDB blob URLs and remote links)
  const resolvedMediaUrl = useMediaUrl(lecture?.mediaUrl);
  const resolvedThumbnailUrl = useMediaUrl(lecture?.thumbnailUrl);

  const isFacultyOrAdmin = isUserAdminOrFaculty(currentUser);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setShowDeleteConfirm(false);
  }, [lecture]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!lecture) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused on an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lecture, isPlaying, isMuted, showDeleteConfirm]);

  const course = courses.find((c) => c.id === lecture?.courseId);

  // Check if URL is YouTube
  const isYouTube =
    lecture?.mediaUrl?.includes('youtube.com') || lecture?.mediaUrl?.includes('youtu.be');
  let youtubeEmbedUrl = '';
  if (isYouTube && lecture?.mediaUrl) {
    if (lecture.mediaUrl.includes('embed/')) {
      youtubeEmbedUrl = lecture.mediaUrl;
    } else if (lecture.mediaUrl.includes('v=')) {
      const vid = lecture.mediaUrl.split('v=')[1]?.split('&')[0];
      youtubeEmbedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (lecture.mediaUrl.includes('youtu.be/')) {
      const vid = lecture.mediaUrl.split('youtu.be/')[1]?.split('?')[0];
      youtubeEmbedUrl = `https://www.youtube.com/embed/${vid}`;
    } else {
      youtubeEmbedUrl = lecture.mediaUrl;
    }
  }

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback error or blocked by autoplay policy:', e);
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.duration || 100, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setHasError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not available', e);
    }
  };

  const handleDeleteLecture = () => {
    if (!lecture || !isFacultyOrAdmin) return;
    deleteLectureMedia(lecture.id);
    setShowDeleteConfirm(false);
    onClose();
    if (onDeleted) onDeleted();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!lecture) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto max-h-[96vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 text-white z-10">
          <div className="flex items-center space-x-3 truncate">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white font-mono uppercase tracking-wider">
              {course?.code || 'LECTURE'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate font-['Space_Grotesk']">
              {lecture.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Delete Option for Faculty and Admin */}
            {isFacultyOrAdmin && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-rose-500/30"
                title="Permanently remove this lecture video"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Video</span>
              </button>
            )}

            {/* Download Video Link */}
            {resolvedMediaUrl && !isYouTube && (
              <a
                href={resolvedMediaUrl}
                download={`${lecture.title.replace(/\s+/g, '_')}.mp4`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                title="Download lecture video file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            {/* Toggle native browser controls */}
            {!isYouTube && (
              <button
                type="button"
                onClick={() => setUseNativeControls(!useNativeControls)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  useNativeControls
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={useNativeControls ? 'Switch to custom controls' : 'Switch to native browser controls'}
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay Banner */}
        {showDeleteConfirm && (
          <div className="bg-rose-950/90 border-b border-rose-800 px-5 py-3 flex items-center justify-between text-white animate-in slide-in-from-top duration-200 z-20">
            <div className="flex items-center space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold text-rose-100">Permanently delete this lecture video?</p>
                <p className="text-xs text-rose-300">
                  This will remove &ldquo;{lecture.title}&rdquo; from the course portal.
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
                onClick={handleDeleteLecture}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Main Video Presentation Stage */}
        <div className="relative bg-black flex items-center justify-center min-h-[320px] sm:min-h-[460px] max-h-[62vh] w-full overflow-hidden select-none">
          {isYouTube ? (
            <iframe
              src={youtubeEmbedUrl}
              title={lecture.title}
              className="w-full h-[460px] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center group">
              {resolvedMediaUrl ? (
                <video
                  ref={videoRef}
                  src={resolvedMediaUrl}
                  poster={resolvedThumbnailUrl}
                  controls={useNativeControls}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setHasError(true)}
                  onClick={togglePlay}
                  className="w-full h-full object-contain max-h-[62vh] cursor-pointer"
                  playsInline
                />
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                  <p className="text-sm">Loading media source...</p>
                </div>
              )}

              {/* Error fallback overlay if format unsupported */}
              {hasError && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white z-10">
                  <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                  <h3 className="text-base font-bold mb-1">Video Stream Encountered an Issue</h3>
                  <p className="text-xs text-slate-400 max-w-md mb-4">
                    The video encoding or stream source may require opening in an external player or direct download.
                  </p>
                  <div className="flex items-center space-x-3">
                    <a
                      href={resolvedMediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in New Tab</span>
                    </a>
                    <a
                      href={resolvedMediaUrl}
                      download={`${lecture.title}.mp4`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Big Center Play Button Overlay if paused and using custom controls */}
              {!useNativeControls && !isPlaying && !hasError && resolvedMediaUrl && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-auto w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 hover:scale-110 hover:bg-indigo-600 transition-all cursor-pointer z-10"
                  title="Play Lecture Video (Space)"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
              )}

              {/* Bottom Custom Video Controls */}
              {!useNativeControls && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 space-y-2 opacity-95 group-hover:opacity-100 transition-opacity">
                  {/* Progress / Scrub Bar */}
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[11px] font-mono text-slate-300 w-12 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1.5 bg-slate-700 hover:h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all"
                    />
                    <span className="text-[11px] font-mono text-slate-400 w-12">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* Playback Controls Toolbar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {/* Play/Pause */}
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
                        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                      </button>

                      {/* Rewind 10s */}
                      <button
                        type="button"
                        onClick={() => seekRelative(-10)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                        title="Rewind 10s (Left Arrow)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Forward 10s */}
                      <button
                        type="button"
                        onClick={() => seekRelative(10)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                        title="Skip forward 10s (Right Arrow)"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Volume Slider & Mute */}
                      <div className="flex items-center space-x-1.5 text-white pl-1">
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Right Controls: Speed, PiP, Fullscreen */}
                    <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
                      {/* Playback Speed Pill Buttons */}
                      <div className="flex items-center space-x-1 bg-slate-800/90 rounded-md p-0.5 border border-slate-700">
                        {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => changeSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                              playbackSpeed === spd
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      {/* PiP button */}
                      <button
                        type="button"
                        onClick={togglePiP}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                        title="Picture in Picture"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {/* Fullscreen button */}
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
                        title="Toggle Fullscreen (F)"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Info and Metadata Section */}
        <div className="p-5 sm:p-6 bg-slate-900 border-t border-slate-800 text-slate-300 overflow-y-auto max-h-[30vh]">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-3">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lecture Date: <strong className="text-slate-200">{lecture.date}</strong></span>
            </span>

            {lecture.duration && (
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Duration: <strong className="text-slate-200">{lecture.duration}</strong></span>
              </span>
            )}

            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Faculty: <strong className="text-indigo-300">{lecture.uploaderName || course?.instructor}</strong></span>
            </span>

            {lecture.unitOrTopic && (
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Topic: <strong className="text-slate-200">{lecture.unitOrTopic}</strong></span>
              </span>
            )}
          </div>

          {lecture.description && (
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lecture Summary & Key Concepts</span>
              </p>
              <p>{lecture.description}</p>
            </div>
          )}

          {lecture.tags && lecture.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <Tag className="w-3.5 h-3.5 text-slate-500 mr-1" />
              {lecture.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-indigo-300 border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
