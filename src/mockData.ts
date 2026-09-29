import { Course, Notification, User, AttendanceRecord, Assignment, AssignmentSubmission, LectureMedia } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Mr. Sayan Pandit',
    role: 'admin',
    designation: 'Dean of Academic Affairs & Administrator',
    email: 'panditsayan3@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Academic Administration',
    phone: '+1 (555) 019-2834',
    assignedCourses: ['course-1', 'course-4']
  },
  {
    id: 'usr-faculty-1',
    username: 'rajesh.verma',
    password: 'faculty123',
    name: 'Prof. Rajesh Verma',
    role: 'admin',
    designation: 'Associate Professor & Lab Director',
    email: 'rajesh.verma@college.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    phone: '+1 (555) 349-8812',
    assignedCourses: ['course-1', 'course-2']
  },
  {
    id: 'usr-faculty-2',
    username: 'evelyn.reed',
    password: 'faculty123',
    name: 'Dr. Evelyn Reed',
    role: 'admin',
    designation: 'Department Chair & Senior Faculty',
    email: 'evelyn.reed@college.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Electrical & Communication',
    phone: '+1 (555) 482-9021',
    assignedCourses: ['course-4']
  },
  {
    id: 'usr-student-1',
    username: 'sayan.pandit',
    password: 'student123',
    name: 'Mr. Sayan Pandit',
    role: 'student',
    email: 'panditsayan3@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    rollNo: 'CS2024-042',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    cgpa: 3.84,
    phone: '+1 (555) 234-8891',
    enrolledCourseIds: ['course-1', 'course-2', 'course-3', 'course-4', 'course-5']
  },
  {
    id: 'usr-student-2',
    username: 'sophia.chen',
    password: 'student123',
    name: 'Sophia Chen',
    role: 'student',
    email: 'sophia.chen@college.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rollNo: 'CS2024-043',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    cgpa: 3.92,
    phone: '+1 (555) 345-6712',
    enrolledCourseIds: ['course-1', 'course-2', 'course-3', 'course-4']
  },
  {
    id: 'usr-student-3',
    username: 'liam.patel',
    password: 'student123',
    name: 'Liam Patel',
    role: 'student',
    email: 'liam.patel@college.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rollNo: 'CS2024-044',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    cgpa: 3.45,
    phone: '+1 (555) 456-7890',
    enrolledCourseIds: ['course-1', 'course-2', 'course-5']
  },
  {
    id: 'usr-student-4',
    username: 'marcus.vance',
    password: 'student123',
    name: 'Marcus Vance',
    role: 'student',
    email: 'marcus.vance@college.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rollNo: 'EE2024-019',
    department: 'Electrical Engineering',
    semester: 'Semester 5',
    cgpa: 3.68,
    phone: '+1 (555) 901-2345',
    enrolledCourseIds: ['course-4', 'course-5']
  },
  {
    id: 'usr-student-5',
    username: 'emily.davis',
    password: 'student123',
    name: 'Emily Davis',
    role: 'student',
    email: 'emily.davis@college.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rollNo: 'ME2024-055',
    department: 'Mechanical Engineering',
    semester: 'Semester 3',
    cgpa: 3.75,
    phone: '+1 (555) 789-0123',
    enrolledCourseIds: ['course-5']
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'CS-301',
    title: 'Data Structures & Algorithms',
    department: 'Computer Science',
    instructor: 'Prof. David K. Mitchell',
    credits: 4,
    schedule: 'Mon, Wed 09:30 AM - 11:00 AM',
    room: 'Hall 302 (Turing Wing)',
    semester: 'Semester 5',
    description: 'Deep dive into advanced data structures, graph traversals, amortized complexity, dynamic programming, and greedy algorithms with system-level benchmarks.',
    syllabus: [
      'Algorithmic Complexity & Asymptotic Notation',
      'Advanced Trees: AVL, Red-Black & B-Trees',
      'Graph Algorithms: Dijkstra, Bellman-Ford, Prim & Kruskal',
      'Dynamic Programming & Memoization Patterns',
      'NP-Completeness & Approximation Algorithms'
    ]
  },
  {
    id: 'course-2',
    code: 'CS-304',
    title: 'Database Management Systems',
    department: 'Computer Science',
    instructor: 'Dr. Rebecca Torres',
    credits: 3,
    schedule: 'Tue, Thu 11:15 AM - 12:45 PM',
    room: 'Lab 4B (Linus Computing Hub)',
    semester: 'Semester 5',
    description: 'Relational algebra, SQL query optimization, transactions, ACID properties, indexing mechanisms, and contemporary distributed NoSQL architectures.',
    syllabus: [
      'Relational Data Model & Formal Query Languages',
      'Normalization (1NF, 2NF, 3NF, BCNF)',
      'Transaction Processing, Concurrency Control & Deadlocks',
      'B+ Tree Indexing & Query Execution Engine',
      'Modern Distributed Databases & Replication'
    ]
  },
  {
    id: 'course-3',
    code: 'CS-308',
    title: 'Web & Cloud Architecture',
    department: 'Computer Science',
    instructor: 'Prof. Samuel Vance',
    credits: 4,
    schedule: 'Wed, Fri 02:00 PM - 03:30 PM',
    room: 'Room 204 (Innovation Center)',
    semester: 'Semester 5',
    description: 'Full-stack application lifecycle, REST & GraphQL protocols, microservices, containerization with Docker, and cloud-native serverless deployments.',
    syllabus: [
      'Client-Server Protocols & Web Security (OAuth, JWT, CORS)',
      'Modern Component-Driven Frontend State Machines',
      'Node.js & Express Microservice Architectures',
      'Cloud Deployment, CDN Caching & Edge Computing',
      'Continuous Integration, Automated Testing & Observability'
    ]
  },
  {
    id: 'course-4',
    code: 'MA-201',
    title: 'Discrete Mathematics & Graph Theory',
    department: 'Mathematics',
    instructor: 'Dr. Nathanial Green',
    credits: 3,
    schedule: 'Mon, Thu 08:00 AM - 09:15 AM',
    room: 'Hall 105 (Euler Auditorium)',
    semester: 'Semester 5',
    description: 'Propositional calculus, set theory, combinatorics, recurrence relations, boolean algebra, and tree graph coloring theory.',
    syllabus: [
      'Propositional Logic & Proof Techniques',
      'Combinatorics, Pigeonhole Principle & Generating Functions',
      'Recurrence Relations & Divide-and-Conquer Solvers',
      'Graph Isomorphism, Planarity & Coloring',
      'Algebraic Structures & Boolean Lattices'
    ]
  },
  {
    id: 'course-5',
    code: 'HS-102',
    title: 'Technical Communication & Leadership',
    department: 'Humanities & Social Sciences',
    instructor: 'Prof. Chloe Hastings',
    credits: 2,
    schedule: 'Friday 10:00 AM - 12:00 PM',
    room: 'Seminar Hall 1',
    semester: 'Semester 5',
    description: 'Professional engineering documentation, executive tech presentation, ethics in artificial intelligence, and engineering project negotiation.',
    syllabus: [
      'Engineering Report & Research Paper Writing',
      'Effective Technical Pitching & Visual Slides Design',
      'Ethics in Engineering & Professional Integrity',
      'Cross-Functional Team Collaboration & Conflict Resolution'
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // CS-301 (Data Structures)
  { id: 'att-101', studentId: 'usr-student-1', courseId: 'course-1', date: '2026-09-02', status: 'present', remarks: 'Active participation' },
  { id: 'att-102', studentId: 'usr-student-1', courseId: 'course-1', date: '2026-09-07', status: 'present' },
  { id: 'att-103', studentId: 'usr-student-1', courseId: 'course-1', date: '2026-09-09', status: 'present' },
  { id: 'att-104', studentId: 'usr-student-1', courseId: 'course-1', date: '2026-09-14', status: 'present' },
  { id: 'att-105', studentId: 'usr-student-1', courseId: 'course-1', date: '2026-08-26', status: 'present' },
  { id: 'att-106', studentId: 'usr-student-1', courseId: 'course-1', date: '2026-08-28', status: 'late', remarks: 'Transit delay' },

  // CS-304 (DBMS)
  { id: 'att-201', studentId: 'usr-student-1', courseId: 'course-2', date: '2026-09-01', status: 'present' },
  { id: 'att-202', studentId: 'usr-student-1', courseId: 'course-2', date: '2026-09-03', status: 'present' },
  { id: 'att-203', studentId: 'usr-student-1', courseId: 'course-2', date: '2026-09-08', status: 'present' },
  { id: 'att-204', studentId: 'usr-student-1', courseId: 'course-2', date: '2026-09-10', status: 'absent', remarks: 'Sick leave requested' },

  // CS-308 (Web Arch)
  { id: 'att-301', studentId: 'usr-student-1', courseId: 'course-3', date: '2026-09-04', status: 'present' },
  { id: 'att-302', studentId: 'usr-student-1', courseId: 'course-3', date: '2026-09-09', status: 'present' },
  { id: 'att-303', studentId: 'usr-student-1', courseId: 'course-3', date: '2026-09-11', status: 'present' },

  // MA-201 (Discrete Math)
  { id: 'att-401', studentId: 'usr-student-1', courseId: 'course-4', date: '2026-09-03', status: 'present' },
  { id: 'att-402', studentId: 'usr-student-1', courseId: 'course-4', date: '2026-09-07', status: 'absent' },
  { id: 'att-403', studentId: 'usr-student-1', courseId: 'course-4', date: '2026-09-10', status: 'present' },
  { id: 'att-404', studentId: 'usr-student-1', courseId: 'course-4', date: '2026-09-14', status: 'present' },

  // HS-102 (Technical Comm)
  { id: 'att-501', studentId: 'usr-student-1', courseId: 'course-5', date: '2026-09-04', status: 'present' },
  { id: 'att-502', studentId: 'usr-student-1', courseId: 'course-5', date: '2026-09-11', status: 'present' },

  // Other students attendance for realistic faculty roster
  { id: 'att-601', studentId: 'usr-student-2', courseId: 'course-1', date: '2026-09-14', status: 'present' },
  { id: 'att-602', studentId: 'usr-student-3', courseId: 'course-1', date: '2026-09-14', status: 'absent' },
  { id: 'att-603', studentId: 'usr-student-2', courseId: 'course-2', date: '2026-09-10', status: 'present' },
  { id: 'att-604', studentId: 'usr-student-3', courseId: 'course-2', date: '2026-09-10', status: 'late' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Mid-Semester Examinations Schedule Released (Fall 2026)',
    message: 'The examination board has uploaded the timetable for the upcoming mid-semester assessments starting October 5th. All students must verify their registered course codes and seating arrangements via the student portal.',
    category: 'exam',
    targetRole: 'all',
    createdAt: '2026-09-12 10:30 AM',
    author: 'Office of the Controller of Examinations',
    isPinned: true,
    readBy: []
  },
  {
    id: 'notif-2',
    title: 'HackInnovate 2026: Annual Inter-College Hackathon',
    message: 'Registration is now open for the 36-hour annual software and hardware prototyping challenge. Prize pool of $15,000 + cloud credits sponsored by top industry tech partners.',
    category: 'event',
    targetRole: 'student',
    createdAt: '2026-09-13 02:15 PM',
    author: 'Campus Student Council',
    isPinned: false,
    readBy: ['usr-student-1']
  },
  {
    id: 'notif-3',
    title: 'Mandatory Lab Safety & Cloud Deployment Workshop',
    message: 'All CS & EE students are required to attend the orientation on secure cloud infrastructure and container cluster safety standards scheduled for this Thursday.',
    category: 'academic',
    targetRole: 'student',
    department: 'Computer Science & Engineering',
    createdAt: '2026-09-14 09:00 AM',
    author: 'Department of Computer Science',
    isPinned: false,
    readBy: []
  },
  {
    id: 'notif-4',
    title: 'Notice: Tuition Fee Submission Deadline Extended',
    message: 'The finance desk has extended the installment payment deadline to September 25th with zero late fee penalty. Payment slips can be uploaded directly to the accounts portal.',
    category: 'urgent',
    targetRole: 'student',
    createdAt: '2026-09-11 11:45 AM',
    author: 'Finance & Administration',
    isPinned: false,
    readBy: []
  },
  {
    id: 'notif-5',
    title: 'Faculty Senate Meeting on New Curriculum Guidelines',
    message: 'All departmental chairs and faculty representatives are requested to join the Senate Council room this Wednesday at 4:00 PM to review elective curriculum proposals.',
    category: 'general',
    targetRole: 'admin',
    createdAt: '2026-09-10 03:00 PM',
    author: 'Dean of Academic Affairs',
    isPinned: false,
    readBy: []
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    courseId: 'course-1',
    title: 'Programming Project 1: Self-Balancing AVL Trees',
    description: 'Implement AVL tree operations including self-balancing rebalancing rotations (LL, RR, LR, RL), key deletions, and range querying. Provide microbenchmarks analyzing amortized height efficiency against standard BSTs on 50,000 randomized integers.',
    dueDate: '2026-09-24',
    assignedDate: '2026-09-10',
    maxMarks: 100,
    attachmentName: 'avl_tree_specification_v2.pdf',
    submissionType: 'both',
    status: 'active'
  },
  {
    id: 'asg-2',
    courseId: 'course-2',
    title: 'Relational Decomposition & Schema Optimization',
    description: 'Decompose the provided unnormalized enterprise order dataset into 3NF and BCNF relation schemas. Submit complete functional dependency proofs, lossless-join verification, and SQL DDL script with primary/foreign constraints and compound indexes.',
    dueDate: '2026-09-21',
    assignedDate: '2026-09-08',
    maxMarks: 50,
    attachmentName: 'retail_schema_unnormalized_data.csv',
    submissionType: 'both',
    status: 'active'
  },
  {
    id: 'asg-3',
    courseId: 'course-3',
    title: 'Lab 3: RESTful Microservice Containerization with Docker Compose',
    description: 'Design and deploy a containerized multi-tier web service consisting of an auth service, resource API, and Redis session store. Provide docker-compose.yml configuration, health check probes, environment variable configuration, and test curl outputs.',
    dueDate: '2026-09-18',
    assignedDate: '2026-09-05',
    maxMarks: 100,
    attachmentName: 'microservices_compose_guidelines.md',
    submissionType: 'both',
    status: 'active'
  },
  {
    id: 'asg-4',
    courseId: 'course-4',
    title: 'Problem Set 2: Planar Graphs, Coloring & Recurrences',
    description: 'Solve problem set covering Euler formula proofs for polyhedral graphs, Four Color theorem applications, chromatic polynomial derivations, and asymptotic solution of non-homogeneous divide-and-conquer recurrence equations.',
    dueDate: '2026-09-28',
    assignedDate: '2026-09-12',
    maxMarks: 40,
    attachmentName: 'discrete_math_ps2_exercises.pdf',
    submissionType: 'both',
    status: 'active'
  },
  {
    id: 'asg-5',
    courseId: 'course-5',
    title: 'Executive Technical Brief: Ethical Frameworks for Autonomous Systems',
    description: 'Prepare a formal 1,200-word executive memorandum analyzing algorithmic accountability, bias mitigation in machine intelligence, and liability frameworks in critical software engineering. Follow IEEE professional formatting standards.',
    dueDate: '2026-09-12',
    assignedDate: '2026-08-28',
    maxMarks: 50,
    attachmentName: 'executive_memo_rubric.pdf',
    submissionType: 'both',
    status: 'closed'
  }
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignmentId: 'asg-5',
    studentId: 'usr-student-1',
    submittedAt: '2026-09-11 04:30 PM',
    submissionText: 'Executive memorandum analyzing ethical accountability, IEEE algorithmic transparency requirements, and safety auditing in deployed neural networks.',
    attachmentName: 'AlexMorgan_HS102_EthicsMemo.pdf',
    status: 'graded',
    grade: 48,
    feedback: 'Outstanding articulation of engineering governance standards. The risk mitigation matrix was exceptionally thorough.',
    gradedAt: '2026-09-13 11:00 AM',
    gradedBy: 'Prof. Chloe Hastings'
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-3',
    studentId: 'usr-student-1',
    submittedAt: '2026-09-14 02:15 PM',
    submissionText: 'Complete docker-compose.yml configuration with Alpine-based lightweight containers for Auth and Catalog API services, integrated Redis caching layer, and curl test scripts.',
    attachmentName: 'AlexMorgan_CS308_Lab3_Containers.zip',
    status: 'submitted'
  },
  {
    id: 'sub-3',
    assignmentId: 'asg-3',
    studentId: 'usr-student-2',
    submittedAt: '2026-09-13 06:40 PM',
    submissionText: 'Implemented multi-stage Docker build files, secrets management via env files, and automated container healthcheck endpoints.',
    attachmentName: 'SophiaChen_Lab3_Microservices.tar.gz',
    status: 'graded',
    grade: 97,
    feedback: 'Superb multi-stage builds. Reduced container image size by 70% with rock-solid health checks.',
    gradedAt: '2026-09-14 10:20 AM',
    gradedBy: 'Prof. Samuel Vance'
  },
  {
    id: 'sub-4',
    assignmentId: 'asg-2',
    studentId: 'usr-student-3',
    submittedAt: '2026-09-13 01:20 PM',
    submissionText: 'Included BCNF decomposition proofs, dependency preservation matrices, and PostgreSQL schema migration script.',
    attachmentName: 'LiamPatel_CS304_MiniProject1.sql',
    status: 'submitted'
  }
];

