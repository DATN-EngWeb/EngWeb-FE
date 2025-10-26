import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const features = [
  'Teacher & AI Feedback on Speaking and Writing',
  'Review Past Work and Track Progress',
  'Earn Points and Access Learning Dashboard',
  'Contribute and Download Study Materials',
];

export default function WhatMakesUsDifferent() {
  return (
    <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={3}
                sx={{
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                  backgroundColor: '#E0E0E0',
                  position: 'relative',
                }}
              >
                👩
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  Content Relevance
                </Box>
              </Paper>
              <Box
                sx={{
                  position: 'absolute',
                  top: 50,
                  right: 50,
                  fontSize: '2rem',
                }}
              >
                📹
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 100,
                  right: 20,
                  fontSize: '1.5rem',
                }}
              >
                🎧
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography
                variant="h2"
                sx={{
                  color: 'primary.main',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                What makes us different from other
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Our commitment is to help you improve your English efficiently with personalized
                tools, continuous progress tracking, and interactive learning experiences.
              </Typography>
              <List sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {features.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon
                      sx={{ minWidth: 40, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
                    >
                      <CheckCircleIcon sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'text.primary',
                          fontSize: '1rem',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
