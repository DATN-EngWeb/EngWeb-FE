'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Button, Stack, TextField, Typography, Alert } from '@mui/material';
import { CloudUpload, CheckCircle, PictureAsPdf } from '@mui/icons-material';
import { loginStyles } from '../../styles/Login/LoginStyles';
import registerImage from '../../assets/img/register.png';

export default function UploadCertificate() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, JPEG, or PNG file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setFileType(file.type);
      setError('');

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a certificate file');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUploadSuccess(true);
      setError('');

      setTimeout(() => {
        router.push('/login?role=teacher');
      }, 2000);
    } catch (err) {
      setError('Failed to upload certificate. Please try again.');
    }
  };

  return (
    <Box component="main" sx={loginStyles.page}>
      <Box component="section" sx={loginStyles.storyPanel}>
        <Image src={registerImage} alt="Register" style={loginStyles.storyImage} />
      </Box>

      <Box component="section" sx={loginStyles.formPanel}>
        <Box sx={loginStyles.formCard}>
          <Typography
            sx={{ ...loginStyles.panelTitle, fontSize: '2rem', mb: 2, textAlign: 'center' }}
          >
            Upload Your Certificate
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                ...loginStyles.panelSubcopy,
                textAlign: 'center',
                mx: 'auto',
              }}
            >
              Please upload your teaching certificate or qualification document to complete your
              registration as a teacher.
            </Typography>
          </Box>

          {uploadSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography
                sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 1, color: 'success.main' }}
              >
                Certificate uploaded successfully!
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                Redirecting to login page...
              </Typography>
            </Box>
          ) : (
            <Box component="form" sx={loginStyles.form} onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={loginStyles.fieldContainer}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'warning.light',
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
                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="certificate-upload"
                    type="file"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <Box
                      sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Certificate preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          objectFit: 'contain',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                      <Typography sx={{ color: 'text.primary', fontWeight: 500, mt: 1 }}>
                        {fileName}
                      </Typography>
                    </Box>
                  ) : fileType === 'application/pdf' && selectedFile ? (
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          p: 3,
                        }}
                      >
                        <PictureAsPdf sx={{ fontSize: 64, color: 'error.main' }} />
                        <Typography sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {fileName}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <label htmlFor="certificate-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<CloudUpload />}
                          sx={{
                            mb: 2,
                            borderColor: 'warning.light',
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: 'secondary.main',
                              backgroundColor: 'natural.main',
                            },
                          }}
                        >
                          Choose File
                        </Button>
                      </label>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        PDF, JPEG, or PNG (Max 5MB)
                      </Typography>
                    </Box>
                  )}

                  {selectedFile && (
                    <label htmlFor="certificate-upload">
                      <Button
                        component="span"
                        variant="text"
                        size="small"
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          color: 'primary.main',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Change File
                      </Button>
                    </label>
                  )}
                </Box>
              </Box>

              <Button
                type="submit"
                variant="contained"
                sx={loginStyles.primaryButton}
                disabled={!selectedFile}
              >
                Upload Certificate
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
