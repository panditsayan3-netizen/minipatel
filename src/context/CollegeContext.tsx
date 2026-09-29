import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, Course, AttendanceRecord, Notification, AttendanceStatus, Assignment, AssignmentSubmission, LectureMedia } from '../types';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_ATTENDANCE, INITIAL_NOTIFICATIONS, INITIAL_ASSIGNMENTS, INITIAL_SUBMISSIONS, INITIAL_LECTURES } from '../mockData';
import { deleteMediaBlob } from '../utils/mediaStorage';
import { isUserAdminOrFaculty } from '../utils/auth';
import {
  fetchPortalData,
  apiSyncWithBackend,
  apiCreateCourse,
  apiUpdateCourse,
  apiDeleteCourse,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiSaveAttendanceBatch,
  apiCreateAssignment,
  apiUpdateAssignment,
  apiDeleteAssignment,
  apiSaveSubmission,
  apiGradeSubmission,
  apiCreateLecture,
  apiUpdateLecture,
  apiDeleteLecture,
  apiCreateNotification,
  apiDeleteNotification,
  apiMarkNotificationRead,
  apiResetDatabase,
} from '../services/api';

interface SubjectAttendanceSummary {
  course: Course;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  records: AttendanceRecord[];
}

interface StudentAttendanceStats {
  overallPercentage: number;
  totalClasses: number;
  totalAttended: number;
  totalAbsent: number;
  totalLate: number;
  subjects: SubjectAttendanceSummary[];
}

interface StudentAssignmentSummary {
  totalEnrolledAssignments: number;
  pending: number;
  submitted: number;
  graded: number;
  avgGrade: number;
}

