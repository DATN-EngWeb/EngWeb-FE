import React from 'react';
import { Box, Container, Typography, Grid, TextField, Button } from '@mui/material';
import Image from 'next/image';
import { contactFormStyles } from '../styles/ContactFormStyles';
import ContactFormImage from '../assets/contact.png';

export default function ContactForm() {
  return (
    <Box sx={contactFormStyles.mainContainer}>
      <Container maxWidth="lg">
        {/* Header section - centered at top */}
        <Box sx={contactFormStyles.headerSection}>
          <Typography variant="h2" sx={contactFormStyles.mainTitle}>
            Do you have any question?
          </Typography>
          <Typography variant="body1" sx={contactFormStyles.subtitle}>
            Our manager will answer all your questions
          </Typography>
        </Box>

        {/* Content section - image left, form right */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={contactFormStyles.imageContainer}>
              <Box sx={contactFormStyles.image}>
                <Image
                  src={ContactFormImage}
                  alt="Contact Form"
                  width={500}
                  height={400}
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={contactFormStyles.formContainer}>
              <Box component="form" sx={contactFormStyles.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      placeholder="Full Name"
                      variant="outlined"
                      sx={contactFormStyles.textField}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Email"
                      variant="outlined"
                      sx={contactFormStyles.textField}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Your message..."
                  variant="outlined"
                  sx={contactFormStyles.textField}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={contactFormStyles.sendMessageButton}
                >
                  Send Message
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
