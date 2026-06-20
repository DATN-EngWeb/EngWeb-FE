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
        const historyList = Array.isArray(historyData) ? historyData : (historyData?.results ?? []);
        const found = historyList.find((item) => String(item.id) === String(test_history_id));
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
    if (title.length > 100) {
      setSnackbar({
        open: true,
        message: 'Title cannot exceed 100 characters.',
        severity: 'error',
      });
      return;
    }
    try {
      const post = await createPost({
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
        router.replace(`/student/speaking/${test_id}/forum?open_post=${post.id}`);
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
    <Container maxWidth={false} sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3, md: 6 } }}>
      <Box textAlign="center" mb={2}>
        <Typography
          sx={{
            fontSize: { xs: 28, sm: 34, md: 40 },
            fontWeight: 700,
            color: 'primary.main',
          }}
        >
          Share your work
        </Typography>

        <Typography
          sx={{
            color: 'primary.light',
            fontSize: { xs: 14, sm: 15, md: 16 },
          }}
        >
          Share your post to get feedback from our community
        </Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 4 },
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1, width: '100%' }}>
            {loading ? (
              <Typography sx={{ color: 'primary.light', mb: 3 }}>
                Loading your submission...
              </Typography>
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
          </Box>

          <Box sx={{ flex: 1, width: '100%' }}>
            <ShareForumForm
              title={title}
              description={description}
              setTitle={setTitle}
              setDescription={setDescription}
              onSubmit={handleShare}
              loading={loading}
            />
          </Box>
        </Box>

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
