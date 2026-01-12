'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function AudioUploader({ value, onChange, accept }) {
  const inputRef = React.useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    onChange({
      file,
      url: URL.createObjectURL(file),
    });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Box
        onClick={() => inputRef.current?.click()}
        sx={{
          border: '2px dashed #ddd',
          borderRadius: 2,
          p: 4,
          mb: 2,
          textAlign: 'center',
          color: 'text.secondary',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#fafafa' },

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <UploadFileIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography>{value?.file?.name ?? 'Drag and drop audio file here'}</Typography>
        {!value?.file?.name && <Typography variant="caption">Supports MP3, M4A</Typography>}

        {value?.url && (
          <Box mt={2}>
            <audio controls src={value.url} />
          </Box>
        )}
      </Box>
    </>
  );
}
