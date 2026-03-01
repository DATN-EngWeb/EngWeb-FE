import { Paper, Box, Button, Avatar, Typography, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useEffect, useState } from 'react';
import { coverSectionStyles } from '../../styles/Profile/ProfileStyles';

export default function CoverSection({ avatarUrl, coverUrl, fullName, onSave, isSaving, onError }) {
  const [editing, setEditing] = useState(false);
  const [cover, setCover] = useState(coverUrl || null);
  const [avatar, setAvatar] = useState(avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    setCover(coverUrl || null);
    setAvatar(avatarUrl || null);
  }, [coverUrl, avatarUrl]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(URL.createObjectURL(file));
      setCoverFile(file);
    }
  };

  const handleSave = async () => {
    try {
      if (onSave && (avatarFile || coverFile)) {
        const sectionData = {};
        if (avatarFile) sectionData.avatar = avatarFile;
        if (coverFile) sectionData.cover = coverFile;
        await onSave(sectionData);
        setAvatarFile(null);
        setCoverFile(null);
      }
      setEditing(false);
    } catch (err) {
      if (onError) onError(err.message || 'Failed to save profile', 'error');
    }
  };

  const handleCancel = () => {
    setAvatar(avatarUrl || null);
    setCover(coverUrl || null);
    setAvatarFile(null);
    setCoverFile(null);
    setEditing(false);
  };

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          ...coverSectionStyles.coverContainer,
          backgroundImage: cover ? `url(${cover})` : 'none',
        }}
      >
        {!editing && (
          <Button
            size="small"
            variant="contained"
            sx={coverSectionStyles.editButton}
            onClick={() => setEditing(true)}
          >
            Change avatar & cover
          </Button>
        )}

        {editing && (
          <>
            <Button component="label" sx={coverSectionStyles.coverCameraButton}>
              <PhotoCameraIcon sx={{ color: '#333' }} />
              <input hidden type="file" accept="image/*" onChange={handleCoverChange} />
            </Button>

            <Box sx={coverSectionStyles.actionButtons}>
              <Button size="small" variant="outlined" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="small" variant="contained" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Box sx={coverSectionStyles.avatarSection}>
        <Box sx={coverSectionStyles.avatarWrapper}>
          <Avatar src={avatar || ''} sx={coverSectionStyles.avatar}>
            {fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          {editing && (
            <IconButton component="label" sx={coverSectionStyles.avatarCameraButton} size="small">
              <PhotoCameraIcon sx={{ fontSize: 18 }} />
              <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
            </IconButton>
          )}
        </Box>
        <Box>
          <Typography variant="h6">{fullName}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
