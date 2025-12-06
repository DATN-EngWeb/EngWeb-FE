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
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';

import loginImage from '../../assets/img/login.png';
import googleImage from '../../assets/img/google.png';
import facebookImage from '../../assets/img/facebook-2.png';
import { loginStyles } from '../../styles/Login/LoginStyles';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [currentRole, setCurrentRole] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Please enter your username';
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      /* empty */
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
          <ArrowBack />
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
            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>Username</Typography>
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
              <Button variant="text" sx={loginStyles.forgotPasswordButton}>
                Forgot Password ?
              </Button>
            </Box>

            <Button type="submit" variant="contained" sx={loginStyles.primaryButton}>
              Login
            </Button>
          </Box>

          <Divider sx={loginStyles.divider}>Continue with</Divider>

          <Box sx={loginStyles.socialRow}>
            <Button variant="outlined" sx={loginStyles.socialButton}>
              <Box sx={loginStyles.socialButtonContent}>
                <Image src={googleImage} alt="Google" width={15} height={15} />
                Google
              </Box>
            </Button>
            <Button variant="outlined" sx={loginStyles.socialButton}>
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
