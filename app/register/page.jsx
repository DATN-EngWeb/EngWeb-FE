'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import Logo from '../../assets/img/logo.png';
import registerImage from '../../assets/img/register.png';
import { loginStyles } from '../../styles/Login/LoginStyles';
import { registerUser } from '../../api/accounts.jsx';

import Header from '../../components/Home/Header';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';
  const [showPassword, setShowPassword] = useState(false);
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
          <Image src={registerImage} alt="Register" style={loginStyles.storyImage} />
        </Box>

        <Box component="section" sx={loginStyles.formPanel}>
          <Box sx={loginStyles.formCard}>
            <Typography sx={loginStyles.cardEyebrow}>Welcome to NENS</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Stack direction="row" spacing={15} justifyContent="center">
                <Box
                  onClick={() => {
                    setCurrentRole('student');
                    document.cookie = `userRole=student; path=/; max-age=2592000; SameSite=Lax`;
                    router.push('/register?role=student');
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
                    document.cookie = `userRole=teacher; path=/; max-age=2592000; SameSite=Lax`;
                    router.push('/register?role=teacher');
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

            <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>Email Address</Typography>
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
                <Typography sx={loginStyles.fieldLabel}>User name</Typography>
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

              {errors.role && (
                <Typography color="error" fontSize="0.9rem">
                  {errors.role}
                </Typography>
              )}
              {serverError && (
                <Typography color="error" fontSize="0.9rem">
                  {serverError}
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
