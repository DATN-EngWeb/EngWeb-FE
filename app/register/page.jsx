'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState } from 'react';
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
import { Visibility, VisibilityOff } from '@mui/icons-material';

import registerImage from '../../assets/img/register.png';
import { loginStyles } from '../../styles/Login/LoginStyles';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = (e) => {
    e.preventDefault();
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (role === 'teacher') {
        router.push('/upload-certificate');
      } else {
        const redirectUrl = role ? `/login?role=${role}` : '/login';
        router.push(redirectUrl);
      }
    }
  };

  return (
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Image src={registerImage} alt="Register" style={loginStyles.storyImage} />
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography sx={loginStyles.cardEyebrow}>Welcome to NENS</Typography>

          <Box sx={loginStyles.switcherWrapper}>
            <Stack direction="row" sx={loginStyles.switcher}>
              <Link
                href={role ? `/login?role=${role}` : '/login'}
                style={loginStyles.linkNoDecoration}
              >
                <Button disableElevation sx={loginStyles.switchButton}>
                  Login
                </Button>
              </Link>
              <Button
                disableElevation
                sx={{ ...loginStyles.switchButton, ...loginStyles.switchActive }}
              >
                Register
              </Button>
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

            <Button type="submit" variant="contained" sx={loginStyles.primaryButton}>
              Create account
            </Button>
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
