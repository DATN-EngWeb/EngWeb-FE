'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Button, Box, Typography, Divider, Avatar, Stack, Snackbar } from '@mui/material';
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
import ReplayIcon from '@mui/icons-material/Replay';
import { deleteProductiveTest, deleteReceptiveTest } from '../api/test';
import DeleteConfirmSnackbar from './Teacher/DeleteConfirmSnackbar';
import { formatDate } from '../utils/stringFormat';

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
  A: { color: '#2e7d32' },
  B: { color: '#0288d1' },
  C: { color: '#9c27b0' },
  D: { color: '#d32f2f' },
  E: { color: '#ed6c02' },
  F: { color: '#009688' },
  G: { color: '#c2185b' },
  H: { color: '#455a64' },
  I: { color: '#512da8' },
  J: { color: '#1976d2' },
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

const SkillLabels = {
  R: 'Reading',
  L: 'Listening',
  S: 'Speaking',
  W: 'Writing',
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
        color: 'background.paper',
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
  submitted,
  level,
  test_details,
  role = 'teacher',
  created_by,
  progress_status,
  onDelete,
}) => {
  const [randomDelay, setRandomDelay] = useState('0s');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const currentLevelTheme = levelTheme[level] || levelTheme.A1;
  const formatCode = test_details?.format;

  const formatText = Formatlabels[formatCode];

  const currentFormatStyle = FormatTheme[formatCode] || {
    color: currentLevelTheme.badge,
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

  const displayDate = formatDate(created_at);

  const router = useRouter();

  const handleDelete = () => {
    if (role === 'student' || deleting) return;
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);

    try {
      setDeleting(true);
      if (skill === 'R' || skill === 'L') {
        await deleteReceptiveTest(id);
      } else {
        await deleteProductiveTest(id);
      }
      if (onDelete) {
        onDelete();
      } else {
        router.refresh();
      }
    } catch (err) {
      setDeleteError(`Failed to delete test: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };
  const handleViewTest = () => {
    const skillName = skillMap[skill];
    if (role === 'student') {
      router.push(`/student/${skillName}/${id}`);
    } else {
      router.push(`/teacher/view-test/${skillName}/${id}`);
    }
  };

  const handleEdit = () => {
    const skillName = skillMap[skill];
    router.push(`/teacher/update-test/${skillName}/${id}`);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'P': // Published
        return {
          label: 'Published',
          color: 'success.main',
          icon: <SuccessIcon sx={{ fontSize: '1rem', color: 'success.main' }} />,
        };
      case 'I':
        return {
          label: 'In Review',
          color: 'warning.main',
          icon: <PendingIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />,
        };
      case 'D': // Draft
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
          label: 'DONE',
          color: 'success.main',
          bg: '#e8f5e9',
          icon: <SuccessIcon sx={{ fontSize: '1rem', color: 'success.main' }} />,
        };
      case 'draft':
        return {
          label: 'DRAFT',
          color: 'secondary.dark',
          bg: '#e3f2fd',
          icon: <PendingIcon sx={{ fontSize: '1rem', color: 'secondary.dark' }} />,
        };
      default:
        return {
          label: null,
          icon: null,
        };
    }
  };

  const statusStyle = getStatusStyles(status);
  const submitStyle = getSubmitStyles(progress_status);
  const skillLabel = SkillLabels[skill] || skill || 'Unknown';

  const handleStudentViewTest = () => {
    const skillName = skillMap[skill];
    const targetUrl = `/student/${skillName}/${id}`;

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
        return;
      }
    }
    router.push(targetUrl);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: currentLevelTheme.bg,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: currentLevelTheme.border,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        // height: '100%',
        // width: '440px',
        // maxWidth: '100%',
        // mx: 'auto',
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
          <Typography
            sx={{
              bgcolor: 'background.paper',
              color: currentFormatStyle.color,
              border: '1px solid',
              borderColor: currentFormatStyle.color,
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {formatText}
          </Typography>
        )}
        <Typography
          sx={{
            marginLeft: 'auto',
            border: '1px solid',
            borderColor: currentLevelTheme.badge,
            color: currentLevelTheme.badge,
            px: 1.2,
            py: 0.4,
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            bgcolor: 'background.paper',
            lineHeight: 1,
          }}
        >
          Level {level}
        </Typography>
      </Box>

      {/* Title & Description */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          mb: 0.5,
          fontSize: '1rem',
          lineHeight: 1.3,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 1.5,
          flexGrow: 1,
          lineHeight: 1.4,
          fontSize: '0.8rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
        }}
      >
        {description}
      </Typography>

      <Divider
        sx={{ borderStyle: 'dashed', mb: 1, borderColor: currentLevelTheme.border, opacity: 0.3 }}
      />

      {/* Stats Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        {role === 'student' && created_by ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              src={created_by.avatar}
              alt={created_by.full_name}
              sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}
            >
              {created_by.full_name?.[0] || 'T'}
            </Avatar>
            <Typography variant="caption" fontWeight={500} noWrap sx={{ maxWidth: 120 }}>
              {created_by.full_name}
            </Typography>
          </Stack>
        ) : (
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
            {displayDate}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {role === 'student' && submitStyle.label && (
            <Typography
              sx={{
                bgcolor: submitStyle.bg,
                color: submitStyle.color,
                px: 1.2,
                py: 0.4,
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                lineHeight: 1,
              }}
            >
              {submitStyle.label}
            </Typography>
          )}

          {role === 'student' ? (
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
              {submitted > 0 && (
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                  }}
                >
                  {submitted}
                </Typography>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: currentLevelTheme.badge,
                bgcolor: 'background.paper',
                borderRadius: '999px',
                py: 0.4,
                px: 1.1,
                border: '1px solid',
                borderColor: currentLevelTheme.badge,
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.2 }}>
                {skillLabel}
              </Typography>
            </Box>
          )}
          {role === 'teacher' && (
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
      </Box>

      {/* Actions Section */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          onClick={() => {
            role === 'student' ? handleStudentViewTest() : handleViewTest();
          }}
          startIcon={
            role === 'student' ? (
              progress_status === 'completed' ? (
                <ReplayIcon />
              ) : (
                <Edit fontSize="small" />
              )
            ) : (
              <EyeIcon fontSize="small" />
            )
          }
          sx={{
            bgcolor: 'background.paper',
            color: currentLevelTheme.badge,
            borderColor: currentLevelTheme.badge,
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': {
              borderColor: currentLevelTheme.badge,
              bgcolor: currentLevelTheme.badge,
              color: 'background.paper',
            },
          }}
        >
          {role === 'student'
            ? progress_status === 'completed'
              ? 'Try Again'
              : progress_status === 'draft'
                ? 'Continue'
                : 'Practice'
            : 'View'}
        </Button>

        {role !== 'student' && (
          <>
            {(status === 'I' || status === 'D') && (
              <IconButtonAction
                icon={<PencilIcon />}
                color="primary.main"
                isDelete={false}
                onClick={handleEdit}
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
          </>
        )}
      </Box>

      <DeleteConfirmSnackbar
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        withinParent
      />

      <Snackbar
        open={Boolean(deleteError)}
        autoHideDuration={3000}
        onClose={() => setDeleteError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeleteError('')} severity="error" sx={{ width: '100%' }}>
          {deleteError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestCard;