interface CollegeContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  attendance: AttendanceRecord[];
  notifications: Notification[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  lectures: LectureMedia[];
  apiConnected: boolean;
  isSyncingWithApi: boolean;
  lastSyncedAt: string | null;
  fetchApiData: () => Promise<void>;
  login: (username: string, password: string) => { success: boolean; message?: string };
  switchUser: (userId: string) => void;
  logout: () => void;
  addStudent: (data: {
    name: string;
    username: string;
    password?: string;
    email: string;
    rollNo: string;
    department: string;
    semester: string;
    enrolledCourseIds: string[];
    phone?: string;
  }) => User;
  updateStudent: (id: string, data: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  addAdminOrFaculty: (data: {
    name: string;
    username: string;
    password?: string;
    email: string;
    designation?: string;
    department?: string;
    phone?: string;
    assignedCourses?: string[];
    avatar?: string;
  }) => User;
  updateStaff: (id: string, data: Partial<User>) => void;
  deleteStaff: (id: string) => void;
  updateUserProfile: (id: string, data: Partial<User>) => void;
  addCourse: (data: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  markAttendance: (records: Array<{ studentId: string; courseId: string; date: string; status: AttendanceStatus; remarks?: string }>) => void;
  addNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'readBy'>) => Notification;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getStudentAttendanceStats: (studentId: string) => StudentAttendanceStats;
  addAssignment: (data: Omit<Assignment, 'id' | 'assignedDate'>) => Assignment;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (assignmentId: string, studentId: string, submissionText?: string, attachmentName?: string) => AssignmentSubmission;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  getStudentAssignmentSummary: (studentId: string) => StudentAssignmentSummary;
  addLectureMedia: (data: Omit<LectureMedia, 'id' | 'createdAt'>) => LectureMedia;
  updateLectureMedia: (id: string, data: Partial<LectureMedia>) => void;
  deleteLectureMedia: (id: string) => void;
  resetDemoData: () => void;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'college_portal_users',
  COURSES: 'college_portal_courses',
  ATTENDANCE: 'college_portal_attendance',
  NOTIFICATIONS: 'college_portal_notifications',
  ASSIGNMENTS: 'college_portal_assignments',
  SUBMISSIONS: 'college_portal_submissions',
  LECTURES: 'college_portal_lectures',
  CURRENT_USER_ID: 'college_portal_current_user_id',
  DELETED_USER_IDS: 'college_portal_deleted_user_ids',
  DELETED_COURSE_IDS: 'college_portal_deleted_course_ids',
  DELETED_ASSIGNMENT_IDS: 'college_portal_deleted_assignment_ids',
  DELETED_LECTURE_IDS: 'college_portal_deleted_lecture_ids',
};

function getDeletedSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function addToDeletedSet(key: string, id: string) {
  try {
    const set = getDeletedSet(key);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
}

function removeFromDeletedSet(key: string, id: string) {
  try {
    const set = getDeletedSet(key);
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    }
  } catch {}
}

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const deletedUserIds = getDeletedSet(STORAGE_KEYS.DELETED_USER_IDS);
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((u) => !deletedUserIds.has(u.id));
        }
      } catch (err) {
        console.warn('Error reading saved users from localStorage:', err);
      }
    }
    return INITIAL_USERS.filter((u) => !deletedUserIds.has(u.id));
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const deletedCourseIds = getDeletedSet(STORAGE_KEYS.DELETED_COURSE_IDS);
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (saved) {
      try {
        const parsed: Course[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((c) => !deletedCourseIds.has(c.id));
        }
      } catch {}
    }
    return INITIAL_COURSES.filter((c) => !deletedCourseIds.has(c.id));
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const deletedAssignmentIds = getDeletedSet(STORAGE_KEYS.DELETED_ASSIGNMENT_IDS);
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (saved) {
      try {
        const parsed: Assignment[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((a) => !deletedAssignmentIds.has(a.id));
        }
      } catch {}
    }
    return INITIAL_ASSIGNMENTS.filter((a) => !deletedAssignmentIds.has(a.id));
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [lectures, setLectures] = useState<LectureMedia[]>(() => {
    const deletedLectureIds = getDeletedSet(STORAGE_KEYS.DELETED_LECTURE_IDS);
    const saved = localStorage.getItem(STORAGE_KEYS.LECTURES);
    if (saved) {
      try {
        const parsed: LectureMedia[] = JSON.parse(saved);
        return parsed
          .filter((l) => !deletedLectureIds.has(l.id))
          .filter((l) => l.id !== 'lec-1' && l.id !== 'lec-2');
      } catch {
        return INITIAL_LECTURES.filter((l) => !deletedLectureIds.has(l.id));
      }
    }
    return INITIAL_LECTURES.filter((l) => !deletedLectureIds.has(l.id));
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'usr-student-1';
  });

  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [isSyncingWithApi, setIsSyncingWithApi] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  /**
   * Main API Data Fetching & Bidirectional Sync function
   * Reconciles academic dataset with Express REST backend while preserving
   * any user-added students, courses, or modifications.
   */
  const fetchApiData = useCallback(async () => {
    setIsSyncingWithApi(true);
    try {
      const deletedUserIds = getDeletedSet(STORAGE_KEYS.DELETED_USER_IDS);
      const deletedCourseIds = getDeletedSet(STORAGE_KEYS.DELETED_COURSE_IDS);
      const deletedAssignmentIds = getDeletedSet(STORAGE_KEYS.DELETED_ASSIGNMENT_IDS);
      const deletedLectureIds = getDeletedSet(STORAGE_KEYS.DELETED_LECTURE_IDS);

      // Read current local state to ensure user-added students are never overwritten
      let localUsers: User[] = [];
      try {
        const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (rawUsers) localUsers = JSON.parse(rawUsers);
      } catch {}

      let localCourses: Course[] = [];
      try {
        const rawCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
        if (rawCourses) localCourses = JSON.parse(rawCourses);
      } catch {}

      // Attempt bidirectional sync with server
      let data;
      try {
        data = await apiSyncWithBackend({
          users: localUsers.filter((u) => !deletedUserIds.has(u.id)),
          deletedUserIds: Array.from(deletedUserIds),
          courses: localCourses.filter((c) => !deletedCourseIds.has(c.id)),
          deletedCourseIds: Array.from(deletedCourseIds),
        });
      } catch {
        data = await fetchPortalData();
      }

      if (data) {
        if (Array.isArray(data.users) && data.users.length > 0) {
          const userMap = new Map<string, User>();

          // Add server users that are not deleted
          for (const u of data.users) {
            if (!deletedUserIds.has(u.id)) {
              userMap.set(u.id, u);
            }
          }

          // Ensure local additions (e.g. newly added students) are preserved and uploaded
          for (const u of localUsers) {
            if (deletedUserIds.has(u.id)) continue;
            if (!userMap.has(u.id)) {
              userMap.set(u.id, u);
              apiCreateUser(u).catch(() => {});
            }
          }

          const resolvedUsers = Array.from(userMap.values());
          setUsers(resolvedUsers);
          try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(resolvedUsers));
          } catch {}
        }

        if (Array.isArray(data.courses) && data.courses.length > 0) {
          const courseMap = new Map<string, Course>();
          for (const c of data.courses) {
            if (!deletedCourseIds.has(c.id)) {
              courseMap.set(c.id, c);
            }
          }
          for (const c of localCourses) {
            if (deletedCourseIds.has(c.id)) continue;
            if (!courseMap.has(c.id)) {
              courseMap.set(c.id, c);
              apiCreateCourse(c).catch(() => {});
            }
          }
          const resolvedCourses = Array.from(courseMap.values());
          setCourses(resolvedCourses);
          try {
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(resolvedCourses));
          } catch {}
        }

        if (Array.isArray(data.attendance)) {
          setAttendance(data.attendance);
          try {
            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
          } catch {}
        }

        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          try {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
          } catch {}
        }

        if (Array.isArray(data.assignments)) {
          const validAssignments = data.assignments.filter((a) => !deletedAssignmentIds.has(a.id));
          setAssignments(validAssignments);
          try {
            localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(validAssignments));
          } catch {}
        }

        if (Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
          try {
            localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
          } catch {}
        }

        if (Array.isArray(data.lectures)) {
          const validLectures = data.lectures
            .filter((l) => !deletedLectureIds.has(l.id))
            .filter((l) => l.id !== 'lec-1' && l.id !== 'lec-2');
          setLectures(validLectures);
        }

        setApiConnected(true);
        setLastSyncedAt(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('Backend API data fetch encountered an issue, running with local data:', err);
      setApiConnected(false);
    } finally {
      setIsSyncingWithApi(false);
    }
  }, []);

  // Fetch from backend API on initial application load
  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  // Sync state to local storage as fallback and fast offline availability
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures));
    } catch {
      try {
        const leanLectures = lectures.map((l) => {
          if (l.mediaUrl.length > 50000 && !l.mediaUrl.startsWith('idb:')) {
            return { ...l, mediaUrl: '' };
          }
          return l;
        });
        localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(leanLectures));
      } catch {}
    }
  }, [lectures]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const login = (username: string, password: string) => {
    const trimmedUsername = username.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === trimmedUsername ||
          u.email.toLowerCase() === trimmedUsername ||
          (u.id === 'usr-student-1' &&
            (trimmedUsername === 'sayan.pandit' ||
              trimmedUsername === 'alex.morgan' ||
              trimmedUsername === 'sayan'))) &&
        u.password === password
    );

    if (found) {
      setCurrentUserId(found.id);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
    }
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const addStudent = (data: {
    name: string;
    username: string;
    password?: string;
    email: string;
    rollNo: string;
    department: string;
    semester: string;
    enrolledCourseIds: string[];
    phone?: string;
  }) => {
    const newStudent: User = {
      id: `usr-student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      password: data.password || 'student123',
      role: 'student',
      email: data.email.trim(),
      rollNo: data.rollNo.trim(),
      department: data.department,
      semester: data.semester,
      enrolledCourseIds: data.enrolledCourseIds || [],
      phone: data.phone || '+1 (555) 000-0000',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name.trim())}`,
      cgpa: 3.50,
    };

    removeFromDeletedSet(STORAGE_KEYS.DELETED_USER_IDS, newStudent.id);

    setUsers((prev) => {
      const updated = [newStudent, ...prev.filter((u) => u.id !== newStudent.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return updated;
    });

    apiCreateUser(newStudent).catch((e) => console.warn('API sync warning:', e));
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<User>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...data } : u));
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return updated;
    });
    apiUpdateUser(id, data).catch((e) => console.warn('API sync warning:', e));
  };

  const deleteStudent = (id: string) => {
    addToDeletedSet(STORAGE_KEYS.DELETED_USER_IDS, id);

    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setAttendance((prev) => {
      const updated = prev.filter((a) => a.studentId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSubmissions((prev) => {
      const updated = prev.filter((s) => s.studentId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (currentUserId === id) {
      setCurrentUserId(null);
    }
    apiDeleteUser(id).catch((e) => console.warn('API sync warning:', e));
  };

  const addAdminOrFaculty = (data: {
    name: string;
    username: string;
    password?: string;
    email: string;
    designation?: string;
    department?: string;
    phone?: string;
    assignedCourses?: string[];
    avatar?: string;
  }) => {
    const newStaff: User = {
      id: `usr-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      username: data.username.trim().toLowerCase(),
      password: data.password || 'admin123',
      role: 'admin',
      designation: data.designation || 'Faculty Member',
      email: data.email.trim(),
      department: data.department || 'Computer Science & Engineering',
      phone: data.phone || '+1 (555) 000-0000',
      assignedCourses: data.assignedCourses || [],
      avatar:
        data.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name.trim())}`,
    };

    removeFromDeletedSet(STORAGE_KEYS.DELETED_USER_IDS, newStaff.id);

    setUsers((prev) => {
      const updated = [newStaff, ...prev.filter((u) => u.id !== newStaff.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiCreateUser(newStaff).catch((e) => console.warn('API sync warning:', e));
    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<User>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...data } : u));
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiUpdateUser(id, data).catch((e) => console.warn('API sync warning:', e));
  };

  const deleteStaff = (id: string) => {
    const admins = users.filter((u) => u.role === 'admin');
    if (admins.length <= 1) {
      return;
    }
    addToDeletedSet(STORAGE_KEYS.DELETED_USER_IDS, id);

    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (currentUserId === id) {
      const remaining = admins.find((u) => u.id !== id);
      if (remaining) {
        setCurrentUserId(remaining.id);
      }
    }
    apiDeleteUser(id).catch((e) => console.warn('API sync warning:', e));
  };

  const updateUserProfile = (id: string, data: Partial<User>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...data } : u));
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiUpdateUser(id, data).catch((e) => console.warn('API sync warning:', e));
  };

  const addCourse = (data: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...data,
      id: `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    removeFromDeletedSet(STORAGE_KEYS.DELETED_COURSE_IDS, newCourse.id);

    setCourses((prev) => {
      const updated = [newCourse, ...prev.filter((c) => c.id !== newCourse.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiCreateCourse(newCourse).catch((e) => console.warn('API sync warning:', e));
    return newCourse;
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      try {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiUpdateCourse(id, data).catch((e) => console.warn('API sync warning:', e));
  };

  const deleteCourse = (id: string) => {
    addToDeletedSet(STORAGE_KEYS.DELETED_COURSE_IDS, id);

    setCourses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setUsers((prev) => {
      const updated = prev.map((u) => ({
        ...u,
        enrolledCourseIds: u.enrolledCourseIds?.filter((cId) => cId !== id),
      }));
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setAttendance((prev) => {
      const updated = prev.filter((a) => a.courseId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const courseAssignments = assignments.filter((a) => a.courseId === id);
    const assignmentIds = courseAssignments.map((a) => a.id);
    setAssignments((prev) => {
      const updated = prev.filter((a) => a.courseId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSubmissions((prev) => {
      const updated = prev.filter((s) => !assignmentIds.includes(s.assignmentId));
      try {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiDeleteCourse(id).catch((e) => console.warn('API sync warning:', e));
  };

  const markAttendance = (
    records: Array<{
      studentId: string;
      courseId: string;
      date: string;
      status: AttendanceStatus;
      remarks?: string;
    }>
  ) => {
    const updated = [...attendance];
    for (const rec of records) {
      const existingIdx = updated.findIndex(
        (a) => a.studentId === rec.studentId && a.courseId === rec.courseId && a.date === rec.date
      );
      if (existingIdx >= 0) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: rec.status,
          remarks: rec.remarks ?? updated[existingIdx].remarks,
        };
      } else {
        const newRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...rec,
        };
        updated.push(newRecord);
      }
    }
    setAttendance(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    } catch {}
    apiSaveAttendanceBatch(updated).catch((e) => console.warn('API sync warning:', e));
  };

  const addNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'readBy'>) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      createdAt: formattedDate,
      readBy: [],
    };
    setNotifications((prev) => [newNotif, ...prev]);
    apiCreateNotification(newNotif).catch((e) => console.warn('API sync warning:', e));
    return newNotif;
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    apiDeleteNotification(id).catch((e) => console.warn('API sync warning:', e));
  };

  const markNotificationAsRead = (id: string) => {
    if (!currentUserId) return;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.readBy.includes(currentUserId)) {
          const updated = { ...n, readBy: [...n.readBy, currentUserId] };
          return updated;
        }
        return n;
      })
    );
    apiMarkNotificationRead(id, currentUserId).catch((e) => console.warn('API sync warning:', e));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUserId) return;
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.readBy.includes(currentUserId)) {
          const updated = { ...n, readBy: [...n.readBy, currentUserId] };
          return updated;
        }
        return n;
      })
    );
    notifications.forEach((n) => {
      if (!n.readBy.includes(currentUserId)) {
        apiMarkNotificationRead(n.id, currentUserId).catch(() => {});
      }
    });
  };

  const getStudentAttendanceStats = (studentId: string): StudentAttendanceStats => {
    const student = users.find((u) => u.id === studentId);
    const studentRecords = attendance.filter((a) => a.studentId === studentId);
    const enrolledIds = student?.enrolledCourseIds || [];

    const enrolledCourses = courses.filter((c) => enrolledIds.includes(c.id));

    let overallAttended = 0;
    let overallTotal = 0;
    let overallAbsent = 0;
    let overallLate = 0;

    const subjects: SubjectAttendanceSummary[] = enrolledCourses.map((c) => {
      const cRecords = studentRecords.filter((a) => a.courseId === c.id);
      const total = cRecords.length;
      const attended = cRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
      const absent = cRecords.filter((a) => a.status === 'absent').length;
      const late = cRecords.filter((a) => a.status === 'late').length;

      overallAttended += attended;
      overallTotal += total;
      overallAbsent += absent;
      overallLate += late;

      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

      return {
        course: c,
        totalClasses: total,
        attendedClasses: attended,
        percentage,
        records: cRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    });

    const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;

    return {
      overallPercentage,
      totalClasses: overallTotal,
      totalAttended: overallAttended,
      totalAbsent: overallAbsent,
      totalLate: overallLate,
      subjects,
    };
  };

  const addAssignment = (data: Omit<Assignment, 'id' | 'assignedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newAsg: Assignment = {
      ...data,
      id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      assignedDate: today,
    };
    removeFromDeletedSet(STORAGE_KEYS.DELETED_ASSIGNMENT_IDS, newAsg.id);

    setAssignments((prev) => {
      const updated = [newAsg, ...prev.filter((a) => a.id !== newAsg.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiCreateAssignment(newAsg).catch((e) => console.warn('API sync warning:', e));
    return newAsg;
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    setAssignments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
      try {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiUpdateAssignment(id, data).catch((e) => console.warn('API sync warning:', e));
  };

  const deleteAssignment = (id: string) => {
    addToDeletedSet(STORAGE_KEYS.DELETED_ASSIGNMENT_IDS, id);

    setAssignments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSubmissions((prev) => {
      const updated = prev.filter((s) => s.assignmentId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiDeleteAssignment(id).catch((e) => console.warn('API sync warning:', e));
  };

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    submissionText?: string,
    attachmentName?: string
  ) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const asg = assignments.find((a) => a.id === assignmentId);
    const isLate = asg ? new Date() > new Date(asg.dueDate + 'T23:59:59') : false;

    const existingIdx = submissions.findIndex(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    );

    let resultingSub: AssignmentSubmission;

    if (existingIdx >= 0) {
      resultingSub = {
        ...submissions[existingIdx],
        submittedAt: formattedDate,
        submissionText: submissionText !== undefined ? submissionText : submissions[existingIdx].submissionText,
        attachmentName: attachmentName !== undefined ? attachmentName : submissions[existingIdx].attachmentName,
        status: isLate ? 'late' : (submissions[existingIdx].status === 'graded' ? 'graded' : 'submitted'),
      };
      setSubmissions((prev) => {
        const copy = [...prev];
        copy[existingIdx] = resultingSub;
        try {
          localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(copy));
        } catch {}
        return copy;
      });
    } else {
      resultingSub = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        assignmentId,
        studentId,
        submittedAt: formattedDate,
        submissionText,
        attachmentName,
        status: isLate ? 'late' : 'submitted',
      };
      setSubmissions((prev) => {
        const updated = [resultingSub, ...prev];
        try {
          localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    apiSaveSubmission(resultingSub).catch((e) => console.warn('API sync warning:', e));
    return resultingSub;
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    const evaluatorName = currentUser?.name || 'Academic Faculty';

    setSubmissions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            grade,
            feedback,
            status: 'graded' as const,
            gradedAt: formattedDate,
            gradedBy: evaluatorName,
          };
        }
        return s;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    apiGradeSubmission(submissionId, grade, feedback, evaluatorName).catch((e) =>
      console.warn('API sync warning:', e)
    );
  };

  const getStudentAssignmentSummary = (studentId: string): StudentAssignmentSummary => {
    const student = users.find((u) => u.id === studentId);
    const enrolledIds = student?.enrolledCourseIds || [];
    const enrolledAssignments = assignments.filter((a) => enrolledIds.includes(a.courseId));

    let submittedCount = 0;
    let gradedCount = 0;
    let totalGradePct = 0;

    enrolledAssignments.forEach((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId);
      if (sub) {
        if (sub.status === 'graded') {
          gradedCount++;
          if (sub.grade !== undefined && a.maxMarks > 0) {
            totalGradePct += (sub.grade / a.maxMarks) * 100;
          }
        } else {
          submittedCount++;
        }
      }
    });

    const pendingCount = enrolledAssignments.length - (submittedCount + gradedCount);
    const avgGrade = gradedCount > 0 ? Math.round(totalGradePct / gradedCount) : 0;

    return {
      totalEnrolledAssignments: enrolledAssignments.length,
      pending: Math.max(0, pendingCount),
      submitted: submittedCount,
      graded: gradedCount,
      avgGrade,
    };
  };

  const addLectureMedia = (data: Omit<LectureMedia, 'id' | 'createdAt'>): LectureMedia => {
    if (!isUserAdminOrFaculty(currentUser)) {
      console.warn('Access Denied: Only administrators and faculty can upload video lectures or media.');
      throw new Error('Access Denied: Only administrators and faculty can upload video lectures or class media.');
    }

    const newLecture: LectureMedia = {
      ...data,
      id: `lec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    removeFromDeletedSet(STORAGE_KEYS.DELETED_LECTURE_IDS, newLecture.id);

    setLectures((prev) => {
      const updated = [newLecture, ...prev.filter((l) => l.id !== newLecture.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save to API (omit huge raw data URLs if needed, but standard URLs and metadata persist cleanly)
    const apiPayload = {
      ...newLecture,
      mediaUrl: newLecture.mediaUrl.length > 50000 && !newLecture.mediaUrl.startsWith('http')
        ? 'local:indexeddb'
        : newLecture.mediaUrl,
    };
    apiCreateLecture(apiPayload, currentUser?.id).catch((e) => console.warn('API sync warning:', e));
    return newLecture;
  };

  const updateLectureMedia = (id: string, data: Partial<LectureMedia>) => {
    if (!isUserAdminOrFaculty(currentUser)) {
      console.warn('Access Denied: Only administrators and faculty can edit lecture media.');
      return;
    }
    setLectures((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, ...data } : l));
      try {
        localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiUpdateLecture(id, data).catch((e) => console.warn('API sync warning:', e));
  };

  const deleteLectureMedia = (id: string) => {
    if (!isUserAdminOrFaculty(currentUser)) {
      console.warn('Access Denied: Only administrators and faculty can delete video lectures or media.');
      return;
    }
    addToDeletedSet(STORAGE_KEYS.DELETED_LECTURE_IDS, id);

    setLectures((prev) => {
      const target = prev.find((l) => l.id === id);
      if (target?.mediaUrl) {
        deleteMediaBlob(target.mediaUrl);
      }
      if (target?.thumbnailUrl && target.thumbnailUrl.startsWith('idb:')) {
        deleteMediaBlob(target.thumbnailUrl);
      }
      const updated = prev.filter((l) => l.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    apiDeleteLecture(id, currentUser?.id).catch((e) => console.warn('API sync warning:', e));
  };

  const resetDemoData = () => {
    apiResetDatabase()
      .then((data) => {
        if (data) {
          setUsers(data.users);
          setCourses(data.courses);
          setAttendance(data.attendance);
          setNotifications(data.notifications);
          setAssignments(data.assignments);
          setSubmissions(data.submissions);
          setLectures(data.lectures);
        }
      })
      .catch(() => {
        setUsers(INITIAL_USERS);
        setCourses(INITIAL_COURSES);
        setAttendance(INITIAL_ATTENDANCE);
        setNotifications(INITIAL_NOTIFICATIONS);
        setAssignments(INITIAL_ASSIGNMENTS);
        setSubmissions(INITIAL_SUBMISSIONS);
        setLectures(INITIAL_LECTURES);
      });

    setCurrentUserId('usr-student-1');
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.LECTURES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.DELETED_USER_IDS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_COURSE_IDS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_ASSIGNMENT_IDS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_LECTURE_IDS);
  };

  return (
    <CollegeContext.Provider
      value={{
        currentUser,
        users,
        courses,
        attendance,
        notifications,
        assignments,
        submissions,
        lectures,
        apiConnected,
        isSyncingWithApi,
        lastSyncedAt,
        fetchApiData,
        login,
        switchUser,
        logout,
        addStudent,
        updateStudent,
        deleteStudent,
        addAdminOrFaculty,
        updateStaff,
        deleteStaff,
        updateUserProfile,
        addCourse,
        updateCourse,
        deleteCourse,
        markAttendance,
        addNotification,
        deleteNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getStudentAttendanceStats,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        getStudentAssignmentSummary,
        addLectureMedia,
        updateLectureMedia,
        deleteLectureMedia,
        resetDemoData,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};
