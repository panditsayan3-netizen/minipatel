# Security Specification: Academic Portal Firestore Hardening

## 1. Data Invariants
1. **User Identity & Authority**: Users cannot elevate their own role to admin or spoof other user IDs. Admin privileges are verified against bootstrapped administrator (`panditsayan3@gmail.com`) or role check.
2. **Attendance Integrity**: Attendance records must belong to an existing enrolled student and course, with valid status (`present`, `absent`, `late`).
3. **Course Protection**: Course catalog can be read by authenticated users but only created, modified, or deleted by faculty/administrators.
4. **Assignment Submissions**: Students can only create and submit coursework on their own behalf (`studentId == request.auth.uid` or matching user profile). Only instructors/admins can grade submissions (`grade`, `feedback`, `gradedBy`).
5. **Lectures & Media**: Lectures can be uploaded by authenticated faculty/administrators; media URLs and identifiers must be bounded and sanitised.
6. **Announcements**: Campus notifications can be broadcasted by faculty/admin; students may only mark their own UID as having read the alert.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Payload 1 (Privilege Escalation on User Profile)**: Non-admin student updating their role to `admin`.
2. **Payload 2 (Orphaned Course Attendance)**: Creating attendance record without valid `courseId` or `studentId`.
3. **Payload 3 (Self-Grading Attack)**: Student submitting an assignment with `grade: 100` and `status: 'graded'`.
4. **Payload 4 (Ghost Field Injection)**: Inserting `isSuperUser: true` into a course document.
5. **Payload 5 (ID Spoofing on Submission)**: Student A submitting homework with `studentId: "usr-student-2"`.
6. **Payload 6 (Oversized Payload Denial of Wallet)**: Injection of 2MB payload into lecture description or course title.
7. **Payload 7 (Unauthenticated Course Deletion)**: Delete request to `/courses/{courseId}` without authentication.
8. **Payload 8 (Arbitrary Attendance Modification)**: Student attempting to alter attendance status from `absent` to `present`.
9. **Payload 9 (Malicious Announcement Mutation)**: Student modifying faculty announcement text or title.
10. **Payload 10 (Path Traversal / Malformed Document ID)**: Writing to `/courses/../../../root`.
11. **Payload 11 (Terminal State Override)**: Modifying a graded submission after evaluation without instructor authority.
12. **Payload 12 (Unverified Email Admin Spoofing)**: Claiming admin rights with email `panditsayan3@gmail.com` but `email_verified == false`.
