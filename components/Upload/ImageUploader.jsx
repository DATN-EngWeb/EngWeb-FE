'use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function ImageUploader({ value, onChange, height = 100 }) {
  const inputRef = React.useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    onChange({
      file,
      url: URL.createObjectURL(file),
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value?.url ? (
        <Box
          component="img"
          src={value.url}
          alt=""
          sx={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      ) : (
        <IconButton
          sx={{
            maxWidth: '100%',
            flexShrink: 1,
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />
        </IconButton>
      )}
    </Box>
  );
}
