'use client';
import { Box, Container, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CoverSection from '../../../components/Profile/CoverSection';
import InformationSection from '../../../components/Profile/InformationSection';
import CertificationSection from '../../../components/Profile/CertificationSection';
import ProfileSettingSection from '../../../components/Profile/ProfileSettingSection';
import SecuritySection from '../../../components/Profile/SecuritySection';
import { useAuth } from '../../../hooks/useAuth';
import { getTeacherProfile, updateTeacherProfile } from '../../../api/accounts';

const mapProfileData = (data) => ({
  employmentType: data?.teacher_type || '',
  experienceYear: data?.experience_year?.toString() || '',
  workplace: data?.current_workplace || '',
  introduction: data?.introduction || '',
  fullName: data?.full_name || '',
  email: data?.email || '',
  dateOfBirth: data?.date_of_birth || '',
  role: data?.role || 'T',
  username: data?.username || '',
  avatarUrl: data?.avatar_url || '',
  coverUrl: data?.cover_url || '',
  credentials: Array.isArray(data?.credentials) ? data.credentials : [],
});

export default function TeacherProfile() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth('/login');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSaving, setIsSaving] = useState(false);
  const [credentialsChanges, setCredentialsChanges] = useState({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const buildFormData = useCallback((sections) => {
    const formData = new FormData();

    // User fields
    if (sections.user?.username !== undefined)
      formData.append('user.username', sections.user.username);
    if (sections.user?.email !== undefined) formData.append('user.email', sections.user.email);
    if (sections.user?.fullName !== undefined)
      formData.append('user.full_name', sections.user.fullName);
    if (sections.user?.dateOfBirth !== undefined)
      formData.append('user.date_of_birth', sections.user.dateOfBirth);
    if (sections.user?.avatar instanceof File) formData.append('user.avatar', sections.user.avatar);
    if (sections.user?.cover instanceof File) formData.append('user.cover', sections.user.cover);

    // Teacher fields
    if (sections.teacher?.currentWorkplace !== undefined)
      formData.append('teacher.current_workplace', sections.teacher.currentWorkplace);
    if (sections.teacher?.teacherType !== undefined)
      formData.append('teacher.teacher_type', sections.teacher.teacherType);
    if (sections.teacher?.experienceYear !== undefined)
      formData.append('teacher.experience_year', sections.teacher.experienceYear);
    if (sections.teacher?.introduction !== undefined)
      formData.append('teacher.introduction', sections.teacher.introduction);

    // Credentials state and files
    if (
      sections.credentialsState &&
      Array.isArray(sections.credentialsState) &&
      sections.credentialsState.length > 0
    ) {
      formData.append('teacher.credentials_state', JSON.stringify(sections.credentialsState));

      // Append credential files
      if (sections.credentialsFiles && typeof sections.credentialsFiles === 'object') {
        Object.entries(sections.credentialsFiles).forEach(([id, file]) => {
          if (file instanceof File) {
            formData.append(`credentials_${id}`, file);
          }
        });
      }
    }

    return formData;
  }, []);

  const handleSaveSection = useCallback(
    async (sectionData) => {
      if (!user?.id || !token) {
        showSnackbar('Authentication required', 'error');
        return;
      }

      setIsSaving(true);
      try {
        const response = await updateTeacherProfile(user.id, sectionData);
        setProfile(mapProfileData(response?.data));
        setCredentialsChanges({});
        showSnackbar(response?.message || 'Profile updated successfully', 'success');
      } catch (err) {
        showSnackbar(err?.message || 'Failed to update profile', 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [user?.id, token],
  );

  const handleSaveCover = (sectionData) => {
    const data = buildFormData({
      user: { avatar: sectionData?.avatar, cover: sectionData?.cover },
      teacher: {},
    });
    handleSaveSection(data);
  };

  const handleSaveInformation = () => {
    const sectionData = buildFormData({
      teacher: {
        currentWorkplace: profile.workplace,
        teacherType: profile.employmentType,
        experienceYear: profile.experienceYear,
        introduction: profile.introduction,
      },
    });
    handleSaveSection(sectionData);
  };

  const handleSaveCertifications = () => {
    const credentialsState = Object.entries(credentialsChanges).map(([id, change]) => ({
      id: parseInt(id),
      choice: change.choice,
    }));
    const sectionData = buildFormData({
      credentialsState,
      credentialsFiles: Object.fromEntries(
        Object.entries(credentialsChanges)
          .filter(([, change]) => change.file instanceof File)
          .map(([id, change]) => [id, change.file]),
      ),
    });
    handleSaveSection(sectionData);
  };

  const handleSaveProfileSettings = () => {
    const sectionData = buildFormData({
      user: {
        fullName: profile.fullName,
        email: profile.email,
        dateOfBirth: profile.dateOfBirth,
      },
    });
    handleSaveSection(sectionData);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id || !token) {
      setIsLoading(false);
      return;
    }

    if (user.role && user.role !== 'T') {
      router.push('/profile');
      return;
    }

    setIsLoading(true);
    setError('');
    getTeacherProfile(user.id, token)
      .then((data) => {
        setProfile(mapProfileData(data));
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load profile');
      })
      .finally(() => setIsLoading(false));
  }, [authLoading, user?.id, user?.role, token, router]);

  if (isLoading || authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">{error && <Alert severity="error">{error}</Alert>}</Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <CoverSection
          avatarUrl={profile.avatarUrl}
          coverUrl={profile.coverUrl}
          fullName={profile.fullName}
          roleLabel="Teacher"
          onSave={handleSaveCover}
          isSaving={isSaving}
          onError={showSnackbar}
        />
        <InformationSection
          profile={profile}
          setProfile={setProfile}
          onSave={handleSaveInformation}
          isSaving={isSaving}
          onError={showSnackbar}
        />
        <CertificationSection
          credentials={profile.credentials}
          credentialsChanges={credentialsChanges}
          setCredentialsChanges={setCredentialsChanges}
          onSave={handleSaveCertifications}
          isSaving={isSaving}
          onError={showSnackbar}
        />
        <ProfileSettingSection
          profile={profile}
          setProfile={setProfile}
          onSave={handleSaveProfileSettings}
          isSaving={isSaving}
          onError={showSnackbar}
        />
        <SecuritySection username={profile.username} email={profile.email} onError={showSnackbar} />
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
