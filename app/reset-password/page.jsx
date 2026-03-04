'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import Logo from '../../assets/img/logo.png';
import registerImage from '../../assets/img/register.png';
import { loginStyles } from '../../styles/Login/LoginStyles';
import { resetPassword } from '../../api/accounts';

function ResetPasswordContent() {
  const router = useRouter();
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('resetToken');
    if (!token) {
      router.push('/forgot-password');
      return;
    }
    setResetToken(token);
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setServerError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validatePassword()) {
      return;
    }

    if (!resetToken) {
      setServerError('Reset token is missing. Please request password reset again.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword({
        resetToken,
        newPassword: passwordForm.newPassword.trim(),
      });

      setSuccessMessage('Password reset successfully!');

      // Remove reset token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('resetToken');
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err?.message || err?.data?.detail || 'Failed to reset password. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Button
          onClick={() => router.push('/forgot-password')}
          sx={loginStyles.backButton}
          aria-label="Back to forgot password"
        >
          <Image src={Logo} alt="NENS" width={32} height={24} />
        </Button>
        <Image src={registerImage} alt="Reset Password" style={loginStyles.storyImage} />
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography sx={loginStyles.cardEyebrow}>Set New Password</Typography>
          <Typography
            sx={{
              ...loginStyles.panelTitle,
              fontSize: '1.75rem',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Reset Password
          </Typography>
          <Typography
            sx={{
              ...loginStyles.panelSubcopy,
              textAlign: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            Please enter your new password. Make sure it's at least 8 characters long.
          </Typography>

          {successMessage ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 1, color: 'success.main' }}
              >
                {successMessage}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>Redirecting to login page...</Typography>
            </Box>
          ) : (
            <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
              {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {serverError}
                </Alert>
              )}

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>New Password</Typography>
                <TextField
                  name="newPassword"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.newPassword && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('newPassword')}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>Confirm Password</Typography>
                <TextField
                  name="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.confirmPassword && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
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
                      color: 'primary.light',
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
