'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

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

import registerImage from '../../assets/register.png';
import { loginStyles } from '../../styles/Login/LoginStyles';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
              <Link href="/login" style={loginStyles.linkNoDecoration}>
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

          <Box component="form" sx={loginStyles.form}>
            {/* Email */}
            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>Email Address</Typography>
              <TextField
                name="email"
                placeholder="Enter your Email Address"
                type="email"
                fullWidth
                InputProps={{
                  sx: loginStyles.textFieldInputProps,
                }}
                inputProps={{
                  sx: loginStyles.textFieldInputPropsPlaceholder,
                }}
              />
            </Box>

            {/* Username */}
            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>User name</Typography>
              <TextField
                name="username"
                placeholder="Enter your User name"
                fullWidth
                InputProps={{
                  sx: loginStyles.textFieldInputProps,
                }}
                inputProps={{
                  sx: loginStyles.textFieldInputPropsPlaceholder,
                }}
              />
            </Box>

            {/* Password */}
            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>Password</Typography>
              <TextField
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your Password"
                fullWidth
                InputProps={{
                  sx: loginStyles.textFieldInputProps,
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
