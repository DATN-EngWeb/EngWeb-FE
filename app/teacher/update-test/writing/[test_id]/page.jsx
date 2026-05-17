'use client';
import UpdateWritingTestEditor from '../../../../../components/WritingTest/UpdateWritingTestEditor.jsx';
import { useEffect } from 'react';

export default function UpdateWritingTestPage() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return <UpdateWritingTestEditor />;
}
