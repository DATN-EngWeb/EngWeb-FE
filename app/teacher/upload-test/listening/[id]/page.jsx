'use client';

import { Suspense, useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Alert } from '@mui/material';
import ListeningTestEditor from '../../../../../components/ListeningTest/ListeningTestEditor';
import { getRecepiveTestDetails } from '../../../../../api/test';

export default function EditListeningTestPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateTest = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Authentication required');
          setTimeout(() => router.push('/login'), 1500);
          return;
        }

        const data = await getRecepiveTestDetails(id, token);

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
  }, [id, router]);

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
      <ListeningTestEditor testId={id} />
    </Suspense>
  );
}
