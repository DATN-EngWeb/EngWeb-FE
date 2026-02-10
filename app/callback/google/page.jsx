'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import { googleLogin } from '../../../api/accounts';
import { decodeJwt } from '../../../utils/jwt';
import StudentIcon from '../../../assets/img/student.png';
import TeacherIcon from '../../../assets/img/teacher.png';
import { roleModalStyles } from '../../../styles/Login/RoleModalStyles';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [authCode, setAuthCode] = useState(null);

  const processLogin = async (code, role) => {
    try {
      setIsProcessing(true);
      // Call backend API to exchange code for tokens
      const response = await googleLogin(code, role);

      // Save tokens and user info to localStorage (only when tokens are issued)
      if (typeof window !== 'undefined') {
        const decoded = response.access ? decodeJwt(response.access) : null;
        const userIdFromToken = decoded?.user_id;
        const roleFromToken = decoded?.role;

        if (response.access && response.refresh) {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
          localStorage.setItem('userId', String(userIdFromToken || ''));
          localStorage.setItem('username', response.username || '');
          localStorage.setItem('userRole', roleFromToken || '');
          localStorage.setItem('avatar', response.avatar || '');
          localStorage.setItem('userStatus', response.status || '');

          // Save role to cookie for middleware
          if (roleFromToken) {
            document.cookie = `userRole=${roleFromToken}; path=/; max-age=2592000; SameSite=Lax`;
          }
        }
      }

      // Handle redirect based on status
      if (response.status === 'V') {
        // Verified - redirect based on role
        if (response.role === 'T') {
          router.push('/teacher');
        } else {
          router.push('/');
        }
      } else if (response.status === 'I' || response.require_profile) {
        // Incomplete profile - redirect to upload profile
        router.push(`/upload-profile?user_id=${response.user_id}`);
      } else if (response.status === 'W') {
        // Waiting for approval
        setError('Your account is waiting for admin approval');
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
      } else if (response.status === 'D') {
        // Disabled
        setError('Your account has been disabled');
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        // Default redirect to home
        router.push('/');
      }
    } catch (err) {
      // If error occurs and we haven't selected a role yet, prompt for role
      // This assumes the backend failed because role was missing for a new user
      if (!role) {
        setNeedsRoleSelection(true);
        setIsProcessing(false);
        return;
      }

      setError(
        err.message || err.data?.error || 'Failed to authenticate with Google. Please try again.',
      );
      setIsProcessing(false);
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  const handleCallback = useCallback(async () => {
    try {
      // Get code and state from URL query parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setError('No authorization code received from Google');
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      setAuthCode(code);

      // Parse role from state parameter (default to null if not provided)
      let role = null;
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state));
          role = stateData.role;
        } catch (e) {
          // If state parsing fails, we treat role as missing
        }
      }

      // Attempt login with whatever role we have (null or from state)
      processLogin(code, role);
    } catch (err) {
      setError(err.message || err.data?.error || 'Failed to process callback. Please try again.');
      setIsProcessing(false);
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  if (needsRoleSelection) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Box
          sx={{
            ...roleModalStyles.dialogPaper,
            border: 'none',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <Typography sx={roleModalStyles.title}>Welcome to EngApp</Typography>
          <Typography sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
            Please select your role to continue
          </Typography>

          <Box sx={roleModalStyles.cardsContainer}>
            {/* Student Card */}
            <Card
              sx={roleModalStyles.card}
              onClick={() => processLogin(authCode, 'S')}
              role="button"
              tabIndex={0}
            >
              <CardContent sx={roleModalStyles.cardContent}>
                <Box sx={roleModalStyles.iconContainer}>
                  <Image
                    src={StudentIcon}
                    alt="Student"
                    width={180}
                    height={180}
                    style={roleModalStyles.icon}
                  />
                </Box>
                <Box component="span" sx={roleModalStyles.roleButton}>
                  I am a student
                </Box>
              </CardContent>
            </Card>

            {/* Teacher Card */}
            <Card
              sx={roleModalStyles.card}
              onClick={() => processLogin(authCode, 'T')}
              role="button"
              tabIndex={0}
            >
              <CardContent sx={roleModalStyles.cardContent}>
                <Box sx={roleModalStyles.iconContainer}>
                  <Image
                    src={TeacherIcon}
                    alt="Teacher"
                    width={180}
                    height={180}
                    style={roleModalStyles.icon}
                  />
                </Box>
                <Box component="span" sx={roleModalStyles.roleButton}>
                  I am a teacher
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Authentication Error
          </Typography>
          <Typography>{error}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Redirecting to login page...
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Processing Google authentication...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Please wait
      </Typography>
    </Box>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
