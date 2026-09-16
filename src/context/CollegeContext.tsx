import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Course, AttendanceRecord, Notification, AttendanceStatus, Assignment, AssignmentSubmission } from '../types';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_ATTENDANCE, INITIAL_NOTIFICATIONS, INITIAL_ASSIGNMENTS, INITIAL_SUBMISSIONS } from '../mockData';

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
  CURRENT_USER_ID: 'college_portal_current_user_id',
};

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
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
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'usr-student-1'; // Default to Alex Morgan for immediate pleasant preview
  });

  // Sync to local storage
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
      (u) => u.username.toLowerCase() === trimmedUsername && u.password === password
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
      id: `usr-student-${Date.now()}`,
      name: data.name,
      username: data.username.toLowerCase(),
      password: data.password || 'student123',
      role: 'student',
      email: data.email,
      rollNo: data.rollNo,
      department: data.department,
      semester: data.semester,
      enrolledCourseIds: data.enrolledCourseIds,
      phone: data.phone || '+1 (555) 000-0000',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      cgpa: 3.50,
    };

    setUsers((prev) => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const deleteStudent = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // Also remove their attendance & submissions
    setAttendance((prev) => prev.filter((a) => a.studentId !== id));
    setSubmissions((prev) => prev.filter((s) => s.studentId !== id));
    if (currentUserId === id) {
      setCurrentUserId(null);
    }
  };

  const addCourse = (data: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...data,
      id: `course-${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    // Remove course from students enrolled lists
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        enrolledCourseIds: u.enrolledCourseIds?.filter((cId) => cId !== id),
      }))
    );
    // Remove course attendance records
    setAttendance((prev) => prev.filter((a) => a.courseId !== id));
    // Remove assignments and associated submissions for this course
    const courseAssignments = assignments.filter((a) => a.courseId === id);
    const assignmentIds = courseAssignments.map((a) => a.id);
    setAssignments((prev) => prev.filter((a) => a.courseId !== id));
    setSubmissions((prev) => prev.filter((s) => !assignmentIds.includes(s.assignmentId)));
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
    setAttendance((prev) => {
      // Create a map or filter out existing records for same student, course, and date
      const updated = [...prev];
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
          updated.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...rec,
          });
        }
      }
      return updated;
    });
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
    return newNotif;
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    if (!currentUserId) return;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.readBy.includes(currentUserId)) {
          return { ...n, readBy: [...n.readBy, currentUserId] };
        }
        return n;
      })
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUserId) return;
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.readBy.includes(currentUserId)) {
          return { ...n, readBy: [...n.readBy, currentUserId] };
        }
        return n;
      })
    );
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
      id: `asg-${Date.now()}`,
      assignedDate: today,
    };
    setAssignments((prev) => [newAsg, ...prev]);
    return newAsg;
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
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

    if (existingIdx >= 0) {
      const updatedSubmission: AssignmentSubmission = {
        ...submissions[existingIdx],
        submittedAt: formattedDate,
        submissionText: submissionText !== undefined ? submissionText : submissions[existingIdx].submissionText,
        attachmentName: attachmentName !== undefined ? attachmentName : submissions[existingIdx].attachmentName,
        status: isLate ? 'late' : (submissions[existingIdx].status === 'graded' ? 'graded' : 'submitted'),
      };
      setSubmissions((prev) => {
        const copy = [...prev];
        copy[existingIdx] = updatedSubmission;
        return copy;
      });
      return updatedSubmission;
    }

    const newSubmission: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId,
      submittedAt: formattedDate,
      submissionText,
      attachmentName,
      status: isLate ? 'late' : 'submitted',
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    return newSubmission;
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            grade,
            feedback,
            status: 'graded',
            gradedAt: formattedDate,
            gradedBy: currentUser?.name || 'Academic Faculty',
          };
        }
        return s;
      })
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

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setCourses(INITIAL_COURSES);
    setAttendance(INITIAL_ATTENDANCE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setCurrentUserId('usr-student-1');
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
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
        login,
        switchUser,
        logout,
        addStudent,
        updateStudent,
        deleteStudent,
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
