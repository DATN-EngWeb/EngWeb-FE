'use client';

import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function SumaryPartTab({ questions = [], onNavigateToQuestion }) {
  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        backgroundColor: 'background.paper',
        p: 2,
        borderRadius: '0.5rem',
        border: '1px solid',
        borderColor: 'gray.main',
        height: 'fit-content',
        position: { md: 'sticky' },
        top: '16px',
        mt: 2,
        mb: { xs: '16px', md: 0 },
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontSize: '1rem', fontWeight: 700, color: 'primary.main', mb: 1 }}
      >
        Part Summary
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '0.8rem', md: '0.9rem' },
          color: 'text.gray',
          mb: 2,
          lineHeight: 1.5,
        }}
      >
        Click on a question to review your answer.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {questions.map((q, index) => {
          const isUnanswered = q.isAnswered === false;

          return (
            <Box
              key={q.id}
              onClick={() => onNavigateToQuestion && onNavigateToQuestion(q.id)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.1s',
                '&:hover': { transform: 'scale(1.05)' },
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isUnanswered
                  ? 'darkGrey.light'
                  : q.isCorrect
                    ? 'success.dark'
                    : 'error.dark',
                bgcolor: isUnanswered
                  ? 'gray.light'
                  : q.isCorrect
                    ? 'success.pastel'
                    : 'error.pastel',
                color: isUnanswered ? 'gray.main' : q.isCorrect ? 'success.main' : 'error.main',
              }}
            >
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>Q{index + 1}</Typography>
              {isUnanswered ? (
                <RemoveCircleOutlineIcon sx={{ fontSize: 16 }} />
              ) : q.isCorrect ? (
                <CheckCircleIcon sx={{ fontSize: 16 }} />
              ) : (
                <CancelOutlinedIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
