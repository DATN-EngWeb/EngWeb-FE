import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldIcon from '@mui/icons-material/Shield';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { forgotPassword, verifyForgotPasswordOtp, resetPassword } from '../../api/accounts';
import { securitySectionStyles } from '../../styles/Profile/ProfileStyles';

export default function SecuritySection({ username, email, onSave, isSaving, onError }) {
  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username || '');

  // Password reset modal state
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1: verify, 2: otp, 3: newpassword
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      if (onError) onError('Username cannot be empty', 'error');
      return;
    }

    if (newUsername === username) {
      setEditUsername(false);
      return;
    }

    try {
      if (onSave) {
        await onSave({ newUsername, type: 'username' });
      }
      setEditUsername(false);
    } catch (err) {
      if (onError) onError(err.message || 'Failed to update username', 'error');
      setNewUsername(username);
    }
  };

  const handleCancelUsername = () => {
    setNewUsername(username);
    setEditUsername(false);
  };

  const handleOpenPasswordModal = () => {
    setPasswordStep(1);
    setOtpCode(['', '', '', '', '', '']);
    setNewPassword('');
    setNewPasswordConfirm('');
    setResetToken('');
    setOpenPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
    setPasswordStep(1);
    setResetToken('');
  };

  const handleSendCode = async () => {
    try {
      await forgotPassword(username ? username : email);
      setPasswordStep(2);
      if (onError) onError('Verification code sent to your email', 'success');
    } catch (err) {
      if (onError) onError(err.message || 'Failed to send code', 'error');
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto move to next field
    if (value && index < 5) {
      const nextField = document.getElementById(`otp-${index + 1}`);
      nextField?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullOtp = otpCode.join('');
    if (fullOtp.length !== 6) {
      if (onError) onError('Please enter the 6-digit code', 'error');
      return;
    }

    try {
      const response = await verifyForgotPasswordOtp({
        username: username ? username : email,
        otpCode: fullOtp,
      });
      if (response.reset_token) {
        setResetToken(response.reset_token);
      }
      setPasswordStep(3);
    } catch (err) {
      if (onError) onError(err.message || 'Invalid code', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      if (onError) onError('New password is required', 'error');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      if (onError) onError('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      if (onError) onError('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword });
      if (onError) onError('Password reset successfully', 'success');
      handleClosePasswordModal();
    } catch (err) {
      if (onError) onError(err.message || 'Failed to reset password', 'error');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={3}>
        Security
      </Typography>

      <Box mb={3}>
        <Typography fontWeight={500}>Username</Typography>
        <Typography color="text.secondary">{username}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography fontWeight={500}>Password</Typography>
        <Box display="flex" justifyContent="space-between" mt={1} alignItems="center">
          <Typography color="text.secondary">••••••••••••</Typography>
          <Button variant="outlined" onClick={handleOpenPasswordModal} disabled={isSaving}>
            Change
          </Button>
        </Box>
      </Box>

      {/* Password Reset Modal */}
      <Dialog open={openPasswordModal} onClose={handleClosePasswordModal} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4 }}>
          {/* Step 1: Verify Identity */}
          {passwordStep === 1 && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box sx={securitySectionStyles.iconBox}>
                  <ShieldIcon sx={{ color: '#1B9CFC' }} />
                </Box>
                <Typography variant="h5" fontWeight={600}>
                  Verify Your Identity
                </Typography>
              </Box>

              <Typography color="text.secondary" mb={3}>
                We'll send a verification code to {email || 'your email'}.
              </Typography>

              <Box
                sx={{
                  bgcolor: '#FAF4F1',
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <EmailIcon sx={{ color: '#C9B1FF', fontSize: 24 }} />
                <Typography>Do you want to continue resetting password?</Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Button variant="outlined" fullWidth onClick={handleClosePasswordModal}>
                  Cancel
                </Button>
                <Button variant="contained" fullWidth onClick={handleSendCode} disabled={isSaving}>
                  {isSaving ? <CircularProgress size={20} /> : 'Send code'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Enter OTP */}
          {passwordStep === 2 && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button
                  onClick={() => setPasswordStep(1)}
                  startIcon={<ArrowBackIcon />}
                  sx={{ color: 'text.primary' }}
                >
                  Back
                </Button>
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box sx={securitySectionStyles.iconBox}>
                  <LockIcon sx={{ color: '#F8B600' }} />
                </Box>
                <Typography variant="h5" fontWeight={600}>
                  Enter Verification Code
                </Typography>
              </Box>

              <Typography color="text.secondary" mb={3}>
                We've sent a 6-digit code to {email || 'your email'}. Enter it below to continue.
              </Typography>

              <Box display="flex" gap={1} mb={3} justifyContent="center">
                {otpCode.map((digit, index) => (
                  <TextField
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: 20, fontWeight: 600 },
                    }}
                    sx={{
                      width: 48,
                      '& input': { padding: '12px 8px' },
                    }}
                  />
                ))}
              </Box>

              <Typography color="text.secondary" textAlign="center" mb={3}>
                Didn't receive the code? <Button size="small">Resend</Button>
              </Typography>

              <Box display="flex" gap={2}>
                <Button variant="outlined" fullWidth onClick={() => setPasswordStep(1)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerifyCode}
                  disabled={isSaving || otpCode.join('').length !== 6}
                >
                  {isSaving ? <CircularProgress size={20} /> : 'Verify Code'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 3: Create New Password */}
          {passwordStep === 3 && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button
                  onClick={() => setPasswordStep(2)}
                  startIcon={<ArrowBackIcon />}
                  sx={{ color: 'text.primary' }}
                >
                  Back
                </Button>
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Typography variant="h5" fontWeight={600}>
                  Create New Password
                </Typography>
              </Box>

              <Typography color="text.secondary" mb={3}>
                Your identity has been verified. Please create a new secure password.
              </Typography>

              <Box mb={3}>
                <Typography fontWeight={500} mb={1}>
                  New Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSaving}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              <Box mb={3}>
                <Typography fontWeight={500} mb={1}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  disabled={isSaving}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        edge="end"
                        size="small"
                      >
                        {showPasswordConfirm ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              <Box display="flex" gap={2}>
                <Button variant="outlined" fullWidth onClick={() => setPasswordStep(2)}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleResetPassword}
                  disabled={isSaving || !newPassword || !newPasswordConfirm}
                >
                  {isSaving ? <CircularProgress size={20} /> : 'Reset Password'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
