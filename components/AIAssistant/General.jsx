import { Box, Paper, Stack, Typography } from '@mui/material';

export function GeneralResult({ answer }) {
  const resolvedAnswer = answer?.answer ?? '';
  const keyPoints = Array.isArray(answer?.key_points) ? answer.key_points : [];

  return (
    <Box maxWidth={760} mx="auto">
      <Stack spacing={2}>
        {resolvedAnswer && (
          <Typography fontSize={16} lineHeight={1.6} sx={{ whiteSpace: 'pre-wrap' }}>
            {resolvedAnswer}
          </Typography>
        )}
        {keyPoints.length > 0 && (
          <Stack spacing={1.25}>
            {keyPoints.map((point, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  borderColor: 'rgba(59, 130, 246, 0.16)',
                  bgcolor: '#f8fbff',
                }}
              >
                <Typography fontSize={15} lineHeight={1.5}>
                  {point}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
