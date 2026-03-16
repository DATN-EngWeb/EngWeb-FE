'use client';

import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PreviewReadingTest from '../../../../../components/Teacher/previewReadingTest';
import FeedbackTestLayout from '../../../../../components/Teacher/Feedback/FeedbackTestLayout';
import { getRecepiveTestDetails, fetchHtmlContent } from '../../../../../api/test';
import { transformApiResponseToParts } from '../../../../../utils/testTransformers';

export default function FeedbackListeningTestPage({ params }) {
  const { test_id } = use(params);
  const [basicInfo, setBasicInfo] = useState(null);
  const [parts, setParts] = useState([]);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecepiveTestDetails(test_id);
        const currentUserId = localStorage.getItem('userId');
        const isOwner =
          String(data.created_by_id ?? data.teacher_id ?? '') === String(currentUserId);
        if (data.status !== 'I' || isOwner) {
          setForbidden(true);
          setLoading(false);
          return;
        }
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

  if (forbidden) {
    return <FeedbackTestLayout testId={test_id} forbidden />;
  }

  return (
    <FeedbackTestLayout testId={test_id}>
      <PreviewReadingTest
        basicInfo={basicInfo}
        parts={parts}
        onPreview={() => {}}
        showHeaderActions={false}
      />
    </FeedbackTestLayout>
  );
}
