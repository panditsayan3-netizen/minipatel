import { Course, User, AttendanceRecord, Notification, Assignment, AssignmentSubmission, LectureMedia } from '../types';

export interface PortalApiResponse {
  success: boolean;
  timestamp: string;
  data: {
    users: User[];
    courses: Course[];
    attendance: AttendanceRecord[];
    notifications: Notification[];
    assignments: Assignment[];
    submissions: AssignmentSubmission[];
    lectures: LectureMedia[];
  };
}

const API_BASE = '/api';

/**
 * Fetch entire academic portal dataset from backend API
 */
export async function fetchPortalData(): Promise<PortalApiResponse['data']> {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) {
    throw new Error(`API fetch error: ${res.status} ${res.statusText}`);
  }
  const json: PortalApiResponse = await res.json();
  return json.data;
}

/**
 * Bulk sync with backend database
 */
export async function apiSyncWithBackend(payload: {
  users?: User[];
  deletedUserIds?: string[];
  courses?: Course[];
  deletedCourseIds?: string[];
}): Promise<PortalApiResponse['data']> {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`API sync error: ${res.status} ${res.statusText}`);
  }
  const json: PortalApiResponse = await res.json();
  return json.data;
}

/**
 * Health check endpoint
 */
export async function checkApiHealth(): Promise<{ status: string; timestamp: string; counts?: Record<string, number> }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Courses API
 */
export async function apiFetchCourses(): Promise<Course[]> {
  const res = await fetch(`${API_BASE}/courses`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function apiCreateCourse(course: Course): Promise<Course> {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });
  if (!res.ok) throw new Error('Failed to create course');
  return res.json();
}

export async function apiUpdateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  const res = await fetch(`${API_BASE}/courses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update course');
  return res.json();
}

export async function apiDeleteCourse(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/courses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete course');
}

/**
 * Users API (Students & Faculty/Admin)
 */
export async function apiFetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function apiCreateUser(user: User): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function apiUpdateUser(id: string, updates: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function apiDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

/**
 * Attendance API
 */
export async function apiFetchAttendance(): Promise<AttendanceRecord[]> {
  const res = await fetch(`${API_BASE}/attendance`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function apiSaveAttendanceBatch(records: AttendanceRecord[]): Promise<AttendanceRecord[]> {
  const res = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  if (!res.ok) throw new Error('Failed to save attendance');
  const result = await res.json();
  return result.attendance || records;
}

/**
 * Assignments API
 */
export async function apiFetchAssignments(): Promise<Assignment[]> {
  const res = await fetch(`${API_BASE}/assignments`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function apiCreateAssignment(asg: Assignment): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asg),
  });
  if (!res.ok) throw new Error('Failed to create assignment');
  return res.json();
}

export async function apiUpdateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/assignments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update assignment');
  return res.json();
}

export async function apiDeleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/assignments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete assignment');
}

/**
 * Submissions API
 */
export async function apiFetchSubmissions(): Promise<AssignmentSubmission[]> {
  const res = await fetch(`${API_BASE}/submissions`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
}

export async function apiSaveSubmission(sub: AssignmentSubmission): Promise<AssignmentSubmission> {
  const res = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
  if (!res.ok) throw new Error('Failed to save submission');
  return res.json();
}

export async function apiGradeSubmission(id: string, grade: number, feedback: string, gradedBy: string): Promise<AssignmentSubmission> {
  const res = await fetch(`${API_BASE}/submissions/${encodeURIComponent(id)}/grade`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade, feedback, gradedBy }),
  });
  if (!res.ok) throw new Error('Failed to grade submission');
  return res.json();
}

/**
 * Lectures / Media API
 */
export async function apiFetchLectures(): Promise<LectureMedia[]> {
  const res = await fetch(`${API_BASE}/lectures`);
  if (!res.ok) throw new Error('Failed to fetch lectures');
  return res.json();
}

export async function apiCreateLecture(lecture: LectureMedia, requesterUserId?: string): Promise<LectureMedia> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (requesterUserId) {
    headers['x-user-id'] = requesterUserId;
  }
  const res = await fetch(`${API_BASE}/lectures`, {
    method: 'POST',
    headers,
    body: JSON.stringify(lecture),
  });
  if (!res.ok) throw new Error('Failed to add lecture');
  return res.json();
}

export async function apiUpdateLecture(id: string, updates: Partial<LectureMedia>): Promise<LectureMedia> {
  const res = await fetch(`${API_BASE}/lectures/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lecture');
  return res.json();
}

export async function apiDeleteLecture(id: string, requesterUserId?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (requesterUserId) {
    headers['x-user-id'] = requesterUserId;
  }
  const res = await fetch(`${API_BASE}/lectures/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete lecture');
}

/**
 * Notifications API
 */
export async function apiFetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function apiCreateNotification(notif: Notification): Promise<Notification> {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notif),
  });
  if (!res.ok) throw new Error('Failed to create notification');
  return res.json();
}

export async function apiMarkNotificationRead(id: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to mark notification read');
}

export async function apiDeleteNotification(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete notification');
}

/**
 * Reset Demo Data API
 */
export async function apiResetDatabase(): Promise<PortalApiResponse['data']> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset database');
  const json: PortalApiResponse = await res.json();
  return json.data;
}
