'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import Logo from '../../assets/img/logo.png';
import loginImage from '../../assets/img/login.png';
import googleImage from '../../assets/img/google.png';
import facebookImage from '../../assets/img/facebook-2.png';
import { loginStyles } from '../../styles/Login/LoginStyles';
import { login as loginAPI } from '../../api/accounts';
import { decodeJwt } from '../../utils/jwt';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [currentRole, setCurrentRole] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        setCurrentRole(storedRole);
      } else if (role) {
        setCurrentRole(role);
      }
    }
  }, [role]);

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

    // Get role from currentRole or default to 'S' (Student)
    const role = currentRole === 'teacher' ? 'T' : 'S';

    // Encode role in state parameter
    const state = encodeURIComponent(JSON.stringify({ role }));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;

    window.location.href = authUrl;
  };

  const handleFacebookLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI;
    const scope = process.env.NEXT_PUBLIC_FACEBOOK_SCOPE;

    if (!clientId) {
      setServerError('Facebook OAuth is not configured. Please contact support.');
      return;
    }

    if (!redirectUri) {
      setServerError('Facebook redirect URI is not configured. Please contact support.');
      return;
    }

    if (!scope) {
      setServerError('Facebook scope is not configured. Please contact support.');
      return;
    }

    const role = currentRole === 'teacher' ? 'T' : 'S';
    const state = encodeURIComponent(JSON.stringify({ role }));

    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&state=${state}&response_type=code&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (e) => {
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

        // Save tokens and user info
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
          localStorage.setItem('userId', String(userIdFromToken || ''));
          localStorage.setItem('username', response.username || '');
          localStorage.setItem('userRole', roleFromToken || '');
          localStorage.setItem('avatar', response.avatar || '');
          localStorage.setItem('userStatus', response.status || '');
        }

        // Redirect to home
        router.push('/');
        return;
      }

      // Case 2: Pending Verification - status P
      if (response.require_verification && response.user_id) {
        const userRole = response.role || currentRole || 'student';
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
        const userRole = errorData.role || currentRole || 'student';
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
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Button
          onClick={() => router.push('/')}
          sx={loginStyles.backButton}
          aria-label="Back to home"
        >
          <Image src={Logo} alt="NENS" width={32} height={24} />
        </Button>
        <Image src={loginImage} alt="Login" style={loginStyles.storyImage} />
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography sx={loginStyles.cardEyebrow}>Welcome to NENS</Typography>

          {currentRole && (
            <Box sx={loginStyles.roleBadge}>
              Login as a{' '}
              {currentRole === 'student'
                ? 'student'
                : currentRole === 'teacher'
                  ? 'teacher'
                  : currentRole}
            </Box>
          )}

          <Box sx={loginStyles.switcherWrapper}>
            <Stack direction="row" sx={loginStyles.switcher}>
              <Button
                disableElevation
                sx={{ ...loginStyles.switchButton, ...loginStyles.switchActive }}
              >
                Login
              </Button>

              <Link
                href={role ? `/register?role=${role}` : '/register'}
                style={loginStyles.linkNoDecoration}
              >
                <Button disableElevation sx={loginStyles.switchButton}>
                  Register
                </Button>
              </Link>
            </Stack>
          </Box>

          <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
            {serverError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {serverError}
              </Alert>
            )}

            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>Username or Email</Typography>
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

            <Box sx={loginStyles.fieldContainerSmall}>
              <Typography sx={loginStyles.fieldLabel}>Password</Typography>
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

            <Box sx={loginStyles.formMeta}>
              <FormControlLabel
                control={<Checkbox color="warning" size="small" />}
                label="Remember me"
                sx={loginStyles.rememberMeLabel}
              />
              <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                <Button variant="text" sx={loginStyles.forgotPasswordButton}>
                  Forgot Password ?
                </Button>
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              sx={loginStyles.primaryButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          <Divider sx={loginStyles.divider}>Continue with</Divider>

          <Box sx={loginStyles.socialRow}>
            <Button variant="outlined" sx={loginStyles.socialButton} onClick={handleGoogleLogin}>
              <Box sx={loginStyles.socialButtonContent}>
                <Image src={googleImage} alt="Google" width={15} height={15} />
                Google
              </Box>
            </Button>
            <Button variant="outlined" sx={loginStyles.socialButton} onClick={handleFacebookLogin}>
              <Box sx={loginStyles.socialButtonContent}>
                <Image src={facebookImage} alt="Facebook" width={20} height={20} />
                Facebook
              </Box>
            </Button>
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
