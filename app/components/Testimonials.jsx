import React from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function Testimonials() {
  return (
    <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            color: 'primary.main',
            mb: 6,
            textAlign: 'center',
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          What Students Say About us
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              maxWidth: 800,
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 6, position: 'relative' }}>
              {/* Quote marks */}
              <Typography
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  fontSize: '3rem',
                  color: 'success.main',
                  opacity: 0.3,
                }}
              >
                "
              </Typography>
              <Typography
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  fontSize: '3rem',
                  color: 'success.main',
                  opacity: 0.3,
                }}
              >
                "
              </Typography>

              {/* User info */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mr: 2,
                    backgroundColor: '#E0E0E0',
                    fontSize: '2rem',
                  }}
                >
                  👩
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Anika Smith
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    English Learner
                  </Typography>
                </Box>
              </Box>

              {/* Testimonial text */}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  px: 2,
                }}
              >
                I recently completed an English course at this education center and I couldn't be
                happier with my experience. The teachers were knowledgeable, experienced, and
                supportive. They used a variety of teaching methods to keep the lessons engaging and
                interactive.
              </Typography>

              {/* Navigation arrows */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <IconButton
                  sx={{
                    width: 40,
                    height: 40,
                    border: '1px solid',
                    borderColor: 'divider',
                    opacity: 0.5,
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  sx={{
                    width: 40,
                    height: 40,
                    border: '1px solid',
                    borderColor: 'divider',
                    opacity: 0.5,
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
