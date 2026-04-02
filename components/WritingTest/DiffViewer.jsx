import React, { useMemo } from 'react';
import { diffWords } from 'diff';
import { Box, Typography, Tooltip, alpha } from '@mui/material';
import theme from '../../theme/theme';

const colors = {
  error: {
    main: theme.palette.error.dark,
    bg: theme.palette.error.pastel,
  },
  success: {
    main: theme.palette.success.dark,
    bg: theme.palette.success.pastel,
  },
  text: {
    primary: theme.palette.text.primary,
    secondary: theme.palette.text.secondary,
  },
};

const DiffViewer = ({ originalText, revisedText }) => {
  // Logic
  const diffChunks = useMemo(() => {
    const diff = diffWords(originalText || '', revisedText || '');
    const result = [];

    for (let i = 0; i < diff.length; i++) {
      const current = diff[i];
      const next = diff[i + 1];

      if (current.removed && next && next.added) {
        result.push({ type: 'replace', old: current.value, new: next.value });
        i++;
      } else if (current.removed) {
        result.push({ type: 'delete', value: current.value });
      } else if (current.added) {
        result.push({ type: 'insert', value: current.value });
      } else {
        result.push({ type: 'equal', value: current.value });
      }
    }
    return result;
  }, [originalText, revisedText]);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box
        sx={{
          lineHeight: 2.2,
          fontSize: '1.1rem',
          fontFamily: 'Inter, "Roboto", "Helvetica", Arial, sans-serif',
          color: colors.text.primary,
          textAlign: 'justify',
          p: { xs: 1, md: 2 },
        }}
      >
        {diffChunks.map((chunk, index) => {
          if (chunk.type === 'equal') {
            return <span key={index}>{chunk.value}</span>;
          }

          if (chunk.type === 'delete') {
            return (
              <Tooltip key={index} title="Error or Extra word" arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    color: alpha(colors.error.main, 0.8),
                    bgcolor: colors.error.bg,
                    textDecoration: 'line-through',
                    textDecorationColor: alpha(colors.error.main, 0.5),
                    px: 0.75,
                    py: 0.25,
                    mx: 0.2,
                    borderRadius: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  {chunk.value}
                </Box>
              </Tooltip>
            );
          }

          if (chunk.type === 'insert' && !chunk.old) {
            return (
              <Tooltip key={index} title="Suggestion to add" arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    color: colors.success.main,
                    bgcolor: colors.success.bg,
                    fontWeight: '600',
                    px: 0.75,
                    py: 0.25,
                    mx: 0.2,
                    borderRadius: 1.5,
                    borderBottom: `2px solid ${alpha(colors.success.main, 0.3)}`,
                  }}
                >
                  {chunk.value}
                </Box>
              </Tooltip>
            );
          }

          if (chunk.type === 'replace') {
            return (
              <Box
                key={index}
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mx: 0.5,
                  verticalAlign: 'middle',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`,
                }}
              >
                <Tooltip title="Old word" arrow placement="top">
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.95em',
                      color: alpha(colors.error.main, 0.7),
                      bgcolor: alpha(colors.error.bg, 0.7),
                      textDecoration: 'line-through',
                      px: 1,
                      py: 0.25,
                    }}
                  >
                    {chunk.old}
                  </Typography>
                </Tooltip>

                <Box
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.8rem',
                    px: 0.2,
                    bgcolor: 'action.hover',
                  }}
                >
                  →
                </Box>

                <Tooltip title="Revised suggestion" arrow placement="top">
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 'inherit',
                      color: colors.success.main,
                      bgcolor: colors.success.bg,
                      fontWeight: '600',
                      px: 1,
                      py: 0.25,
                      borderLeft: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {chunk.new}
                  </Typography>
                </Tooltip>
              </Box>
            );
          }
          return null;
        })}
      </Box>
    </Box>
  );
};

export default DiffViewer;