export const INITIAL_LECTURES: LectureMedia[] = [
  {
    id: 'lec-3',
    courseId: 'course-2',
    title: 'Lecture 09: Transaction Isolation Levels, ACID & Strict 2PL Protocol',
    description: 'Lecture video discussing dirty reads, non-repeatable reads, phantom anomalies, and how two-phase locking guarantees conflict serializability in high-throughput engines.',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    uploadedBy: 'usr-faculty-1',
    uploaderName: 'Prof. Rajesh Verma',
    date: '2026-09-16',
    createdAt: '2026-09-16T14:15:00Z',
    duration: '46 min',
    fileSize: '162 MB',
    tags: ['ACID', 'Transactions', 'Locks', 'Concurrency Control'],
    unitOrTopic: 'Unit 3: Transaction Processing'
  },
  {
    id: 'lec-4',
    courseId: 'course-2',
    title: 'Whiteboard Diagram: Relational Normalization 1NF to BCNF Proof Map',
    description: 'Whiteboard diagram showing functional dependency closures, candidate key deductions, and lossless-join BCNF decomposition step-by-step table split.',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    uploadedBy: 'usr-faculty-1',
    uploaderName: 'Prof. Rajesh Verma',
    date: '2026-09-15',
    createdAt: '2026-09-15T15:20:00Z',
    fileSize: '3.6 MB',
    tags: ['Whiteboard Notes', 'BCNF', 'Normalization', 'Schema Design'],
    unitOrTopic: 'Unit 2: Relational Schema Design',
    whiteboardNotes: true
  },
  {
    id: 'lec-5',
    courseId: 'course-3',
    title: 'Lab Demo: Multi-Container Setup with Docker Compose, Redis & Nginx',
    description: 'Hands-on lab screencast walking through container networks, automated environment variables injection, persistent volumes, and health check inspection.',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    uploadedBy: 'usr-admin-1',
    uploaderName: 'Mr. Sayan Pandit',
    date: '2026-09-14',
    createdAt: '2026-09-14T09:00:00Z',
    duration: '38 min',
    fileSize: '135 MB',
    tags: ['Docker', 'Containers', 'DevOps', 'Microservices', 'Lab Demo'],
    unitOrTopic: 'Unit 4: Cloud Infrastructure'
  },
  {
    id: 'lec-6',
    courseId: 'course-3',
    title: 'Whiteboard Notes: Distributed Cache Topology & Invalidation Strategies',
    description: 'Whiteboard photo summarizing Cache-Aside, Write-Through, and Write-Behind trade-offs, with cache stampede mitigation using distributed mutexes.',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    uploadedBy: 'usr-admin-1',
    uploaderName: 'Mr. Sayan Pandit',
    date: '2026-09-12',
    createdAt: '2026-09-12T16:00:00Z',
    fileSize: '5.2 MB',
    tags: ['Whiteboard Notes', 'System Design', 'Caching', 'Architecture'],
    unitOrTopic: 'Unit 3: Scalability & Performance',
    whiteboardNotes: true
  }
];

