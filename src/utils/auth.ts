import { User } from '../types';

/**
 * Checks if a user has administrator or faculty privileges.
 * Students are strictly forbidden from administrative or faculty actions
 * such as uploading and deleting video lectures.
 */
export function isUserAdminOrFaculty(user: User | null | undefined): boolean {
  if (!user) return false;
  // Students strictly return false
  if (user.role === 'student') return false;
  if (user.role === 'admin') return true;
  if ((user.role as string) === 'faculty') return true;
  if (user.id.startsWith('usr-admin') || user.id.startsWith('usr-faculty')) return true;

  const des = (user.designation || '').toLowerCase();
  return (
    des.includes('faculty') ||
    des.includes('professor') ||
    des.includes('lecturer') ||
    des.includes('dean') ||
    des.includes('instructor') ||
    des.includes('admin') ||
    des.includes('chair') ||
    des.includes('director')
  );
}
