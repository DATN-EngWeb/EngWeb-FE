import { Card, CardContent, Typography, Avatar, Box, Button, Chip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CustomAudioPlayer from '../Test/customAudioPlayer';

export default function ForumPostCard({ post }) {
  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        {/* Author */}
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={post.author_avatar} />
          <Box>
            <Typography fontWeight={600}>{post.author_name}</Typography>

            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleDateString()}
              </Typography>

              <Chip label={post.skill} size="small" sx={{ bgcolor: '#6B2C1F', color: 'white' }} />
            </Box>
          </Box>
        </Box>

        {/* Title */}
        <Typography mt={2} fontWeight={700}>
          {post.title}
        </Typography>

        {/* Description */}
        <Typography color="text.secondary" mt={1}>
          {post.description}
        </Typography>

        {/* Audio */}
        {post.audio_path && (
          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <CustomAudioPlayer src={post.audio_path} isActive />
          </Box>
        )}

        {/* Stats */}
        <Box mt={2} display="flex" justifyContent="flex-end" gap={2} color="text.secondary">
          <Box display="flex" alignItems="center" gap={0.5}>
            <FavoriteBorderIcon fontSize="small" />
            {post.like_count}
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <ChatBubbleOutlineIcon fontSize="small" />
            {post.comment_count}
          </Box>
        </Box>

        {/* Divider */}
        <Box mt={2} mb={2} sx={{ borderBottom: '1px dashed #ddd' }} />

        {/* Actions */}
        <Box display="flex" gap={2}>
          <Button fullWidth variant="outlined" startIcon={<FavoriteBorderIcon />}>
            Like
          </Button>

          <Button fullWidth variant="outlined" startIcon={<ChatBubbleOutlineIcon />}>
            Comment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
