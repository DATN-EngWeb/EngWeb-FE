'use client';

import { Box, Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import FeedbackPanel from './FeedbackPanel';

export default function FeedbackTestLayout({ testId, forbidden = false, children }) {
  const router = useRouter();

  if (forbidden) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <Alert severity="warning" sx={{ maxWidth: 420 }}>
          You cannot view feedback for this test. The test must be under review and not created by
          you.
        </Alert>
        <Button variant="outlined" onClick={() => router.back()} sx={{ textTransform: 'none' }}>
          Go back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#f7f7f7' }}
    >
      <Box sx={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto' }}>{children}</Box>

      <Box
        sx={{
          width: { xs: '100%', md: '320px' },
          flexShrink: 0,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f7f7f7',
          borderLeft: '1px solid #e0e0e0',
          p: 2,
        }}
      >
        <FeedbackPanel testId={testId} />
      </Box>
    </Box>
  );
}
