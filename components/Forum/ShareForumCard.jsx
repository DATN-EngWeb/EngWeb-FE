import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomAudioPlayer from '../Test/customAudioPlayer';

export default function ShareForumCard({ type, promptHtml, answer, answerType }) {
  return (
    <Box
      sx={{
        border: '2px solid #7c6a5e',
        borderRadius: 4,
        bgcolor: '#fff',
        mb: 2,
        boxShadow: '0 2px 12px 0 rgba(123, 106, 94, 0.08)',
        px: 3,
        py: 2.5,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'inline-block',
          position: 'relative',
          bgcolor: 'primary.main',
          color: '#fff',
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 0.5,
          boxShadow: '0 1px 4px 0 rgba(107,63,29,0.08)',
        }}
      >
        {type}
      </Box>

      <Box sx={{ mt: 1, mb: 3 }}>
        <div dangerouslySetInnerHTML={{ __html: promptHtml }} />
      </Box>

      {answerType === 'audio' && answer && (
        <Box
          sx={{
            bgcolor: 'natural.main',
            borderRadius: 2,
            p: 2,
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography fontWeight={700} sx={{ color: '#222', mb: 1, fontSize: 17 }}>
            Your answer
          </Typography>
          <CustomAudioPlayer src={answer} isActive />
        </Box>
      )}
      {answerType === 'text' && answer && (
        <Box
          sx={{
            bgcolor: 'natural.main',
            borderRadius: 2,
            p: 2,
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1, fontSize: 17 }}>
            Your answer
          </Typography>
          <Typography sx={{ fontSize: 16, whiteSpace: 'pre-line' }}>{answer}</Typography>
        </Box>
      )}
    </Box>
  );
}
