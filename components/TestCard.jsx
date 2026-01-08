'use client';

import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Divider } from '@mui/material';
import {
  VisibilityOutlined as EyeIcon,
  DeleteOutline as TrashIcon,
  ModeEditOutlineOutlined as PencilIcon,
  PersonOutline as UserIcon,
} from '@mui/icons-material';

const levelTheme = {
  A1: {
    border: 'success.light',
    text: 'success.main',
    bg: 'success.pastel',
    badge: 'success.main',
  },
  A2: { border: 'info.light', text: 'info.main', bg: 'info.pastel', badge: 'info.main' },
  B1: {
    border: 'warning.light',
    text: 'warning.main',
    bg: 'warning.pastel',
    badge: 'warning.main',
  },
  B2: { border: 'error.light', text: 'error.main', bg: 'error.pastel', badge: 'error.main' },
};

const FormatTheme = {
  'Individual speaking': { bg: 'success.greenLight', text: 'success.green_dark' },
  Pronunciation: { bg: 'info.light', text: 'info.main' },
  Essay: { bg: 'success.highlight', text: 'success.main_dark' },
  Article: { bg: 'pink.main', text: 'error.main' },
  Email: { bg: 'darkGrey.light', text: 'white' },
  Translate: { bg: 'success.greenLight', text: 'success.main_dark' },
};

const getFormatCategory = (format) => {
  const writing = ['Essay', 'Email', 'Translate', 'Article'];
  const speaking = ['Individual speaking', 'Pronunciation'];

  if (writing.includes(format)) return { label: format, type: 'writing' };
  if (speaking.includes(format)) return { label: format, type: 'speaking' };
  return { label: format, type: 'other' };
};

const IconButtonAction = ({ icon, color, isDelete = false }) => (
  <Button
    sx={{
      minWidth: '40px',
      height: '40px',
      p: 0,
      borderRadius: '8px',
      border: '1px solid',
      borderColor: isDelete ? 'error.light' : 'currentLevelTheme.badge',
      color: color,
      '&:hover': {
        bgcolor: isDelete ? 'error.main' : color,
        color: 'white',
        borderColor: isDelete ? 'error.main' : color,
      },
    }}
  >
    {React.cloneElement(icon, { sx: { fontSize: 20 } })}
  </Button>
);

const TestCard = ({ title, description, date, submissions, format, level }) => {
  const [randomDelay, setRandomDelay] = useState('0s');

  const currentLevelTheme = levelTheme[level] || levelTheme.A1;
  const formatInfo = format ? getFormatCategory(format) : null;

  // Lấy style cho format badge, mặc định dùng màu của level nếu không tìm thấy format cụ thể
  const currentFormatStyle = FormatTheme[format] || { bg: currentLevelTheme.badge, text: 'white' };

  useEffect(() => {
    setRandomDelay(`${Math.random() * 0.2}s`);
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: currentLevelTheme.bg,
        borderRadius: '16px',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'fadeIn 0.5s ease forwards',
        animationDelay: randomDelay,
        opacity: 0,
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Header: Format Badge and Level Badge */}
      <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
        {formatInfo && (
          <Box
            sx={{
              bgcolor: currentFormatStyle.bg,
              color: currentFormatStyle.text,
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 700,
              //textTransform: 'uppercase'
            }}
          >
            {formatInfo.label}
          </Box>
        )}
        <Box
          sx={{
            marginLeft: 'auto',
            border: '1px solid',
            borderColor: currentLevelTheme.badge,
            color: currentLevelTheme.badge,
            px: 1.2,
            py: 0.4,
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: 'white',
          }}
        >
          Level {level}
        </Box>
      </Box>

      {/* Title & Description */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          mb: 1,
          fontSize: '1.1rem',
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 3,
          flexGrow: 1,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </Typography>

      <Divider
        sx={{ borderStyle: 'dashed', mb: 2, borderColor: currentLevelTheme.border, opacity: 0.3 }}
      />

      {/* Stats Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
          {date}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: currentLevelTheme.badge,
            backgroundColor: 'background.paper',
            borderRadius: '10px',
            py: 0.2,
            px: 1,
          }}
        >
          <UserIcon sx={{ fontSize: 16 }} />
          <Typography
            sx={{
              fontSize: '0.8rem',
            }}
          >
            {submissions} submissions
          </Typography>
        </Box>
      </Box>

      {/* Actions Section */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EyeIcon />}
          sx={{
            bgcolor: 'white',
            color: 'primary.dark',
            borderColor: 'background.paper',
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': {
              borderColor: currentLevelTheme.badge,
              bgcolor: currentLevelTheme.badge,
            },
          }}
        >
          View
        </Button>

        <IconButtonAction icon={<PencilIcon />} color={currentLevelTheme.badge} />

        <IconButtonAction icon={<TrashIcon />} color="error.main" isDelete={true} />
      </Box>
    </Box>
  );
};

export default TestCard;
