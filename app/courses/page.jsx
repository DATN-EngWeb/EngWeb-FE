import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const courses = [
  {
    title: 'Reading Comprehension',
    description: 'Improve your reading skills with interactive texts and comprehension exercises.',
    level: 'Beginner to Advanced',
    duration: '8 weeks',
  },
  {
    title: 'Listening Practice',
    description: 'Enhance your listening skills with audio lessons and real-world conversations.',
    level: 'Intermediate to Advanced',
    duration: '6 weeks',
  },
  {
    title: 'Writing Skills',
    description: 'Master English writing from basic grammar to advanced essay writing.',
    level: 'All Levels',
    duration: '10 weeks',
  },
  {
    title: 'Speaking Confidence',
    description: 'Build confidence in speaking through practice sessions and feedback.',
    level: 'All Levels',
    duration: '12 weeks',
  },
];

export default function Courses() {
  return (
    <>
      <Header />
      <Box sx={{ py: 8, minHeight: '80vh' }}>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ mb: 6, textAlign: 'center' }}>
            Our Courses
          </Typography>
          <Grid container spacing={4}>
            {courses.map((course, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Level:</strong> {course.level}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {course.duration}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" variant="contained">
                      Enroll Now
                    </Button>
                    <Button size="small">Learn More</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
