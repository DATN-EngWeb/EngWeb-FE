'use client';

import React, { useEffect, useState } from 'react';
import ListeningTestContent from '../../../../../components/Student/ListeningTest/ListeningTestContent';
import ReceptiveTestResult from '../../../../../components/Student/ReceptiveTestResult/ReceptiveTestResult';

export default function Page({ params }) {
  const unwrappedParams = React.use(params);
  const { test_id } = unwrappedParams;

  const [isPractice, setIsPractice] = useState(false);
  const [history_id, setHistoryId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.sessionStorage.getItem('current_receptive_attempt');
      if (saved) {
        const savedData = JSON.parse(saved);
        setIsPractice(!savedData.isReadOnly);
        if (savedData.history_id) {
          setHistoryId(savedData.history_id);
        }
      } else {
        setIsPractice(true);
      }
    }
  }, [test_id]);

  return !isPractice ? (
    <ReceptiveTestResult historyId={history_id} />
  ) : (
    <ListeningTestContent test_id={test_id} />
  );
}
