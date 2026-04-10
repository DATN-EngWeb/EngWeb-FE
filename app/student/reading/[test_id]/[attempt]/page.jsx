'use client';

import ReceptiveTestResult from '@/components/Student/ReceptiveTestResult/ReceptiveTestResult';
import React from 'react';
import { useEffect, useState } from 'react';

export default function ReceptiveResultsPage({ params }) {
  const unwrappedParams = React.use(params);
  const { test_id } = unwrappedParams;
  const [history_id, setHistoryId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.sessionStorage.getItem('current_receptive_attempt');
      if (saved) {
        const savedData = JSON.parse(saved);
        if (savedData.history_id) {
          setHistoryId(savedData.history_id);
        }
      }
    }
  }, [test_id]);

  return <ReceptiveTestResult historyId={history_id} />;
}
