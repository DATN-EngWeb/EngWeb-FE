'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Image from 'next/image';
import { contactFormStyles } from '../../styles/Home/ContactFormStyles';
import ContactFormImage from '../../assets/img/contact.png';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate API call
    setLoading(true);
    setSuccess(false);

    try {
      // Simulate 1 second API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({
        fullName: '',
        email: '',
        message: '',
      });
      setSuccess(true);
      setErrors({});

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={contactFormStyles.mainContainer}>
      <Container maxWidth="lg">
        <Box sx={contactFormStyles.headerSection}>
          <Typography variant="h2" sx={contactFormStyles.mainTitle}>
            Do you have any question?
          </Typography>
          <Typography variant="body1" sx={contactFormStyles.subtitle}>
            Our manager will answer all your questions
          </Typography>
        </Box>

        <Box sx={contactFormStyles.mainContentContainer}>
          <Box sx={contactFormStyles.flexBox}>
            <Box sx={contactFormStyles.imageContainer}>
              <Box sx={contactFormStyles.image}>
                <Image
                  src={ContactFormImage}
                  alt="Contact Form"
                  width={500}
                  height={400}
                  style={contactFormStyles.imageStyle}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={contactFormStyles.flexBox}>
            <Box sx={contactFormStyles.formContainer}>
              <Box component="form" onSubmit={handleSubmit} sx={contactFormStyles.form}>
                <Box sx={contactFormStyles.formRow}>
                  <TextField
                    fullWidth
                    name="fullName"
                    placeholder="Full Name"
                    variant="outlined"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    sx={contactFormStyles.textField}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    placeholder="Email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={contactFormStyles.textField}
                    disabled={loading}
                  />
                </Box>
                <TextField
                  fullWidth
                  name="message"
                  multiline
                  rows={5}
                  placeholder="Your message..."
                  variant="outlined"
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                  sx={contactFormStyles.textField}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={contactFormStyles.sendMessageButton}
                  disabled={loading}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Sending...
                    </Box>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ width: '100%' }}>
          Message sent successfully! We will get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
}
