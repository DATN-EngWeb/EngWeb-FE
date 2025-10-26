import React from 'react';
import { Box, Container, Typography, Grid, Paper, TextField, Button } from '@mui/material';
import { contactFormStyles } from '../styles/ContactFormStyles';

export default function ContactForm() {
  return (
    <Box sx={contactFormStyles.mainContainer}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Paper elevation={3} sx={contactFormStyles.circularPaper}>
                😕
                <Typography sx={contactFormStyles.questionMark}>?</Typography>
                <Typography sx={contactFormStyles.star}>⭐</Typography>
              </Paper>
              <Button variant="contained" sx={contactFormStyles.anyQuestionButton}>
                Any Question
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={contactFormStyles.textContainer}>
              <Typography variant="h2" sx={contactFormStyles.mainTitle}>
                Do you have any question?
              </Typography>
              <Typography variant="body1" sx={contactFormStyles.subtitle}>
                Our manager will answer all your questions
              </Typography>
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
