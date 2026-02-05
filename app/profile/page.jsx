'use client';
import { Box, Container, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CoverSection from '../../components/Profile/CoverSection';
import ProfileSettingSection from '../../components/Profile/ProfileSettingSection';
import SecuritySection from '../../components/Profile/SecuritySection';
import { useAuth } from '../../hooks/useAuth';
import { getTeacherProfile, updateTeacherProfile } from '../../api/accounts';

const mapProfileData = (data) => ({
  fullName: data.full_name || '',
  email: data.email || '',
  dateOfBirth: data.date_of_birth || '',
  username: data.username || '',
  avatarUrl: data.avatar_url || '',
  coverUrl: data.cover_url || '',
  introduction: data.introduction || '',
});

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSaving, setIsSaving] = useState(false);
  const originalProfile = useRef(null);
  const { user } = useAuth(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    // Check role - only student can access
    if (user && user.role !== 'S') {
      router.push('/teacher/profile');
      return;
    }

    if (!user?.id || !token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getTeacherProfile(user.id, token)
      .then((data) => {
        const mapped = mapProfileData(data);
        setProfile(mapped);
        originalProfile.current = mapped;
      })
      .catch((err) => {
        showSnackbar('Failed to load profile', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role, token, router]);

  const buildFormData = (sectionData) => {
    const formData = new FormData();
    const orig = originalProfile.current || {};

    if (sectionData.fullName !== undefined && sectionData.fullName !== orig.fullName)
      formData.append('user.full_name', sectionData.fullName);
    if (sectionData.dateOfBirth !== undefined && sectionData.dateOfBirth !== orig.dateOfBirth)
      formData.append('user.date_of_birth', sectionData.dateOfBirth);
    if (sectionData.avatar instanceof File) formData.append('user.avatar', sectionData.avatar);
    if (sectionData.cover instanceof File) formData.append('user.cover', sectionData.cover);

    if (sectionData.introduction !== undefined && sectionData.introduction !== orig.introduction)
      formData.append('introduction', sectionData.introduction);

    return formData;
  };

  const handleSaveSection = async (sectionData) => {
    if (!user?.id || !token) {
      showSnackbar('Authentication required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateTeacherProfile(user.id, buildFormData(sectionData), token);
      const updated = await getTeacherProfile(user.id, token);
      const mapped = mapProfileData(updated);
      setProfile(mapped);
      originalProfile.current = mapped;
      showSnackbar('Profile updated successfully');
    } catch (err) {
      showSnackbar(err.message || 'Failed to update profile', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <CoverSection
          avatarUrl={profile.avatarUrl}
          coverUrl={profile.coverUrl}
          fullName={profile.fullName}
          onSave={handleSaveSection}
          isSaving={isSaving}
          onError={showSnackbar}
        />
        <ProfileSettingSection
          profile={profile}
          setProfile={setProfile}
          onSave={handleSaveSection}
          isSaving={isSaving}
          onError={showSnackbar}
        />
        <SecuritySection onError={showSnackbar} />
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
