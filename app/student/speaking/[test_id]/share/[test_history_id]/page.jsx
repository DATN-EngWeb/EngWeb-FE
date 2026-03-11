/* global fetch */
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getProductiveTest, getProductiveTestDetails } from '../../../../../../api/test';
import { Container, Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import ShareForumForm from '../../../../../../components/Forum/ShareForumForm';
import ShareForumCard from '../../../../../../components/Forum/ShareForumCard';
import { createPost } from '../../../../../../api/forum';

export default function ShareSpeakingPage() {
  const params = useParams();
  const router = useRouter();
  const { test_id, test_history_id } = params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promptHtml, setPromptHtml] = useState('');
  const [testDescUrl, setTestDescUrl] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchAttemptAndTest = async () => {
      try {
        setLoading(true);
        const [historyData, testData] = await Promise.all([
          getProductiveTest(test_id),
          getProductiveTestDetails(test_id),
        ]);
        const found = historyData?.find((item) => String(item.id) === String(test_history_id));
        setAttempt(found);
        const descUrl = testData?.productive_test?.description;
        setTestDescUrl(descUrl || '');
      } catch (err) {
        setAttempt(null);
        setTestDescUrl('');
      } finally {
        setLoading(false);
      }
    };
    if (test_id && test_history_id) fetchAttemptAndTest();
  }, [test_id, test_history_id]);

  useEffect(() => {
    const fetchPromptHtml = async () => {
      if (testDescUrl && typeof testDescUrl === 'string') {
        if (testDescUrl.startsWith('http')) {
          try {
            const desResponse = await fetch(testDescUrl);
            const htmlText = await desResponse.text();
            setPromptHtml(htmlText);
          } catch (e) {
            setPromptHtml('Failed to load prompt.');
          }
        } else {
          setPromptHtml(testDescUrl);
        }
      } else {
        setPromptHtml('');
      }
    };
    fetchPromptHtml();
  }, [testDescUrl]);

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await createPost({
        productive_test_history_id: test_history_id,
        title: title,
        description: description,
      });
      setSnackbar({
        open: true,
        message: 'Shared to the forum successfully!',
        severity: 'success',
      });
      setTimeout(() => {
        router.push('/student/speaking/${test_id}');
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to share. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box textAlign="center" mb={2}>
        <Typography
          sx={{
            fontSize: 40,
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Share your work
        </Typography>

        <Typography
          sx={{
            color: 'primary.light',
            fontSize: 16,
          }}
        >
          Share your post to get feedback from our community
        </Typography>
      </Box>
      <Box sx={{ maxWidth: 650, mx: 'auto' }}>
        {loading ? (
          <Typography sx={{ color: 'primary.light', mb: 3 }}>Loading your submission...</Typography>
        ) : attempt ? (
          <ShareForumCard
            type="Speaking"
            promptHtml={promptHtml}
            answer={attempt.audio_path}
            answerType="audio"
          />
        ) : (
          <Typography color="error">Submission not found</Typography>
        )}

        <ShareForumForm
          title={title}
          description={description}
          setTitle={setTitle}
          setDescription={setDescription}
          onSubmit={handleShare}
          loading={loading}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
