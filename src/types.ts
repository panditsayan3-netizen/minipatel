export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  designation?: string;
  email: string;
  altEmail?: string;
  avatar?: string;
  rollNo?: string;
  department?: string;
  semester?: string;
  enrolledCourseIds?: string[];
  cgpa?: number;
  phone?: string;
  assignedCourses?: string[];
  bio?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  officeLocation?: string;
  officeHours?: string;
  linkedin?: string;
  github?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  description: string;
  syllabus: string[];
  semester: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export type NotificationCategory = 'academic' | 'exam' | 'event' | 'urgent' | 'general';

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  targetRole: 'all' | 'student' | 'admin';
  department?: string; // 'all' or specific department
  createdAt: string;
  author: string;
  isPinned?: boolean;
  readBy: string[]; // user IDs who have read
}

export type AssignmentStatus = 'active' | 'closed';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  assignedDate: string; // YYYY-MM-DD
  maxMarks: number;
  attachmentName?: string;
  submissionType: 'text' | 'file' | 'both';
  status: AssignmentStatus;
}

export type SubmissionStatus = 'submitted' | 'graded' | 'late';

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  submissionText?: string;
  attachmentName?: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export type LectureMediaType = 'video' | 'photo';

export interface LectureMedia {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  mediaType: LectureMediaType;
  mediaUrl: string; // Base64 data URL or external video/image URL
  thumbnailUrl?: string;
  uploadedBy: string; // User ID or username
  uploaderName?: string;
  date: string; // YYYY-MM-DD (lecture session date)
  createdAt: string; // ISO date string
  duration?: string; // e.g. "45 min" for videos
  fileSize?: string; // e.g. "24.5 MB"
  tags?: string[];
  unitOrTopic?: string;
  whiteboardNotes?: boolean;
}

