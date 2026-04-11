'use client';

import ForumIcon from '@mui/icons-material/Forum';
import * as styles from './../../styles/student/HistoryTestStyles';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { useParams, usePathname, useRouter } from 'next/navigation';

export const SidebarForum = () => {
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
    <Paper sx={styles.forumBox}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: '12px', display: 'flex' }}>
          <ForumIcon color="action" />
        </Box>
        <Box textAlign="left">
          <Typography variant="subtitle2" fontWeight={800}>
            Community Forum
          </Typography>
        </Box>
      </Stack>

      <Button
        fullWidth
        variant="contained"
        sx={{
          bgcolor: '#ffb300',
          color: '#4e342e',
          fontWeight: 800,
          borderRadius: '12px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#ffa000', boxShadow: 'none' },
        }}
        onClick={handleVisitForum}
      >
        Visit Forum
      </Button>
    </Paper>
  );
};
