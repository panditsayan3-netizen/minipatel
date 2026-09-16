import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  BookOpen,
  Clock,
  MapPin,
  User,
  GraduationCap,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Search,
} from 'lucide-react';
import { Course } from '../../types';

export const StudentCourses: React.FC = () => {
  const { currentUser, courses, attendance } = useCollege();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'all'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSyllabusCourseId, setExpandedSyllabusCourseId] = useState<string | null>(null);

  if (!currentUser) return null;

  const enrolledCourseIds = currentUser.enrolledCourseIds || [];
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  // If user selected "all", show university catalogue
  const displayCourses = (activeTab === 'enrolled' ? enrolledCourses : courses).filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCourseAttendance = (courseId: string) => {
    const records = attendance.filter(
      (a) => a.studentId === currentUser.id && a.courseId === courseId
    );
    if (records.length === 0) return { attended: 0, total: 0, percentage: 100 };
    const attended = records.filter((a) => a.status === 'present' || a.status === 'late').length;
    return {
      attended,
      total: records.length,
      percentage: Math.round((attended / records.length) * 100),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Course Curriculum & Materials
          </h1>
          <p className="text-sm text-slate-500">
            Enrolled in {enrolledCourses.length} active courses &bull; {enrolledCourses.reduce((sum, c) => sum + c.credits, 0)} semester credits
          </p>
        </div>

        {/* Tab & Search */}
        <div className="flex items-center space-x-2">
          <div className="flex p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'enrolled'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Enrolled ({enrolledCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              College Catalog ({courses.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course code, title, professor, or department..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayCourses.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No courses match your search.</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying keywords or clear filters.</p>
          </div>
        ) : (
          displayCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const att = getCourseAttendance(course.id);
            const isSyllabusOpen = expandedSyllabusCourseId === course.id;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                        {course.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {course.credits} Credits
                      </span>
                    </div>

                    {isEnrolled ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                        Available Elective
                      </span>
                    )}
                  </div>

                  {/* Course Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Info Meta Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.room}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.department}</span>
                    </div>
                  </div>

                  {/* If enrolled, show attendance pill */}
                  {isEnrolled && (
                    <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Your Course Attendance:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        att.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.percentage}% ({att.attended}/{att.total} held)
                      </span>
                    </div>
                  )}

                  {/* Expandable Syllabus Module Section */}
                  {isSyllabusOpen && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Course Syllabus & Key Modules
                      </h4>
                      <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-700">
                        {course.syllabus.map((topic, index) => (
                          <li key={index} className="leading-normal">
                            <span className="font-medium text-slate-800">{topic}</span>
                          </li>
                        ))}
                      </ol>

                      {/* Downloadable materials preview */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lecture Slides & Lab Manuals (PDF)</span>
                        </span>
                        <button
                          onClick={() => alert(`Downloading syllabus & reading notes for ${course.code}`)}
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Pack</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{course.syllabus.length} Curriculum Units</span>
                  <button
                    onClick={() =>
                      setExpandedSyllabusCourseId(isSyllabusOpen ? null : course.id)
                    }
                    className="inline-flex items-center space-x-1 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>{isSyllabusOpen ? 'Hide Syllabus' : 'View Syllabus & Materials'}</span>
                    {isSyllabusOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
