import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function ShareForumForm({
  title,
  description,
  setTitle,
  setDescription,
  onSubmit,
  loading,
}) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: { xs: 14, sm: 16 } }}>Title</Typography>
        <TextField
          placeholder="Give your post a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#ffffff',
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: { xs: 14, sm: 16 } }}>
          Description
        </Typography>
        <TextField
          placeholder="Share your thoughts, difficulties, or what you learned..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={5}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#ffffff',
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SendIcon />}
          disabled={loading}
          sx={{
            bgcolor: '#6b3f1d',
            px: { xs: 3, sm: 4 },
            py: 1.4,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: 14, sm: 16 },
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              bgcolor: '#5a3318',
            },
          }}
        >
          Share to Forum
        </Button>
      </Box>
    </Box>
  );
}
