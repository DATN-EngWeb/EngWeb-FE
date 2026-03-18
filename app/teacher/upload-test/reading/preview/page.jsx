'use client';

import { useState, useEffect } from 'react';
import ReadingPreview from '../../../../../components/Teacher/ReadingTest/ReadingPreview';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function PreviewPage() {
  const [testData, setTestData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = window.sessionStorage.getItem('readingTestPreviewData');
      if (savedData) {
        try {
          setTestData(JSON.parse(savedData));
        } catch (e) {
          // Silent catch or use a proper logger to avoid no-console warning
        }
      }
    }
  }, []);

  if (!testData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Loading preview data...</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Back to Editor
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100vw', bgcolor: 'background.default' }}>
      <ReadingPreview open={true} onClose={() => router.back()} testData={testData} />
    </Box>
  );
}
