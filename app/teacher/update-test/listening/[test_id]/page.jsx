import { useParams } from 'next/navigation';
('use client');

import { Suspense } from 'react';
import ListeningTestEditor from '../../../../../components/ListeningTest/ListeningTestEditor';
import { useEffect } from 'react';

export default function EditListeningTestPage() {
  const { test_id: testId } = useParams();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [testId]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListeningTestEditor testId={testId} />
    </Suspense>
  );
}
