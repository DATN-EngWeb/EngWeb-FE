'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Alert } from '@mui/material';
import ListeningTestEditor from '../../../../../components/ListeningTest/ListeningTestEditor';
import { getRecepiveTestDetails } from '../../../../../api/test';

export default function EditListeningTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateTest = async () => {
      try {
        const data = await getRecepiveTestDetails(test_id);

        if (data.status !== 'D') {
          setError('Only draft tests can be edited');
          setTimeout(() => router.push('/teacher/upload-test/listening'), 1500);
          return;
        }

        setIsValidating(false);
      } catch (err) {
        setError(`Failed to load test: ${err.message}`);
        setTimeout(() => router.push('/teacher/upload-test/listening'), 2000);
      }
    };

    validateTest();
  }, [test_id, router]);

  if (isValidating) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListeningTestEditor testId={test_id} />
    </Suspense>
  );
}
