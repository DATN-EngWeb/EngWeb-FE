/* global URLSearchParams */
'use client';

import { useParams } from 'next/navigation';
import ForumPostsPageContent from '../../../../../components/Forum/ForumPostsPageContent';

export default function ForumPage() {
  const params = useParams();

  return (
    <ForumPostsPageContent
      testId={params?.test_id}
      subtitle="Share your Writing to get feedback from our community"
      showTabs
    />
  );
}
