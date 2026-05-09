'use client';

import ReceptiveTestHistory from '@/components/Student/Reading_Listening/ReceptiveTestHistory';

export default function ReadingTestPage() {
  return (
    <ReceptiveTestHistory
      onPracticeNow={() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }}
    />
  );
}
