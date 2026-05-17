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

        {isAi ? (
          <Box
            sx={{
              color: 'text.primary',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              '& h3': {
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'text.primary',
                mt: 2,
                mb: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                padding: '8px 12px',
                borderRadius: 1,
                borderLeft: '4px solid',
                borderLeftColor: 'primary.main',
              },
              '& h3:first-of-type': {
                mt: 0,
              },
              '& p': {
                m: 0,
                mb: 1.25,
                lineHeight: 1.75,
              },
              '& ul': {
                m: 0,
                mb: 1.25,
                pl: 2.5,
                listStyleType: 'disc',
              },
              '& ol': {
                m: 0,
                mb: 1.25,
                pl: 2.5,
                listStyleType: 'decimal',
              },
              '& ul li, & ol li': {
                mb: 0.75,
                lineHeight: 1.65,
              },
              '& li': {
                mb: 0.75,
                lineHeight: 1.65,
              },
              '& strong': {
                fontWeight: 700,
              },
              '& em': {
                fontStyle: 'italic',
              },
            }}
            dangerouslySetInnerHTML={{ __html: feedback.comment || '<p>No comment content.</p>' }}
          />
        ) : (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {feedback.comment || 'No comment content.'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
