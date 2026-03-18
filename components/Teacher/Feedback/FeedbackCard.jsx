'use client';

import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';

export default function FeedbackCard({ feedback, isAi = false }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: isAi ? 'info.light' : 'divider',
        backgroundColor: isAi ? 'info.pastel' : 'background.paper',
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={700}>{feedback.author_name || 'Unknown'}</Typography>
              {isAi && <Chip label="AI" size="small" color="info" />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {feedback.created_at
                ? new Date(feedback.created_at).toLocaleString('vi-VN')
                : 'No timestamp'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
          {feedback.comment || 'No comment content.'}
        </Typography>
      </CardContent>
    </Card>
  );
}
