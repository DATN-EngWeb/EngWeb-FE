'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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
import { Visibility, VisibilityOff } from '@mui/icons-material';

import loginImage from '../../assets/login.png';
import googleImage from '../../assets/google.png';
import facebookImage from '../../assets/facebook-2.png';
import { loginStyles } from '../../styles/Login/LoginStyles';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Image src={loginImage} alt="Login" style={loginStyles.storyImage} />
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography sx={loginStyles.cardEyebrow}>Welcome to NENS</Typography>

          <Box sx={loginStyles.switcherWrapper}>
            <Stack direction="row" sx={loginStyles.switcher}>
              <Button
                disableElevation
                sx={{ ...loginStyles.switchButton, ...loginStyles.switchActive }}
              >
                Login
              </Button>

              <Link href="/register" style={loginStyles.linkNoDecoration}>
                <Button disableElevation sx={loginStyles.switchButton}>
                  Register
                </Button>
              </Link>
            </Stack>
          </Box>

          <Box component="form" sx={loginStyles.form}>
            {/* Username */}
            <Box sx={loginStyles.fieldContainer}>
              <Typography sx={loginStyles.fieldLabel}>Username</Typography>
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
            <Box sx={loginStyles.fieldContainerSmall}>
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
