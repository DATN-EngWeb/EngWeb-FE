'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import ListeningPreview from '../../../../../components/Teacher/ListeningPreview';
import ViewTestHeader from '../../../../../components/Teacher/ViewTestHeader';
import DeleteConfirmSnackbar from '../../../../../components/Teacher/DeleteConfirmSnackbar';
import {
  getRecepiveTestDetails,
  fetchHtmlContent,
  deleteReceptiveTest,
} from '../../../../../api/test';
import { transformApiResponseToParts } from '../../../../../utils/testTransformers';

export default function ViewListeningTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [basicInfo, setBasicInfo] = useState(null);
  const [parts, setParts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecepiveTestDetails(test_id);
        setStatus(data.status);
        setBasicInfo({
          testName: data.title || '',
          level: data.level || '',
          time: data.time?.toString() || '',
          description: data.description || '',
        });

        let transformedParts = transformApiResponseToParts(data);
        transformedParts = await Promise.all(
          transformedParts.map(async (part) => {
            if (part._contentUrl) {
              const htmlContent = await fetchHtmlContent(part._contentUrl);
              return { ...part, content: htmlContent };
            }
            return part;
          }),
        );
        setParts(transformedParts);
      } catch (err) {
        setError(`Failed to load test: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [test_id]);

  if (loading) {
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

  const handleDelete = async () => {
    if (deleting) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);

    try {
      setDeleting(true);
      await deleteReceptiveTest(test_id);
      router.push('/teacher');
    } catch (err) {
      setError(`Failed to delete test: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <ViewTestHeader
        title={basicInfo?.testName || 'Listening Test'}
        subtitle="Review the full listening structure and verify all parts before publishing."
        skillLabel="Listening"
        status={status}
        showViewFeedback
        onViewFeedback={() => router.push(`/teacher/view-test/listening/${test_id}/feedback`)}
        showDelete
        deleting={deleting}
        onDelete={handleDelete}
        showEdit={status === 'D' || status === 'I'}
        onEdit={() => router.push(`/teacher/update-test/listening/${test_id}`)}
      />
      <ListeningPreview
        basicInfo={basicInfo}
        parts={parts}
        onPreview={() => router.back()}
        showHeaderActions={false}
      />
      <DeleteConfirmSnackbar
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </Container>
  );
}
