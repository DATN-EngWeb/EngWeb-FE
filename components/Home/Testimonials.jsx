import React from 'react';
import { Box, Container, Typography, Avatar, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { testimonialsStyles } from '../../styles/Home/TestimonialsStyles';
import Image from 'next/image';
import CardImage from '../../assets/card.png';
import AvatarImg from '../../assets/avatar.png';

export default function Testimonials() {
  return (
    <Box sx={testimonialsStyles.mainContainer}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={testimonialsStyles.title}>
          What Students Say About us
        </Typography>
        <Box sx={testimonialsStyles.cardSectionContainer}>
          <IconButton sx={testimonialsStyles.navButton}>
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
              <Box sx={testimonialsStyles.userInfoContainer}>
                <Avatar src={AvatarImg.src} alt="avatar" sx={testimonialsStyles.avatar} />
                <Typography sx={testimonialsStyles.userName}>Anita Smith</Typography>
                <Typography sx={testimonialsStyles.userRole}>English Learner</Typography>
              </Box>

              <Typography sx={testimonialsStyles.text}>
                I recently completed an English course at this education center and I couldn't be
                happier with my experience. The teachers were knowledgeable, experienced, and
                supportive. They used a variety of teaching methods to keep the lessons engaging and
                interactive.
              </Typography>
            </Box>
          </Box>

          <IconButton sx={testimonialsStyles.navButton}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
