import React from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Image from 'next/image';
import WhatMakesUsDifferentImage from '../assets/different.png';
import { whatMakesUsDifferentStyles } from '../styles/WhatMakesUsDifferentStyles';

const features = [
  'Teacher & AI Feedback on Speaking and Writing',
  'Review Past Work and Track Progress',
  'Earn Points and Access Learning Dashboard',
  'Contribute and Download Study Materials',
];

export default function WhatMakesUsDifferent() {
  return (
    <Box sx={whatMakesUsDifferentStyles.mainContainer}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={whatMakesUsDifferentStyles.imageContainer}>
              <Image
                src={WhatMakesUsDifferentImage}
                alt="What makes us different"
                width={380}
                height={340}
                style={{ width: '95%', maxWidth: 420, height: 'auto' }}
              />
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={whatMakesUsDifferentStyles.heading}>
              What makes us different from other
            </Typography>
            <Typography variant="body1" sx={whatMakesUsDifferentStyles.description}>
              Our commitment is to help you improve your English efficiently with personalized
              tools, continuous progress tracking, and interactive learning experiences.
            </Typography>
            <List sx={whatMakesUsDifferentStyles.listContainer}>
              {features.map((feature, index) => (
                <ListItem key={index} sx={whatMakesUsDifferentStyles.listItem}>
                  <ListItemIcon sx={whatMakesUsDifferentStyles.listItemIcon}>
                    <CheckCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={feature} sx={whatMakesUsDifferentStyles.listItemText} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
