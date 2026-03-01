'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, TextField, Typography, Alert, MenuItem } from '@mui/material';
import { ArrowBack, CloudUpload, PictureAsPdf } from '@mui/icons-material';
import { loginStyles } from '../../styles/Login/LoginStyles';
import registerImage from '../../assets/img/register.png';
import { createTeacherProfile } from '../../api/accounts';
import Logo from '../../assets/img/logo.png';

function UploadProfileContent({ userId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    current_workplace: '',
    teacher_type: 'F',
    experience_year: '',
    introduction: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [credentials, setCredentials] = useState([null, null, null]);
  const [credentialPreviews, setCredentialPreviews] = useState([null, null, null]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/register?role=teacher');
    }
  }, [userId, router]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const formPanel = document.querySelector('[data-form-panel]');
    if (formPanel) {
      formPanel.scrollTop = 0;
    }
  }, []);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setServerError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, avatar: 'Please upload an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'File size must be less than 5MB' }));
      return;
    }

    setAvatar(file);
    setErrors((prev) => ({ ...prev, avatar: '' }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCredentialChange = (index) => (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`credential_${index}`]: 'Please upload a PDF, JPEG, or PNG file',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`credential_${index}`]: 'File size must be less than 5MB',
      }));
      return;
    }

    const newCredentials = [...credentials];
    const newPreviews = [...credentialPreviews];

    newCredentials[index] = file;
    setCredentials(newCredentials);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`credential_${index}`];
      // Clear credentials error if at least one file is uploaded
      if (newCredentials.filter((c) => c !== null).length > 0) {
        delete newErrors.credentials;
      }
      return newErrors;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      newPreviews[index] = reader.result;
      setCredentialPreviews([...newPreviews]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCredential = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newCredentials = [...credentials];
    const newPreviews = [...credentialPreviews];
    newCredentials[index] = null;
    newPreviews[index] = null;
    setCredentials(newCredentials);
    setCredentialPreviews(newPreviews);

    // Clear credentials error if still have at least one file
    if (newCredentials.filter((c) => c !== null).length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.credentials;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    if (!avatar) {
      newErrors.avatar = 'Avatar is required';
    }

    if (!formData.current_workplace.trim()) {
      newErrors.current_workplace = 'Current workplace is required';
    }

    if (!formData.teacher_type) {
      newErrors.teacher_type = 'Teacher type is required';
    }

    if (!formData.experience_year || formData.experience_year < 0) {
      newErrors.experience_year = 'Experience years is required and must be 0 or greater';
    }

    if (!formData.introduction.trim()) {
      newErrors.introduction = 'Introduction is required';
    }

    // Validate at least one certificate
    const validCredentials = credentials.filter((cred) => cred !== null);
    if (validCredentials.length === 0) {
      newErrors.credentials = 'At least one certificate is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (!userId) {
        throw new Error('User ID is missing. Please register again.');
      }

      const submitFormData = new FormData();

      // Add user_id
      submitFormData.append('user.id', userId);

      // Add user fields
      submitFormData.append('user.full_name', formData.full_name.trim());
      submitFormData.append('user.date_of_birth', formData.date_of_birth);
      submitFormData.append('user.avatar', avatar);

      // Add teacher fields
      submitFormData.append('current_workplace', formData.current_workplace.trim());
      submitFormData.append('teacher_type', formData.teacher_type);
      submitFormData.append('experience_year', String(formData.experience_year));
      submitFormData.append('introduction', formData.introduction.trim());

      // Append credential files (multiple files with same key)
      validCredentials.forEach((cred) => {
        submitFormData.append('credentials', cred);
      });

      await createTeacherProfile(submitFormData);

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/login?role=teacher');
      }, 2000);
    } catch (err) {
      // Parse backend errors
      const errorData = err?.data || {};
      const newFieldErrors = { ...errors };

      // Handle user field errors
      if (errorData.user) {
        Object.keys(errorData.user).forEach((field) => {
          const errorMsg = Array.isArray(errorData.user[field])
            ? errorData.user[field][0]
            : errorData.user[field];
          newFieldErrors[field] = errorMsg;
        });
      }

      // Handle teacher field errors
      Object.keys(errorData).forEach((field) => {
        if (field !== 'user' && field !== 'detail') {
          const errorMsg = Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field];
          newFieldErrors[field] = errorMsg;
        }
      });

      setErrors(newFieldErrors);

      // Set general error message
      const generalError =
        errorData.detail ||
        err?.message ||
        'Failed to submit profile. Please check the form and try again.';
      setServerError(generalError);
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
        <Image src={registerImage} alt="Complete Profile" style={loginStyles.storyImage} />
      </Box>

      <Box
        component="section"
        data-form-panel
        sx={{
          ...loginStyles.formPanel,
          py: { xs: 2, lg: 2 },
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            ...loginStyles.formCard,
            py: { xs: 2, lg: 2 },
            px: { xs: 2, lg: 4 },
            width: '100%',
            maxWidth: 650,
          }}
        >
          <Typography sx={loginStyles.cardEyebrow}>Complete Your Profile</Typography>
          <Typography
            sx={{
              ...loginStyles.panelTitle,
              fontSize: '1.75rem',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Teacher Profile Information
          </Typography>
          <Typography
            sx={{
              ...loginStyles.panelSubcopy,
              textAlign: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            Please fill in your information to complete your teacher profile. Your account will be
            reviewed by admin before activation.
          </Typography>

          {submitSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 1, color: 'success.main' }}
              >
                Profile submitted successfully!
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Your profile is under review. You will be notified once approved.
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>Redirecting to login...</Typography>
            </Box>
          ) : (
            <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
              {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {serverError}
                </Alert>
              )}

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>Full Name</Typography>
                <TextField
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange('full_name')}
                  placeholder="Enter your full name"
                  fullWidth
                  error={!!errors.full_name}
                  helperText={errors.full_name}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.full_name && {
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
                <Typography sx={loginStyles.fieldLabel}>Date of Birth</Typography>
                <TextField
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange('date_of_birth')}
                  fullWidth
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.date_of_birth && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
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
                <Typography sx={loginStyles.fieldLabel}>Avatar</Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: errors.avatar ? 'error.main' : 'warning.light',
                      borderRadius: '12px',
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'natural.main',
                      },
                    }}
                  >
                    {avatarPreview ? (
                      <Box sx={{ mb: 2 }}>
                        <Box
                          component="img"
                          src={avatarPreview}
                          alt="Avatar preview"
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid',
                            borderColor: 'divider',
                            mb: 1,
                          }}
                        />
                        <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {avatar.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <CloudUpload sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                          Click to upload avatar
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          JPG, PNG (Max 5MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </label>
                {errors.avatar && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      margin: '4px 0 0 0',
                      fontSize: '0.875rem',
                    }}
                  >
                    {errors.avatar}
                  </Typography>
                )}
              </Box>

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>Current Workplace</Typography>
                <TextField
                  name="current_workplace"
                  value={formData.current_workplace}
                  onChange={handleInputChange('current_workplace')}
                  placeholder="Enter your current workplace"
                  fullWidth
                  error={!!errors.current_workplace}
                  helperText={errors.current_workplace}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.current_workplace && {
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
                <Typography sx={loginStyles.fieldLabel}>Teacher Type</Typography>
                <TextField
                  name="teacher_type"
                  select
                  value={formData.teacher_type}
                  onChange={handleInputChange('teacher_type')}
                  fullWidth
                  error={!!errors.teacher_type}
                  helperText={errors.teacher_type}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.teacher_type && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                  }}
                  FormHelperTextProps={{
                    sx: {
                      color: 'error.main',
                      margin: '4px 0 0 0',
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  <MenuItem value="S">School Teacher</MenuItem>
                  <MenuItem value="C">Center Teacher</MenuItem>
                  <MenuItem value="F">Freelance Teacher</MenuItem>
                </TextField>
              </Box>

              <Box sx={loginStyles.fieldContainer}>
                <Typography sx={loginStyles.fieldLabel}>Years of Experience</Typography>
                <TextField
                  name="experience_year"
                  type="number"
                  value={formData.experience_year}
                  onChange={handleInputChange('experience_year')}
                  placeholder="Enter years of experience"
                  fullWidth
                  error={!!errors.experience_year}
                  helperText={errors.experience_year}
                  InputProps={{
                    sx: {
                      ...loginStyles.textFieldInputProps,
                      ...(errors.experience_year && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                  }}
                  inputProps={{
                    sx: loginStyles.textFieldInputPropsPlaceholder,
                    min: 0,
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
                <Typography sx={loginStyles.fieldLabel}>Introduction</Typography>
                <TextField
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange('introduction')}
                  placeholder="Introduce yourself, your teaching experience, and qualifications..."
                  fullWidth
                  multiline
                  rows={5}
                  error={!!errors.introduction}
                  helperText={errors.introduction}
                  InputProps={{
                    sx: {
                      borderRadius: '12px',
                      border: (theme) => `2px solid ${theme.palette.warning.light}`,
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      px: 2,
                      py: 1.5,
                      minHeight: '120px',
                      alignItems: 'flex-start',
                      ...(errors.introduction && {
                        borderColor: 'error.main',
                        border: '2px solid',
                      }),
                    },
                  }}
                  inputProps={{
                    sx: {
                      ...loginStyles.textFieldInputPropsPlaceholder,
                      minHeight: '100px',
                    },
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
                <Typography sx={loginStyles.fieldLabel}>Certificates (Max 3)</Typography>
                {credentials.map((cred, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      id={`credential-upload-${index}`}
                      type="file"
                      onChange={handleCredentialChange(index)}
                    />
                    <label htmlFor={`credential-upload-${index}`}>
                      <Box
                        sx={{
                          border: '2px dashed',
                          borderColor: errors[`credential_${index}`]
                            ? 'error.main'
                            : 'warning.light',
                          borderRadius: '12px',
                          p: 3,
                          textAlign: 'center',
                          backgroundColor: 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'secondary.main',
                            backgroundColor: 'natural.main',
                          },
                        }}
                      >
                        {credentialPreviews[index] ? (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            {cred.type === 'application/pdf' ? (
                              <>
                                <PictureAsPdf sx={{ fontSize: 48, color: 'error.main' }} />
                                <Typography
                                  sx={{
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {cred.name}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Box
                                  component="img"
                                  src={credentialPreviews[index]}
                                  alt={`Certificate ${index + 1} preview`}
                                  sx={{
                                    maxWidth: '100%',
                                    maxHeight: '250px',
                                    width: 'auto',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    objectFit: 'contain',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'block',
                                    mx: 'auto',
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    px: 1,
                                  }}
                                >
                                  {cred.name}
                                </Typography>
                              </>
                            )}
                            <Button
                              variant="text"
                              size="small"
                              onClick={handleRemoveCredential(index)}
                              sx={{
                                color: 'error.main',
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  color: 'error.dark',
                                },
                              }}
                            >
                              Remove
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <CloudUpload sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                              Click to upload certificate {index + 1}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                              PDF, JPG, PNG (Max 5MB)
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </label>
                    {errors[`credential_${index}`] && (
                      <Typography
                        sx={{
                          color: 'error.main',
                          margin: '4px 0 0 0',
                          fontSize: '0.875rem',
                        }}
                      >
                        {errors[`credential_${index}`]}
                      </Typography>
                    )}
                  </Box>
                ))}
                {errors.credentials && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      margin: '8px 0 0 0',
                      fontSize: '0.875rem',
                    }}
                  >
                    {errors.credentials}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                sx={loginStyles.primaryButton}
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Submitting...' : 'Submit Profile'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function UploadProfileWithParams() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');

  return <UploadProfileContent userId={userId} />;
}

export default function UploadProfilePage() {
  return (
    <Suspense
      fallback={
        <Box
          component="main"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      }
    >
      <UploadProfileWithParams />
    </Suspense>
  );
}
