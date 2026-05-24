'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import loginImage from '../../assets/img/login.png';
import googleImage from '../../assets/img/google.png';
import { loginStyles } from '../../styles/Login/LoginStyles';
import { login as loginAPI } from '../../api/accounts';
import { decodeJwt } from '../../utils/jwt';
import { useStreakContext } from '../../context/streakContext';

import Header from '../../components/Home/Header';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRole, setCurrentRole] = useState('student');

  const { refreshStreak } = useStreakContext();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setCurrentRole(roleParam);
    }
  }, [searchParams]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleGoogleLogin = () => {
    // ... existing logic ...
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

    // Pass selected role via state parameter
    const backendRole = currentRole === 'teacher' ? 'T' : 'S';
    const state = encodeURIComponent(JSON.stringify({ role: backendRole }));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (e) => {
    // ... existing logic ...
    e.preventDefault();
    setServerError('');
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Please enter your username or email';
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginAPI({
        username: username.trim(),
        password: password.trim(),
      });

      // Case 1: Success - status V (Verified)
      if (response.access && response.refresh && response.status === 'V') {
        const decoded = decodeJwt(response.access);
        const userIdFromToken = decoded?.user_id;
        const roleFromToken = decoded?.role;

        if (roleFromToken === 'S' && currentRole === 'teacher') {
          setServerError(
            'Your account does not have teacher access. Please log in as a student or contact support.',
          );
          return;
        }

        if (roleFromToken === 'T' && currentRole === 'student') {
          setServerError(
            'Your account does not have student access. Please log in as a teacher or contact support.',
          );
          return;
        }

        // Save tokens to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
          localStorage.setItem('userId', String(userIdFromToken || ''));
          localStorage.setItem('username', response.username || '');
          localStorage.setItem('userRole', roleFromToken || '');
          localStorage.setItem('avatar', response.avatar || '');
          localStorage.setItem('full_name', response.full_name || '');
          localStorage.setItem('userStatus', response.status || '');

          // Save role to cookie for middleware
          document.cookie = `userRole=${roleFromToken}; path=/; max-age=2592000; SameSite=Lax`;
        }
        refreshStreak();

        // Redirect based on role or explicit redirect param
        const redirectUrl = searchParams.get('redirect');

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (roleFromToken === 'T') {
          router.push('/teacher');
        } else {
          router.push('/');
        }
        return;
      }

      // Case 2: Pending Verification - status P
      if (response.require_verification && response.user_id) {
        const userRole = response.role || 'student';
        router.push(`/verify-otp?user_id=${response.user_id}&role=${userRole}`);
        return;
      }

      // Case 3: Incomplete Profile - status I
      if (response.require_certificate && response.user_id) {
        router.push(`/upload-profile?user_id=${response.user_id}`);
        return;
      }

      // Case 4: Waiting Approval - status W
      if (response.status === 'W') {
        setServerError('Account pending approval. Please wait for admin review.');
        return;
      }

      // Case 5: Disabled - status D
      if (response.status === 'D') {
        setServerError('Account has been disabled.');
        return;
      }

      // Fallback: unexpected response
      setServerError('Login failed. Please try again.');
    } catch (err) {
      // Handle error response
      const errorData = err?.data || {};

      // Check if it's a status-based error (P, I, W, D)
      if (errorData.require_verification && errorData.user_id) {
        const userRole = errorData.role || 'student';
        router.push(`/verify-otp?user_id=${errorData.user_id}&role=${userRole}`);
        return;
      }

      if (errorData.require_certificate && errorData.user_id) {
        router.push(`/upload-profile?user_id=${errorData.user_id}`);
        return;
      }

      if (errorData.status === 'W') {
        setServerError('Account pending approval. Please wait for admin review.');
        return;
      }

      if (errorData.status === 'D') {
        setServerError('Account has been disabled.');
        return;
      }

      // Default error message
      setServerError(err?.message || 'Invalid username/email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      <Box component="main" sx={{ ...loginStyles.page, height: 'auto', flex: 1 }}>
        <Box component="section" sx={loginStyles.storyPanel}>
          <Image src={loginImage} alt="Login" style={loginStyles.storyImage} />
        </Box>

        <Box component="section" sx={loginStyles.formPanel}>
          <Box sx={loginStyles.formCard}>
            <Typography sx={loginStyles.cardEyebrow}>Welcome to NENS</Typography>

            {/* Role Toggle - Student/Teacher */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Stack direction="row" spacing={15} justifyContent="center">
                <Box
                  onClick={() => {
                    setCurrentRole('student');
                    router.push('/login?role=student');
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    pb: 1.5,
                    borderBottom: '3px solid',
                    borderColor: currentRole === 'student' ? 'primary.main' : 'transparent',
                    color: currentRole === 'student' ? 'primary.main' : 'text.gray',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM12 5.18L18.99 9L12 12.82L5.01 9L12 5.18ZM12 15.82L5 12.06V15.06L12 18.82L19 15.06V12.06L12 15.82Z"
                      fill="currentColor"
                    />
                  </svg>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>Student</Typography>
                </Box>
                <Box
                  onClick={() => {
                    setCurrentRole('teacher');
                    router.push('/login?role=teacher');
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    pb: 1.5,
                    borderBottom: '3px solid',
                    borderColor: currentRole === 'teacher' ? 'primary.main' : 'transparent',
                    color: currentRole === 'teacher' ? 'primary.main' : 'text.gray',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.33 4 18V20H20V18C20 15.33 14.67 14 12 14Z"
                      fill="currentColor"
                    />
                  </svg>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>Teacher</Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              component="form"
              sx={{ ...loginStyles.form, gap: 1.5, mt: 2 }}
              onSubmit={handleSubmit}
            >
              <Box sx={{ ...loginStyles.fieldContainer, mb: 1 }}>
                <Typography sx={loginStyles.fieldLabel}>
                  Username or Email{' '}
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
                  placeholder="Enter your username or email"
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

              <Box sx={{ ...loginStyles.fieldContainerSmall, mb: 0.5 }}>
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
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Button variant="text" sx={loginStyles.forgotPasswordButton}>
                    Forgot Password ?
                  </Button>
                </Link>
              </Box>

              {serverError && (
                <Alert severity="error" sx={{ py: 0.5, my: 0 }}>
                  {serverError}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                sx={{ ...loginStyles.primaryButton, mt: 0.5, py: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
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

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
