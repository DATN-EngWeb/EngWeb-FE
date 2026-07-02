'use client';
import ForumHub from '../Forum/ForumHub';

export default function TeacherForumHub() {
  return (
    <ForumHub
      getForumUrl={(test) => `/teacher/forum/${test.id}`}
      description="Browse all published tests and open each forum to view student discussions."
    />
  );
}
