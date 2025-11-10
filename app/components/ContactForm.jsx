import React from 'react';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import Image from 'next/image';
import { contactFormStyles } from '../styles/ContactFormStyles';
import ContactFormImage from '../assets/contact.png';

export default function ContactForm() {
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
              <Box component="form" sx={contactFormStyles.form}>
                <Box sx={contactFormStyles.formRow}>
                  <TextField
                    fullWidth
                    placeholder="Full Name"
                    variant="outlined"
                    sx={contactFormStyles.textField}
                  />
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Email"
                    variant="outlined"
                    sx={contactFormStyles.textField}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
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
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
