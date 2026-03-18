'use client';

import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ReadingPreview from '../../../../../components/Teacher/ReadingTest/ReadingPreview';
import FeedbackTestLayout from '../../../../../components/Teacher/Feedback/FeedbackTestLayout';
import { getReceptiveTestDetails, fetchHtmlContent } from '../../../../../api/test';

async function transformReadingData(data) {
  const parts = data?.receptive_test?.receptive_parts ?? [];
  return Promise.all(
    parts.map(async (part) => {
      const { format } = part;
      const newPart = {
        id: part.id,
        order: part.order,
        format,
        description: part.description || '',
        content: part.content || '',
      };
      if (newPart.content?.startsWith('http')) {
        newPart.content = await fetchHtmlContent(newPart.content);
      }
      newPart.questions = await Promise.all(
        (part.receptive_questions || []).map(async (q) => {
          const newQ = {
            id: q.id,
            question_number: q.question_number,
            explanation: q.explanation || '',
            score: q.score,
            content: !['I', 'J'].includes(format) ? q.content || '' : undefined,
          };
          if (newQ.content?.startsWith?.('http')) {
            newQ.content = await fetchHtmlContent(newQ.content);
          }
          newQ.answers = (q.receptive_answers || []).map(({ resources, ...ans }) => {
            if (format === 'I') {
              const { option_label, ...ansNoLabel } = ans;
              return ansNoLabel;
            }
            return ans;
          });
          return newQ;
        }),
      );
      return newPart;
    }),
  );
}

export default function FeedbackReadingTestPage({ params }) {
  const { test_id } = use(params);
  const [testData, setTestData] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReceptiveTestDetails(test_id);
        const currentUserId = localStorage.getItem('userId');
        const isOwner =
          String(data.created_by_id ?? data.teacher_id ?? '') === String(currentUserId);
        if (data.status !== 'I' || isOwner) {
          setForbidden(true);
          setLoading(false);
          return;
        }
        const parts = await transformReadingData(data);
        setTestData({
          title: data.title || '',
          level: data.level || '',
          time: data.time?.toString() || '',
          parts,
        });
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
      <ReadingPreview inline open={false} onClose={() => {}} testData={testData} />
    </FeedbackTestLayout>
  );
}
