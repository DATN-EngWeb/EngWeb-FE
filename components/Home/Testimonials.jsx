'use client';
import React, { useState } from 'react';
import { Box, Container, Typography, Avatar, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { testimonialsStyles } from '../../styles/Home/TestimonialsStyles';
import Image from 'next/image';
import CardImage from '../../assets/img/card.png';
import Avatar1 from '../../assets/img/avatar1.png';
import Avatar2 from '../../assets/img/avatar2.png';
import Avatar3 from '../../assets/img/avatar3.jpg';

const feedbacks = [
  {
    img: Avatar1.src,
    name: 'Emma Brown',
    role: 'A2 Learner',
    text: 'This website is very easy to use. I can practice English every day, and the lessons help me learn new words, grammar rules, and simple sentences.',
  },
  {
    img: Avatar2.src,
    name: 'Daniel Kim',
    role: 'B1 Student',
    text: 'I like the reading and listening exercises. They are interesting and help me improve my English. I also enjoy checking my answers after each lesson.',
  },
  {
    img: Avatar3.src,
    name: 'Sophia Wilson',
    role: 'B2 Learner',
    text: 'The practice tests are well organized and similar to real exams. The feedback helps me understand my mistakes and improve my speaking and writing skills.',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? feedbacks.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === feedbacks.length - 1 ? 0 : prevIndex + 1));
  };

  const currentFeedback = feedbacks[currentIndex];

  return (
    <Box sx={testimonialsStyles.mainContainer}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={testimonialsStyles.title}>
          What Students Say About us
        </Typography>
        <Box sx={testimonialsStyles.cardSectionContainer}>
          <IconButton sx={testimonialsStyles.navButton} onClick={handlePrevious}>
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={testimonialsStyles.cardContainer}>
            <Box sx={testimonialsStyles.imageWrapper}>
              <Image
                src={CardImage}
                alt="Testimonial card"
                fill
                style={testimonialsStyles.cardImageStyle}
                priority
              />
            </Box>

            <Box sx={testimonialsStyles.contentOverlay}>
              <Box
                sx={[
                  testimonialsStyles.userInfoContainer,
                  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Avatar
                  src={currentFeedback.img}
                  alt="avatar"
                  sx={[testimonialsStyles.avatar, { mb: 0 }]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography sx={[testimonialsStyles.userName, { textAlign: 'left' }]}>
                    {currentFeedback.name}
                  </Typography>
                  <Typography sx={[testimonialsStyles.userRole, { textAlign: 'left' }]}>
                    {currentFeedback.role}
                  </Typography>
                </Box>
              </Box>

              <Typography sx={testimonialsStyles.text}>{currentFeedback.text}</Typography>
            </Box>
          </Box>

          <IconButton sx={testimonialsStyles.navButton} onClick={handleNext}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
