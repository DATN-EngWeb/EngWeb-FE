'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import PreviewReadingTest from '../../../../../components/Teacher/previewReadingTest';
import ViewTestHeader from '../../../../../components/Teacher/ViewTestHeader';
import { getRecepiveTestDetails, fetchHtmlContent } from '../../../../../api/test';
import { transformApiResponseToParts } from '../../../../../utils/testTransformers';

export default function ViewListeningTestPage({ params }) {
  const { test_id } = use(params);
  const router = useRouter();
  const [basicInfo, setBasicInfo] = useState(null);
  const [parts, setParts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <ViewTestHeader
        title={basicInfo?.testName || 'Listening Test'}
        subtitle="Review the full listening structure and verify all parts before publishing."
        skillLabel="Listening"
        status={status}
        showEdit={status === 'D'}
        onEdit={() => router.push(`/teacher/update-test/listening/${test_id}`)}
      />
      <PreviewReadingTest basicInfo={basicInfo} parts={parts} onPreview={() => router.back()} />
    </Container>
  );
}
