'use client';

import ForumIcon from '@mui/icons-material/Forum';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import * as styles from '@/styles/Student/HistoryTestStyles';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useParams, usePathname, useRouter } from 'next/navigation';

export const SidebarForum = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const testId = params?.test_id;
  const skillPath = pathname?.includes('/student/writing/') ? 'writing' : 'speaking';

  const handleVisitForum = () => {
    if (!testId) return;
    router.push(`/student/${skillPath}/${testId}/forum`);
  };

  return (
    <Paper
      sx={{
        ...styles.forumBox,
        p: { xs: 2, md: 3 },
        borderRadius: { xs: '20px', md: '24px' },
        mb: { xs: 2, md: 3 },
      }}
    >
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={isMobile ? 1.25 : 2}
        alignItems="center"
        sx={{ mb: 2, textAlign: isMobile ? 'center' : 'left' }}
      >
        <Box
          sx={{
            bgcolor: theme.palette.reading.tabInactiveBg,
            p: 1.5,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
          }}
        >
          <ForumIcon sx={{ color: theme.palette.primary.main }} />
        </Box>
        <Box textAlign={isMobile ? 'center' : 'left'}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}
          >
            Community Forum
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Join discussions and see shared submissions.
          </Typography>
        </Box>
      </Stack>

      <Button
        fullWidth
        variant="contained"
        startIcon={!isMobile ? <OpenInNewIcon /> : undefined}
        sx={{
          minWidth: isMobile ? 48 : 'auto',
          height: isMobile ? 48 : 44,
          px: isMobile ? 0 : 2,
          bgcolor: theme.palette.warning.main,
          color: theme.palette.primary.main,
          fontWeight: 800,
          borderRadius: '12px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { bgcolor: theme.palette.warning.dark, boxShadow: 'none' },
        }}
        onClick={handleVisitForum}
        aria-label={isMobile ? 'Visit forum' : undefined}
      >
        {isMobile ? <OpenInNewIcon /> : 'Visit Forum'}
      </Button>
    </Paper>
  );
};
