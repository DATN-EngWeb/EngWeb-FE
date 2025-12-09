'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { facebookLogin } from '../../../api/accounts';
import { decodeJwt } from '../../../utils/jwt';

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const handleCallback = useCallback(async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setError('No authorization code received from Facebook');
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      let role = 'S';
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state));
          role = stateData.role || 'S';
        } catch {
          role = 'S';
        }
      }

      const response = await facebookLogin(code, role);

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

      if (response.status === 'V') {
        router.push('/');
        return;
      }

      if (response.require_profile || response.status === 'I') {
        router.push(`/upload-profile?user_id=${response.user_id}`);
        return;
      }

      if (response.status === 'P') {
        router.push(
          `/verify-otp?type=register&user_id=${response.user_id}&role=${response.role === 'T' ? 'teacher' : 'student'}`,
        );
        return;
      }

      if (response.status === 'W') {
        setError('Your account is waiting for admin approval');
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (response.status === 'D') {
        setError('Your account has been disabled');
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (response.error) {
        setError(response.error);
        setIsProcessing(false);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      router.push('/');
    } catch (err) {
      setError(
        err.message || err.data?.error || 'Failed to authenticate with Facebook. Please try again.',
      );
      setIsProcessing(false);
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

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
        Processing Facebook authentication...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Please wait
      </Typography>
    </Box>
  );
}

export default function FacebookCallback() {
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
      <FacebookCallbackContent />
    </Suspense>
  );
}
