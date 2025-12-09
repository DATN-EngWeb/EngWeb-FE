'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import registerImage from '../../assets/img/register.png';
import { loginStyles } from '../../styles/Login/LoginStyles';
import { forgotPassword } from '../../api/accounts';

function ForgotPasswordContent() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    const newErrors = {};

    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Please enter your username or email';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forgotPassword(usernameOrEmail.trim());

      if (response.username) {
        // Store username for OTP verification
        if (typeof window !== 'undefined') {
          localStorage.setItem('forgotPasswordUsername', response.username);
        }

        setSuccessMessage(response.message || 'OTP code has been sent to your email.');

        // Redirect to verify OTP page after 2 seconds
        setTimeout(() => {
          router.push('/verify-otp?type=forgot_password');
        }, 2000);
      }
    } catch (err) {
      const errorData = err?.data || {};
      const errorStatus = errorData.status;
      const redirectTo = errorData.redirect_to;

      // Handle status-based redirects
      if (errorStatus === 'P' && redirectTo) {
        // Status P: Redirect to verify OTP
        setSuccessMessage(errorData.detail || 'Account not verified. OTP sent to your email.');
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
        return;
      }

      if (errorStatus === 'I' && redirectTo) {
        // Status I: Redirect to upload profile
        setServerError(errorData.detail || 'Please complete your profile first.');
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
        return;
      }

      // Other errors
      const errorMessage =
        errorData.detail || err?.message || 'Failed to send OTP. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Button
          onClick={() => router.push('/login')}
          sx={loginStyles.backButton}
          aria-label="Back to login"
        >
          <ArrowBack />
        </Button>
        <Image src={registerImage} alt="Forgot Password" style={loginStyles.storyImage} />
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography sx={loginStyles.cardEyebrow}>Reset Your Password</Typography>
          <Typography
            sx={{
              ...loginStyles.panelTitle,
              fontSize: '1.75rem',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            sx={{
              ...loginStyles.panelSubcopy,
              textAlign: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            Enter your username or email address. We'll send you an OTP code to reset your password.
          </Typography>

          {successMessage ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 1, color: 'success.main' }}
              >
                {successMessage}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Redirecting to OTP verification...
              </Typography>
            </Box>
          ) : (
            <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
              {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {serverError}
                </Alert>
              )}

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>Username or Email</Typography>
                <TextField
                  name="usernameOrEmail"
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    if (errors.usernameOrEmail) {
                      setErrors({ ...errors, usernameOrEmail: '' });
                    }
                    setServerError('');
                  }}
                  placeholder="Enter your username or email"
                  fullWidth
                  error={!!errors.usernameOrEmail}
                  helperText={errors.usernameOrEmail}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.usernameOrEmail && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                  }}
                  inputProps={{
                    sx: loginStyles.textFieldInputPropsPlaceholder,
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

              <Button
                type="submit"
                variant="contained"
                sx={loginStyles.primaryButton}
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                <Typography sx={{ color: 'text.secondary' }}>Remember your password?</Typography>
                <Link
                  href="/login"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Login
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
