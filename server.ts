import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_LECTURES,
} from "./src/mockData";

dotenv.config();

interface PortalDatabase {
  users: any[];
  courses: any[];
  attendance: any[];
  notifications: any[];
  assignments: any[];
  submissions: any[];
  lectures: any[];
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "portal-db.json");

function getInitialDatabase(): PortalDatabase {
  return {
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    courses: JSON.parse(JSON.stringify(INITIAL_COURSES)),
    attendance: JSON.parse(JSON.stringify(INITIAL_ATTENDANCE)),
    notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
    assignments: JSON.parse(JSON.stringify(INITIAL_ASSIGNMENTS)),
    submissions: JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)),
    lectures: JSON.parse(JSON.stringify(INITIAL_LECTURES)),
  };
}

let db: PortalDatabase;

function loadDatabase(): PortalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.courses)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading portal-db.json, falling back to defaults:", err);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(dataToSave: PortalDatabase = db) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist portal-db.json to disk:", err);
  }
}

// Initialize memory database
db = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ==========================================
  // BACKEND REST API ROUTES
  // ==========================================

  // Health and System Diagnostics
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      server: "Express Node.js Academic Portal Backend",
      timestamp: new Date().toISOString(),
      counts: {
        users: db.users.length,
        courses: db.courses.length,
        attendance: db.attendance.length,
        notifications: db.notifications.length,
        assignments: db.assignments.length,
        submissions: db.submissions.length,
        lectures: db.lectures.length,
      },
    });
  });

  // State / Bulk Sync (Fast data fetch for initial load or full sync)
  app.get("/api/state", (_req: Request, res: Response) => {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: db,
    });
  });

  // Reset to default seed
  app.post("/api/reset", (_req: Request, res: Response) => {
    db = getInitialDatabase();
    saveDatabase();
    res.json({
      success: true,
      message: "Database successfully reset to initial seed state",
      timestamp: new Date().toISOString(),
      data: db,
    });
  });

  // ------------------------------------------
  // COURSES ENDPOINTS
  // ------------------------------------------
  app.get("/api/courses", (_req: Request, res: Response) => {
    res.json(db.courses);
  });

  app.post("/api/courses", (req: Request, res: Response) => {
    const newCourse = {
      ...req.body,
      id: req.body.id || `course-${Date.now()}`,
    };
    db.courses.unshift(newCourse);
    saveDatabase();
    res.status(201).json(newCourse);
  });

  app.put("/api/courses/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.courses.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    db.courses[index] = { ...db.courses[index], ...req.body };
    saveDatabase();
    res.json(db.courses[index]);
  });

  app.delete("/api/courses/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    db.courses = db.courses.filter((c) => c.id !== id);
    // Unenroll students
    db.users = db.users.map((u) => ({
      ...u,
      enrolledCourseIds: u.enrolledCourseIds?.filter((cId: string) => cId !== id),
    }));
    // Remove related attendance
    db.attendance = db.attendance.filter((a) => a.courseId !== id);
    // Remove assignments
    const asgIds = db.assignments.filter((a) => a.courseId === id).map((a) => a.id);
    db.assignments = db.assignments.filter((a) => a.courseId !== id);
    db.submissions = db.submissions.filter((s) => !asgIds.includes(s.assignmentId));

    saveDatabase();
    res.json({ success: true, id });
  });

  // ------------------------------------------
  // USERS ENDPOINTS (Students & Faculty/Admin)
  // ------------------------------------------
  app.get("/api/users", (_req: Request, res: Response) => {
    res.json(db.users);
  });

  app.post("/api/users", (req: Request, res: Response) => {
    const newUser = {
      ...req.body,
      id: req.body.id || `usr-${Date.now()}`,
    };
    db.users.unshift(newUser);
    saveDatabase();
    res.status(201).json(newUser);
  });

  app.put("/api/users/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    db.users[index] = { ...db.users[index], ...req.body };
    saveDatabase();
    res.json(db.users[index]);
  });

  app.delete("/api/users/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    db.users = db.users.filter((u) => u.id !== id);
    db.attendance = db.attendance.filter((a) => a.studentId !== id);
    db.submissions = db.submissions.filter((s) => s.studentId !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // ------------------------------------------
  // ATTENDANCE ENDPOINTS
  // ------------------------------------------
  app.get("/api/attendance", (_req: Request, res: Response) => {
    res.json(db.attendance);
  });

  app.post("/api/attendance", (req: Request, res: Response) => {
    const incomingRecords = Array.isArray(req.body.records) ? req.body.records : [req.body];

    for (const rec of incomingRecords) {
      const idx = db.attendance.findIndex(
        (a) => a.studentId === rec.studentId && a.courseId === rec.courseId && a.date === rec.date
      );
      if (idx >= 0) {
        db.attendance[idx] = {
          ...db.attendance[idx],
          status: rec.status,
          remarks: rec.remarks !== undefined ? rec.remarks : db.attendance[idx].remarks,
        };
      } else {
        db.attendance.push({
          id: rec.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...rec,
        });
      }
    }

    saveDatabase();
    res.json({ success: true, count: incomingRecords.length, attendance: db.attendance });
  });

  // ------------------------------------------
  // ASSIGNMENTS ENDPOINTS
  // ------------------------------------------
  app.get("/api/assignments", (_req: Request, res: Response) => {
    res.json(db.assignments);
  });

  app.post("/api/assignments", (req: Request, res: Response) => {
    const newAsg = {
      ...req.body,
      id: req.body.id || `asg-${Date.now()}`,
      assignedDate: req.body.assignedDate || new Date().toISOString().split("T")[0],
    };
    db.assignments.unshift(newAsg);
    saveDatabase();
    res.status(201).json(newAsg);
  });

  app.put("/api/assignments/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.assignments.findIndex((a) => a.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    db.assignments[index] = { ...db.assignments[index], ...req.body };
    saveDatabase();
    res.json(db.assignments[index]);
  });

  app.delete("/api/assignments/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    db.assignments = db.assignments.filter((a) => a.id !== id);
    db.submissions = db.submissions.filter((s) => s.assignmentId !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // ------------------------------------------
  // SUBMISSIONS ENDPOINTS
  // ------------------------------------------
  app.get("/api/submissions", (_req: Request, res: Response) => {
    res.json(db.submissions);
  });

  app.post("/api/submissions", (req: Request, res: Response) => {
    const sub = req.body;
    const index = db.submissions.findIndex(
      (s) => s.assignmentId === sub.assignmentId && s.studentId === sub.studentId
    );
    if (index >= 0) {
      db.submissions[index] = { ...db.submissions[index], ...sub };
      saveDatabase();
      res.json(db.submissions[index]);
    } else {
      const newSub = {
        ...sub,
        id: sub.id || `sub-${Date.now()}`,
      };
      db.submissions.unshift(newSub);
      saveDatabase();
      res.status(201).json(newSub);
    }
  });

  app.put("/api/submissions/:id/grade", (req: Request, res: Response) => {
    const { id } = req.params;
    const { grade, feedback, gradedBy } = req.body;
    const index = db.submissions.findIndex((s) => s.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    db.submissions[index] = {
      ...db.submissions[index],
      grade,
      feedback,
      gradedBy: gradedBy || "Faculty Evaluator",
      gradedAt: formattedDate,
      status: "graded",
    };
    saveDatabase();
    res.json(db.submissions[index]);
  });

  // ------------------------------------------
  // LECTURES / MEDIA ENDPOINTS
  // ------------------------------------------
  app.get("/api/lectures", (_req: Request, res: Response) => {
    res.json(db.lectures);
  });

  app.post("/api/lectures", (req: Request, res: Response) => {
    const requesterId = req.headers["x-user-id"] || req.body.uploadedBy;
    if (requesterId) {
      const user = db.users.find((u) => u.id === requesterId);
      if (user && user.role === "student") {
        res.status(403).json({ error: "Forbidden: Only administrators and faculty can upload videos or lectures." });
        return;
      }
    }
    const newLecture = {
      ...req.body,
      id: req.body.id || `lec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    db.lectures.unshift(newLecture);
    saveDatabase();
    res.status(201).json(newLecture);
  });

  app.put("/api/lectures/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.lectures.findIndex((l) => l.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Lecture not found" });
      return;
    }
    db.lectures[index] = { ...db.lectures[index], ...req.body };
    saveDatabase();
    res.json(db.lectures[index]);
  });

  app.delete("/api/lectures/:id", (req: Request, res: Response) => {
    const requesterId = req.headers["x-user-id"];
    if (requesterId) {
      const user = db.users.find((u) => u.id === requesterId);
      if (user && user.role === "student") {
        res.status(403).json({ error: "Forbidden: Only administrators and faculty can delete videos or lectures." });
        return;
      }
    }
    const { id } = req.params;
    db.lectures = db.lectures.filter((l) => l.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // ------------------------------------------
  // NOTIFICATIONS ENDPOINTS
  // ------------------------------------------
  app.get("/api/notifications", (_req: Request, res: Response) => {
    res.json(db.notifications);
  });

  app.post("/api/notifications", (req: Request, res: Response) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    const newNotif = {
      ...req.body,
      id: req.body.id || `notif-${Date.now()}`,
      createdAt: req.body.createdAt || formattedDate,
      readBy: req.body.readBy || [],
    };
    db.notifications.unshift(newNotif);
    saveDatabase();
    res.status(201).json(newNotif);
  });

  app.put("/api/notifications/:id/read", (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;
    const notif = db.notifications.find((n) => n.id === id);
    if (notif && userId && !notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
      saveDatabase();
    }
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    db.notifications = db.notifications.filter((n) => n.id !== id);
    saveDatabase();
    res.json({ success: true, id });
  });

  // ==========================================
  // FRONTEND MIDDLEWARE / STATIC SERVING
  // ==========================================
  const isProduction =
    process.env.NODE_ENV === "production" ||
    !process.argv[1]?.endsWith("server.ts") ||
    fs.existsSync(path.resolve(process.cwd(), "dist", "index.html"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Backend API endpoints available at http://localhost:${PORT}/api/*`);
  });
}

startServer();
