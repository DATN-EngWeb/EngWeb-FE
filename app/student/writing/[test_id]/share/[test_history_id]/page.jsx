/* global fetch */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Container, Button, Snackbar, Alert } from '@mui/material';
import ShareForumCard from '../../../../../../components/Forum/ShareForumCard';
import ShareForumForm from '../../../../../../components/Forum/ShareForumForm';
import { getProductiveTest, getProductiveTestDetails } from '../../../../../../api/test';
import { createPost } from '../../../../../../api/forum';

export default function WritingSharePage() {
  const params = useParams();
  const router = useRouter();
  const { test_id, test_history_id } = params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [promptHtml, setPromptHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchAttemptAndPrompt = async () => {
      try {
        setLoading(true);
        const historyData = await getProductiveTest(test_id);
        const historyList = Array.isArray(historyData) ? historyData : (historyData?.results ?? []);
        const found = historyList.find((item) => String(item.id) === String(test_history_id));
        setAttempt(found);
        // Get description from testDetails.productive_test.description
        const testDetails = await getProductiveTestDetails(test_id);
        const desc = testDetails?.productive_test?.description;
        if (desc && typeof desc === 'string' && desc.startsWith('http')) {
          try {
            const res = await fetch(desc);
            const html = await res.text();
            setPromptHtml(html);
          } catch (e) {
            setPromptHtml('Failed to load prompt.');
          }
        } else {
          setPromptHtml(desc || '');
        }
      } catch (err) {
        setAttempt(null);
        setPromptHtml('');
      } finally {
        setLoading(false);
      }
    };
    if (test_id && test_history_id) fetchAttemptAndPrompt();
  }, [test_id, test_history_id]);

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
        router.push(`/student/writing/${test_id}`);
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
            type="Writing"
            promptHtml={promptHtml}
            answer={attempt.user_answer_text}
            answerType="text"
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
