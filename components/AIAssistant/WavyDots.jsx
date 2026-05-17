import { Box, Stack } from '@mui/material';

export default function WavyDots() {
  return (
    <Stack direction="row" spacing={0.7} alignItems="flex-end" sx={{ height: 12 }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            opacity: 0.5,
            animation: 'wavyDotsFloat 1s ease-in-out infinite',
            animationDelay: `${index * 0.16}s`,
            '@keyframes wavyDotsFloat': {
              '0%, 80%, 100%': {
                transform: 'translateY(0px)',
                opacity: 0.45,
              },
              '40%': {
                transform: 'translateY(-5px)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Stack>
  );
}
