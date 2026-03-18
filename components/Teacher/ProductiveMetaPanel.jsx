'use client';

import { Paper, Stack, Typography, Chip, Box } from '@mui/material';

const FORMAT_LABELS = {
  A: 'Email',
  B: 'Article',
  C: 'Story',
  D: 'Essay',
  E: 'Letter',
  F: 'Reviews',
  G: 'Narrative',
  H: 'Description',
  I: 'Social Argument',
  J: 'Read Aloud',
};

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.gray', mb: 0.4 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{value || 'N/A'}</Typography>
    </Box>
  );
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

export default function ProductiveMetaPanel({ metadata }) {
  const formatLabel = FORMAT_LABELS[metadata?.format] || metadata?.format || 'N/A';

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'dark.main',
        boxShadow: '0 4px 12px rgba(61, 30, 25, 0.06)',
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
        Test Information
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
        <Chip
          label={`Level ${metadata?.level || 'N/A'}`}
          size="small"
          sx={{ bgcolor: 'info.pastel' }}
        />
        <Chip
          label={`${metadata?.time ?? 'N/A'} min`}
          size="small"
          sx={{ bgcolor: 'warning.pastel' }}
        />
      </Stack>

      <Stack spacing={1.5}>
        <InfoRow label="Topic" value={metadata?.topic || 'No topic'} />
        <InfoRow label="Format" value={formatLabel} />
        {metadata?.showMinWord && metadata?.minWord !== undefined && metadata?.minWord !== null && (
          <InfoRow
            label="Minimum words"
            value={metadata.minWord === 0 ? 'No minimum requirement' : metadata.minWord}
          />
        )}
        {hasValue(metadata?.audio) && <InfoRow label="Audio" value="Available" />}
        {hasValue(metadata?.image) && <InfoRow label="Image" value="Available" />}
      </Stack>
    </Paper>
  );
}
