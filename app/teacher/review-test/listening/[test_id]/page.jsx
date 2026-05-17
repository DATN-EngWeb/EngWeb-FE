'use client';

import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ListeningPreview from '../../../../../components/Teacher/ListeningPreview';
import FeedbackTestLayout from '../../../../../components/Teacher/Feedback/FeedbackTestLayout';
import { getReceptiveTestDetails, fetchHtmlContent } from '../../../../../api/test';
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
        const data = await getReceptiveTestDetails(test_id);
        if (data.status !== 'I' || data.is_owner) {
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
      <ListeningPreview
        basicInfo={basicInfo}
        parts={parts}
        onPreview={() => {}}
        showHeaderActions={false}
      />
    </FeedbackTestLayout>
  );
}
