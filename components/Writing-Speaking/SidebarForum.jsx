import ForumIcon from '@mui/icons-material/Forum';
import * as styles from './../../styles/student/HistoryTestStyles';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const SidebarForum = ({ count = 0 }) => (
  <Paper elevation={0} sx={styles.forumBox}>
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: '12px', display: 'flex' }}>
        <ForumIcon color="action" />
      </Box>
      <Box textAlign="left">
        <Typography variant="subtitle2" fontWeight={800}>
          Community Forum
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {count} discussions
        </Typography>
      </Box>
    </Stack>
    <Button
      fullWidth
      variant="contained"
      endIcon={<OpenInNewIcon />}
      sx={{
        bgcolor: '#ffb300',
        color: '#4e342e',
        fontWeight: 800,
        borderRadius: '12px',
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': { bgcolor: '#ffa000', boxShadow: 'none' },
      }}
    >
      Visit Forum
    </Button>
  </Paper>
);
