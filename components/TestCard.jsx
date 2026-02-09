'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button, Box, Typography, Divider } from '@mui/material';
import {
  VisibilityOutlined as EyeIcon,
  DeleteOutline as TrashIcon,
  ModeEditOutlineOutlined as PencilIcon,
  PersonOutline as UserIcon,
  CheckCircle as SuccessIcon,
  Autorenew as PendingIcon,
  Description as DraftIcon,
  Edit as Edit,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export const levelTheme = {
  A1: {
    border: 'success.light',
    text: 'success.main',
    bg: 'success.pastel',
    badge: 'success.main',
  },
  A2: { border: 'info.light', text: 'info.main', bg: 'info.pastel', badge: 'info.main' },
  B1: {
    border: 'warning.light',
    text: 'secondary.dark',
    bg: 'warning.pastel',
    badge: 'warning.main',
    borderColor: 'purple.light',
  },
  B2: { border: 'error.light', text: 'error.main', bg: 'error.pastel', badge: 'error.main' },
};

const FormatTheme = {
  A: { bg: 'success.greenLight', text: 'success.green_dark' },
  B: { bg: 'info.light', text: 'info.dark' },
  C: { bg: 'success.highlight', text: 'success.main_dark' },
  D: { bg: 'white', text: 'error.main' },
  E: { bg: 'text.gray', text: 'white' },
  F: { bg: 'success.greenLight', text: 'success.main_dark' },
  G: { bg: 'success.highlight', text: 'success.main_dark' },
  H: { bg: 'error.main', text: 'white' },
  I: { bg: 'purple.pastel', text: 'purple.main' },
  J: { bg: 'text.gray', text: 'warning.main' },
};

const Formatlabels = {
  A: 'Email',
  B: 'Article',
  C: 'Story',
  D: 'Essay',
  E: 'Letter',
  F: 'Reviews',
  G: 'Narrative',
  H: 'Description',
  I: 'Social argument',
  J: 'Read Aloud',
};

const IconButtonAction = ({ icon, color, isDelete = false, onClick }) => (
  <Button
    onClick={onClick}
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

const TestCard = ({
  id,
  title,
  description,
  status,
  skill,
  created_at,
  submissions,
  level,
  test_details,
  progress_status,
}) => {
  const [randomDelay, setRandomDelay] = useState('0s');

  const currentLevelTheme = levelTheme[level] || levelTheme.A1;
  const formatCode = test_details?.format;

  const formatText = Formatlabels[formatCode];
  const userRole = localStorage.getItem('userRole');

  const currentFormatStyle = FormatTheme[formatCode] || {
    bg: currentLevelTheme.badge,
    text: 'white',
  };

  useEffect(() => {
    setRandomDelay(`${Math.random() * 0.2}s`);
  }, []);

  const skillMap = useMemo(
    () => ({
      R: 'reading',
      L: 'listening',
      S: 'speaking',
      W: 'writing',
    }),
    [],
  );

  const displayDate = new Date(created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const router = useRouter();

  const handleEdit = () => {
    skill = skillMap[skill];
    router.push(`/teacher/update-test/${skill}/${id}`);
  };
  const handleDelete = () => {
    // const confirmDelete = confirm("Are you sure you want to delete this test?");
    // if (!confirmDelete) return;
  };
  const handleViewTest = () => {
    skill = skillMap[skill];
    router.push(`/teacher/update-test/${skill}/${id}`);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'P': // Published
        return {
          label: 'Published',
          color: 'success.main',
          icon: <SuccessIcon sx={{ fontSize: '1rem', color: 'success.main' }} />,
        };
      case 'I': // In Review
        return {
          label: 'In review',
          color: 'secondary.dark',
          icon: (
            <PendingIcon
              sx={{
                fontSize: '1rem',
                color: 'secondary.dark',
                animation: 'spin 2s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          ),
        };
      case 'D': // Draft
      default:
        return {
          label: 'Draft',
          color: 'primary.main',
          icon: <DraftIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />,
        };
    }
  };

  const getSubmitStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: <SuccessIcon sx={{ fontSize: 'large', color: 'success.main' }} />,
        };
      case 'draft': // In Review
        return {
          color: 'secondary.dark',
          icon: (
            <PendingIcon
              sx={{
                fontSize: 'large',
                color: 'secondary.dark',
                animation: 'spin 2s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          ),
        };
      case 'none': // Draft
      default:
        return {
          icon: '',
        };
    }
  };

  const statusStyle = getStatusStyles(status);
  const submitStyle = getSubmitStyles(progress_status);

  const handleStudentViewTest = () => {
    {
      skill === 'S'
        ? router.push(`/student/speaking/${id}`)
        : router.push(`/student/writing/${id}`);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: currentLevelTheme.bg,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: currentLevelTheme.border,
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
        {formatText && (
          <Box
            sx={{
              bgcolor: currentFormatStyle.bg,
              color: currentFormatStyle.text,
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {formatText}
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
        {submitStyle.icon}
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
          {displayDate}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: currentLevelTheme.text,
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
        {userRole === 'T' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {statusStyle.icon}
            <Typography
              sx={{
                fontSize: '0.8rem',
                color: statusStyle.color,
              }}
            >
              {statusStyle.label}
            </Typography>
          </Box>
        )}
      </Box>
      {userRole === 'T' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EyeIcon />}
            onClick={() => {
              handleViewTest();
            }}
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

          {status !== 'P' && (
            <IconButtonAction
              icon={<PencilIcon />}
              color={currentLevelTheme.badge}
              onClick={() => {
                handleEdit();
              }}
            />
          )}

          <IconButtonAction
            icon={<TrashIcon />}
            color="error.main"
            isDelete={true}
            onClick={() => {
              handleDelete();
            }}
          />
        </Box>
      )}
      {userRole === 'S' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              handleStudentViewTest();
            }}
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
            {progress_status === 'completed' ? (
              <>
                <EyeIcon sx={{ mr: 1 }} />
                View
              </>
            ) : (
              <>
                <Edit sx={{ mr: 1 }} />
                Practice
              </>
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TestCard;
