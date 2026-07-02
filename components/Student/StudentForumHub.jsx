'use client';
import ForumHub from '../Forum/ForumHub';

export default function StudentForumHub() {
  return (
    <ForumHub
      getForumUrl={(test) => {
        const skill = test.skill === 'W' ? 'writing' : 'speaking';
        return `/student/${skill}/${test.id}/forum`;
      }}
      requireAuth
      showMyPostsFilter
      description="Browse all published tests and join the community discussion."
    />
  );
}
