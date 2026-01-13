'use client';
import { Box, Container } from '@mui/material';
import { useState } from 'react';
import CoverSection from '../../../components/Profile/CoverSection';
import InformationSection from '../../../components/Profile/InformationSection';
import CertificationSection from '../../../components/Profile/CertificationSection';
import ProfileSettingSection from '../../../components/Profile/ProfileSettingSection';
import SecuritySection from '../../../components/Profile/SecuritySection';

export default function TeacherProfile() {
  const [profile, setProfile] = useState({
    employmentType: 'Freelance',
    experienceYear: '2',
    workplace: 'Ho Chi Minh city',
    introduction: 'Professional teacher with many students',
    fullName: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    dateOfBirth: '1990-01-01',
    role: 'Teacher',
    username: 'teacherx',
  });

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <CoverSection />
        <InformationSection profile={profile} setProfile={setProfile} />
        <CertificationSection />
        <ProfileSettingSection profile={profile} setProfile={setProfile} />
        <SecuritySection username={profile.username} />
      </Container>
    </Box>
  );
}
