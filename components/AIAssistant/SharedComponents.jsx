import { useState } from 'react';
import { Button, IconButton, Tooltip, Paper, Stack, Box, Typography } from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';

export function CopyButton({ text, compact = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(text || '');
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (compact) {
    return (
      <Tooltip title={copied ? 'Copied' : 'Copy'}>
        <IconButton onClick={handleCopy} size="small" sx={{ color: 'text.secondary' }}>
          {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      size="small"
      startIcon={copied ? <CheckIcon /> : <CopyIcon />}
      onClick={handleCopy}
      sx={{
        borderRadius: '999px',
        textTransform: 'none',
        fontSize: 12,
        minWidth: 'auto',
        color: 'text.secondary',
        borderColor: 'transparent',
        '&:hover': {
          borderColor: 'rgba(15, 23, 42, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.03)',
        },
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

export function SectionCard({
  icon: Icon,
  label,
  children,
  iconTone = 'blue',
  sx = {},
  rightSlot = null,
}) {
  const iconTones = {
    blue: { bg: 'rgba(59, 130, 246, 0.12)', fg: 'rgb(37, 99, 235)' },
    green: { bg: 'rgba(16, 185, 129, 0.14)', fg: 'rgb(5, 150, 105)' },
    red: { bg: 'rgba(239, 68, 68, 0.14)', fg: 'rgb(220, 38, 38)' },
    violet: { bg: 'rgba(168, 85, 247, 0.15)', fg: 'rgb(147, 51, 234)' },
  };

  const tone = iconTones[iconTone] || iconTones.blue;

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 4,
        p: 2,
        bgcolor: 'background.paper',
        border: '1px solid rgba(15, 23, 42, 0.07)',
        boxShadow: '0 10px 26px rgba(15, 23, 42, 0.045)',
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mb={1.5}
        justifyContent={rightSlot ? 'space-between' : 'flex-start'}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: tone.bg,
              color: tone.fg,
            }}
          >
            <Icon fontSize="small" />
          </Box>

          <Typography fontSize={14} fontWeight={600}>
            {label}
          </Typography>
        </Stack>

        {rightSlot}
      </Stack>

      {children}
    </Paper>
  );
}
