'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import Logo from '../../assets/img/logo.png';
import registerImage from '../../assets/img/register.png';
import googleImage from '../../assets/img/google.png';
// Force Turbopack reload
import { loginStyles } from '../../styles/Login/LoginStyles';
import { registerUser } from '../../api/accounts.jsx';

import Header from '../../components/Home/Header';

const PASSWORD_CRITERIA = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [currentRole, setCurrentRole] = useState('student');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r) {
      setCurrentRole(r);
      document.cookie = `userRole=${r}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, [searchParams]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    const scope = 'email profile';

    if (!clientId) {
      setServerError('Google OAuth is not configured. Please contact support.');
      return;
    }

    if (!redirectUri) {
      setServerError('Google redirect URI is not configured. Please contact support.');
      return;
    }

    const backendRole = currentRole === 'teacher' ? 'T' : 'S';
    const state = encodeURIComponent(JSON.stringify({ role: backendRole }));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!username.trim()) {
      newErrors.username = 'Please enter your username';
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    } else if (!PASSWORD_CRITERIA.every((c) => c.test(password))) {
      newErrors.password = 'Password does not meet all the requirements below';
    }

    const selectedRole = (currentRole || role || '').toLowerCase();
    if (!['student', 'teacher'].includes(selectedRole)) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);
        const backendRole = selectedRole === 'teacher' ? 'T' : 'S';
        const data = await registerUser({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role: backendRole,
        });

        const userId = data?.user_id;
        if (!userId) {
          throw new Error('Missing user_id from server response');
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('registrationUserId', String(userId));
          localStorage.setItem('registrationRole', selectedRole);
          localStorage.setItem('userRole', selectedRole);
          document.cookie = `userRole=${selectedRole}; path=/; max-age=2592000; SameSite=Lax`;
        }

        router.push(`/verify-otp?user_id=${userId}&role=${selectedRole}`);
      } catch (err) {
        setServerError(err?.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      <Box component="main" sx={{ ...loginStyles.page, height: 'auto', flex: 1 }}>
        <Box component="section" sx={loginStyles.storyPanel}>
          <Box sx={loginStyles.storyImageWrap}>
            <Box sx={loginStyles.innerImageBox}>
              <Image src={registerImage} alt="Register" style={loginStyles.storyImage} />
            </Box>
          </Box>
        </Box>

        <Box component="section" sx={loginStyles.formPanel}>
          <Box sx={loginStyles.formCard}>
            <Typography sx={loginStyles.cardEyebrow}>Welcome to NENS</Typography>
            <Typography
              sx={{
                textAlign: 'center',
                fontSize: { xs: 15, sm: 18, md: 20 },
                fontWeight: 700,
                color: 'primary.dark',
                mb: 2,
                mt: -1,
              }}
            >
              Register
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Stack direction="row" spacing={{ xs: 2, sm: 5, md: 15 }} justifyContent="center">
                <Box
                  onClick={() => {
                    setCurrentRole('student');
                    document.cookie = `userRole=student; path=/; max-age=2592000; SameSite=Lax`;
                    router.push('/register?role=student');
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1.5 },
                    cursor: 'pointer',
                    pb: 1.5,
                    borderBottom: '3px solid',
                    borderColor: currentRole === 'student' ? 'primary.main' : 'transparent',
                    color: currentRole === 'student' ? 'primary.main' : 'text.gray',
                    transition: 'all 0.3s',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 12, sm: 18 },
                      height: { xs: 12, sm: 18 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM12 5.18L18.99 9L12 12.82L5.01 9L12 5.18ZM12 15.82L5 12.06V15.06L12 18.82L19 15.06V12.06L12 15.82Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Student
                  </Typography>
                </Box>
                <Box
                  onClick={() => {
                    setCurrentRole('teacher');
                    document.cookie = `userRole=teacher; path=/; max-age=2592000; SameSite=Lax`;
                    router.push('/register?role=teacher');
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1.5 },
                    cursor: 'pointer',
                    pb: 1.5,
                    borderBottom: '3px solid',
                    borderColor: currentRole === 'teacher' ? 'primary.main' : 'transparent',
                    color: currentRole === 'teacher' ? 'primary.main' : 'text.gray',
                    transition: 'all 0.3s',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 12, sm: 18 },
                      height: { xs: 12, sm: 18 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.33 4 18V20H20V18C20 15.33 14.67 14 12 14Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Teacher
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
              {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {serverError}
                </Alert>
              )}

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>
                  Email Address{' '}
                  <Box component="span" sx={{ color: 'error.dark' }}>
                    *
                  </Box>
                </Typography>
                <TextField
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  placeholder="Enter your Email Address"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.email && {
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

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>
                  User name{' '}
                  <Box component="span" sx={{ color: 'error.dark' }}>
                    *
                  </Box>
                </Typography>
                <TextField
                  name="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) {
                      setErrors({ ...errors, username: '' });
                    }
                  }}
                  placeholder="Enter your User name"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.username && {
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

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>
                  Password{' '}
                  <Box component="span" sx={{ color: 'error.dark' }}>
                    *
                  </Box>
                </Typography>
                <TextField
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.password && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          sx={loginStyles.passwordIconButton}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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

                {(passwordFocused || password.length > 0) && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 3,
                      border: '1.5px solid',
                      borderColor: 'warning.light',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        fontWeight: 600,
                        color: 'text.secondary',
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Password requirements
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: { xs: 0.75, sm: 1 },
                      }}
                    >
                      {PASSWORD_CRITERIA.map((criterion) => {
                        const met = criterion.test(password);
                        return (
                          <Box
                            key={criterion.label}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75,
                            }}
                          >
                            {met ? (
                              <CheckCircle
                                sx={{
                                  fontSize: { xs: 14, sm: 16 },
                                  color: 'success.main',
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <Cancel
                                sx={{
                                  fontSize: { xs: 14, sm: 16 },
                                  color: password.length > 0 ? 'error.main' : 'text.disabled',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <Typography
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                color: met
                                  ? 'success.main'
                                  : password.length > 0
                                    ? 'error.main'
                                    : 'text.secondary',
                                lineHeight: 1.4,
                              }}
                            >
                              {criterion.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>

              {errors.role && (
                <Typography color="error" fontSize="0.9rem">
                  {errors.role}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                sx={loginStyles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </Box>

            <Divider sx={{ ...loginStyles.divider, my: 1.5 }}>Continue with</Divider>

            <Box sx={loginStyles.socialRow}>
              <Button variant="outlined" sx={loginStyles.socialButton} onClick={handleGoogleLogin}>
                <Box sx={loginStyles.socialButtonContent}>
                  <Image src={googleImage} alt="Google" width={15} height={15} />
                  Google
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function Register() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
