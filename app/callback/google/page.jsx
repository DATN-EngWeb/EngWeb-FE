'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { googleLogin } from '../../../api/accounts';
import { decodeJwt } from '../../../utils/jwt';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
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

        // Parse role from state parameter (default to 'S' if not provided)
        let role = 'S';
        if (state) {
          try {
            const stateData = JSON.parse(decodeURIComponent(state));
            role = stateData.role || 'S';
          } catch (e) {
            // If state parsing fails, default to Student
            role = 'S';
          }
        }

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
          }
        }

        // Handle redirect based on status
        if (response.status === 'V') {
          // Verified - redirect to home
          router.push('/');
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
        setError(
          err.message || err.data?.error || 'Failed to authenticate with Google. Please try again.',
        );
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

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
