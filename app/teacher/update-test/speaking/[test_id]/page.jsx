'use client';
import UpdateSpeakingTestEditor from '../../../../../components/SpeakingTest/UpdateSpeakingTestEditor.jsx';
import { useEffect } from 'react';

export default function UpdateSpeakingTestPage() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return <UpdateSpeakingTestEditor />;
}
