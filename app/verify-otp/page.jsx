'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Verified } from '@mui/icons-material';
import Logo from '../../assets/img/logo.png';
import registerImage from '../../assets/img/register.png';
import { loginStyles } from '../../styles/Login/LoginStyles';
import {
  resendRegistrationOtp,
  verifyRegistrationOtp,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
} from '../../api/accounts.jsx';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [verifyType, setVerifyType] = useState('register'); // 'register' or 'forgot_password'
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const type = searchParams.get('type') || 'register';
    setVerifyType(type);

    if (type === 'forgot_password') {
      // Forgot password flow - use username
      const storedUsername = localStorage.getItem('forgotPasswordUsername');
      setUsername(storedUsername || '');
    } else {
      // Registration flow - use user_id
      const queryUserId = searchParams.get('user_id');
      const queryRole = searchParams.get('role');
      const storedUserId = localStorage.getItem('registrationUserId');
      const storedRole = localStorage.getItem('registrationRole');

      const resolvedUserId = queryUserId || storedUserId || '';
      const resolvedRole = (queryRole || storedRole || '').toLowerCase();

      setUserId(resolvedUserId);
      setRole(resolvedRole);
    }
  }, [searchParams]);

  const handleBack = () => {
    if (verifyType === 'forgot_password') {
      router.push('/forgot-password');
    } else {
      router.push('/register');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const newErrors = {};
    if (!otpCode.trim()) {
      newErrors.otpCode = 'Please enter your OTP code';
    } else if (!/^\d{6}$/.test(otpCode.trim())) {
      newErrors.otpCode = 'OTP code must be 6 digits';
    }

    if (verifyType === 'forgot_password') {
      if (!username) {
        newErrors.username = 'Missing username. Please request password reset again.';
      }
    } else {
      if (!userId) {
        newErrors.userId = 'Missing user id. Please register again.';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsVerifying(true);

      if (verifyType === 'forgot_password') {
        // Forgot password flow
        const response = await verifyForgotPasswordOtp({
          username,
          otpCode: otpCode.trim(),
        });

        if (response.reset_token) {
          // Store reset token
          if (typeof window !== 'undefined') {
            localStorage.setItem('resetToken', response.reset_token);
            localStorage.removeItem('forgotPasswordUsername');
          }

          setSuccessMessage('OTP verified successfully!');

          setTimeout(() => {
            router.push('/reset-password');
          }, 600);
        }
      } else {
        // Registration flow
        await verifyRegistrationOtp({
          userId,
          otpCode: otpCode.trim(),
        });

        setSuccessMessage('Verified successfully!');

        const nextRole = role || 'student';
        const redirectUrl =
          nextRole === 'teacher' ? `/upload-profile?user_id=${userId}` : `/login?role=${nextRole}`;

        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      }
    } catch (err) {
      setServerError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setServerError('');
    setSuccessMessage('');

    if (verifyType === 'forgot_password') {
      if (!username) {
        setErrors({ username: 'Missing username. Please request password reset again.' });
        return;
      }

      try {
        setIsResending(true);
        await resendForgotPasswordOtp({ username });
        setSuccessMessage('A new OTP has been sent to your email.');
      } catch (err) {
        setServerError(err?.message || 'Failed to resend OTP. Please try again.');
      } finally {
        setIsResending(false);
      }
    } else {
      if (!userId) {
        setErrors({ userId: 'Missing user id. Please register again.' });
        return;
      }

      try {
        setIsResending(true);
        await resendRegistrationOtp({ userId });
        setSuccessMessage('A new OTP has been sent to your email.');
      } catch (err) {
        setServerError(err?.message || 'Failed to resend OTP. Please try again.');
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Button onClick={handleBack} sx={loginStyles.backButton} aria-label="Back to register">
          <Image src={Logo} alt="NENS" width={32} height={24} />
        </Button>
        <Box sx={loginStyles.storyImageWrap}>
          <Box sx={loginStyles.innerImageBox}>
            <Image src={registerImage} alt="Verify OTP" style={loginStyles.storyImage} />
          </Box>
        </Box>
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography
            sx={{
              ...loginStyles.cardEyrow,
              fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.4rem' },
              mb: 0.75,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {verifyType === 'forgot_password' ? 'Verify Password Reset' : 'Verify your account'}
          </Typography>

          <Box sx={{ ...loginStyles.switcherWrapper, mb: 1.5 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Verified color="success" fontSize="small" />
              <Typography
                color="text.primary"
                fontWeight={600}
                sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
              >
                Enter the 6-digit code sent to your email
              </Typography>
            </Stack>
          </Box>

          <Box component="form" sx={loginStyles.form} onSubmit={handleVerify}>
            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>OTP Code</Typography>
              <TextField
                name="otp"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  if (errors.otpCode) {
                    setErrors({ ...errors, otpCode: '' });
                  }
                }}
                placeholder="Enter 6-digit OTP"
                fullWidth
                error={!!errors.otpCode}
                helperText={errors.otpCode}
                InputProps={{
                  sx: {
                    ...loginStyles.textFieldInputProps,
                    ...(errors.otpCode && {
                      borderColor: 'error.main',
                      border: '2px solid',
                    }),
                  },
                  inputMode: 'numeric',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" disabled>
                        <Verified />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  sx: loginStyles.textFieldInputPropsPlaceholder,
                  maxLength: 6,
                }}
                FormHelperTextProps={{
                  sx: {
                    color: 'error.main',
                    margin: '4px 0 0 0',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Box>

            {(errors.userId || errors.username) && (
              <Typography color="error" fontSize="0.9rem">
                {errors.userId || errors.username}
              </Typography>
            )}
            {serverError && (
              <Typography color="error" fontSize="0.9rem">
                {serverError}
              </Typography>
            )}
            {successMessage && (
              <Typography color="success.main" fontSize="0.9rem">
                {successMessage}
              </Typography>
            )}

            <Stack direction="row" spacing={1}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  ...loginStyles.primaryButton,
                  flex: 1,
                  fontSize: { xs: 13, sm: 14 },
                  py: { xs: 0.75, sm: 1 },
                }}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  flex: 1,
                  fontSize: { xs: 13, sm: 14 },
                  py: { xs: 0.75, sm: 1 },
                }}
                disabled={isResending}
                onClick={handleResend}
              >
                {isResending ? 'Resending...' : 'Resend OTP'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <Box
          component="main"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
